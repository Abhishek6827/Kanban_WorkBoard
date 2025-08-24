# boards/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Board, Task

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    assignee_email = serializers.EmailField(write_only=True, required=False, allow_null=True)
    created_by = UserSerializer(read_only=True)
    board = serializers.PrimaryKeyRelatedField(queryset=Board.objects.all())

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'assignee', 'assignee_email', 
                  'created_by', 'board', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def validate_board(self, value):
        user = self.context['request'].user
        if value.owner != user:
            raise serializers.ValidationError("You don't have permission to add tasks to this board.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        assignee_email = validated_data.pop('assignee_email', None)
        assignee = None
        
        if assignee_email:
            try:
                assignee = User.objects.get(email=assignee_email)
            except User.DoesNotExist:
                raise serializers.ValidationError({"assignee_email": "User with this email does not exist."})
        
        validated_data['created_by'] = user
        validated_data['assignee'] = assignee
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if user != instance.created_by and user != instance.board.owner and user != instance.assignee:
            raise serializers.ValidationError({"detail": "You don't have permission to edit this task."})
        
        assignee_email = validated_data.pop('assignee_email', None)
        assignee = None
        
        if assignee_email:
            try:
                assignee = User.objects.get(email=assignee_email)
            except User.DoesNotExist:
                raise serializers.ValidationError({"assignee_email": "User with this email does not exist."})
        
        validated_data['assignee'] = assignee
        return super().update(instance, validated_data)

class BoardSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Board
        fields = ['id', 'name', 'description', 'tasks', 'owner', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']

    def create(self, validated_data):
        user = self.context['request'].user
        board = Board.objects.create(owner=user, **validated_data)
        return board

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if user != instance.owner:
            raise serializers.ValidationError({"detail": "You don't have permission to edit this board."})
        return super().update(instance, validated_data)

class TaskStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['status']

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if user != instance.created_by and user != instance.board.owner and user != instance.assignee:
            raise serializers.ValidationError({"detail": "You don't have permission to update this task."})
        return super().update(instance, validated_data)