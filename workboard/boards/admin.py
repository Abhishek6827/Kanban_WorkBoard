# boards/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Board, Task

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    pass

@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'board', 'status', 'assignee', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description']