from django.db import models
from django.contrib.auth import get_user_model

def get_default_user():
    User = get_user_model()
    return User.objects.get_or_create(username='default_user')[0].id

class Board(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='boards'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']  

class Task(models.Model):
    STATUS_CHOICES = [
        ('To-Do', 'To-Do'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    board = models.ForeignKey(
        Board,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='To-Do'
    )
    assignee = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='created_tasks',
        default=get_default_user
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at'] 

# serializers.py
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