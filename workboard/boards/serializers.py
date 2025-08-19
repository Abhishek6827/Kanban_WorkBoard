from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Board, Task

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='assignee', 
        allow_null=True, 
        required=False,
        write_only=True
    )
    created_by = UserSerializer(read_only=True)
    board = serializers.PrimaryKeyRelatedField(queryset=Board.objects.all())

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'assignee', 'assignee_id', 'created_by', 'board', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_board(self, value):
        user = self.context['request'].user
        if value.owner != user:
            raise serializers.ValidationError("You don't have permission to add tasks to this board.")
        return value

    def validate(self, data):
        if self.instance is None and 'board' not in data:
            raise serializers.ValidationError({"board": "This field is required when creating a task."})
        return data

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if user != instance.created_by and user != instance.board.owner and user != instance.assignee:
            raise serializers.ValidationError({"detail": "You don't have permission to edit this task."})
        return super().update(instance, validated_data)

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)

class BoardSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Board
        fields = ['id', 'name', 'description', 'tasks', 'owner', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.pop('owner', None) 
        board = Board.objects.create(owner=user, **validated_data)
        return board

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if user != instance.owner:
            raise serializers.ValidationError({"detail": "You don't have permission to edit this board."})
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['tasks'] = TaskSerializer(instance.tasks.all(), many=True, context=self.context).data
        return representation

class AssignmentSerializer(serializers.ModelSerializer):
    board = BoardSerializer(read_only=True)
    task = TaskSerializer(read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'board', 'task', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AssignedBoardSerializer(serializers.ModelSerializer):
    tasks = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id', 'name', 'description', 'tasks', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_tasks(self, obj):
        user = self.context['request'].user
        tasks = obj.tasks.filter(assignee=user)
        return TaskSerializer(tasks, many=True).data