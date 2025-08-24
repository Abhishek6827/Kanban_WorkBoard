# boards/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Board, Task

# Use get_user_model() to get the custom user model
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
    
    def validate_email(self, value):
        """
        Check that the email is unique.
        """
        # Check if email already exists (excluding current instance if updating)
        if self.instance:
            if User.objects.filter(email__iexact=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("A user with this email already exists.")
        else:
            if User.objects.filter(email__iexact=value).exists():
                raise serializers.ValidationError("A user with this email already exists.")
        return value

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    assignee_email = serializers.EmailField(
        write_only=True, 
        required=False, 
        allow_null=True, 
        allow_blank=True
    )
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

    def validate_assignee_email(self, value):
        # Allow empty or null values
        if not value or value.strip() == '':
            return None
            
        # Validate email format
        if '@' not in value:
            raise serializers.ValidationError("Enter a valid email address.")
            
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        assignee_email = validated_data.pop('assignee_email', None)
        assignee = None
        
        if assignee_email:
            try:
                assignee = User.objects.get(email__iexact=assignee_email)
            except User.DoesNotExist:
                # Return proper error message without wrapping
                raise serializers.ValidationError(
                    {"assignee_email": "User with this email does not exist."}
                )
        
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
                assignee = User.objects.get(email__iexact=assignee_email)
            except User.DoesNotExist:
                # Return proper error message without wrapping
                raise serializers.ValidationError(
                    {"assignee_email": "User with this email does not exist."}
                )
        
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
        # Remove owner from validated_data if it exists to avoid duplicate argument
        validated_data.pop('owner', None)
        board = Board.objects.create(owner=user, **validated_data)
        return board

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if user != instance.owner:
            raise serializers.ValidationError({"detail": "You don't have permission to edit this board."})
        
        # Remove owner from validated_data if it exists
        validated_data.pop('owner', None)
        
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        
        return instance
class TaskStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['status']

    # boards/serializers.py - TaskSerializer update method
def update(self, instance, validated_data):
    try:
        user = self.context['request'].user
        if user != instance.created_by and user != instance.board.owner and user != instance.assignee:
            raise serializers.ValidationError({"detail": "You don't have permission to edit this task."})
        
        assignee_email = validated_data.pop('assignee_email', None)
        assignee = None
        
        if assignee_email:
            try:
                assignee = User.objects.get(email__iexact=assignee_email)
            except User.DoesNotExist:
                raise serializers.ValidationError({"assignee_email": "User with this email does not exist."})
        
        validated_data['assignee'] = assignee
        return super().update(instance, validated_data)
    
    except Exception as e:
        # Log the actual error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error updating task: {str(e)}")
        logger.error(f"Validated data: {validated_data}")
        logger.error(f"Instance: {instance}")
        raise serializers.ValidationError({"detail": f"An error occurred while updating the task: {str(e)}"})