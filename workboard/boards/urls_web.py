from django.urls import path
from . import views_web

urlpatterns = [
    path('', views_web.dashboard, name='dashboard'),
    path('boards/', views_web.boards_list, name='boards_list'),
    path('boards/create/', views_web.board_create, name='board_create'),
    path('boards/<int:board_id>/', views_web.board_detail, name='board_detail'),
    path('boards/<int:board_id>/edit/', views_web.board_edit, name='board_edit'),
    path('tasks/', views_web.tasks_list, name='tasks_list'),
    path('tasks/create/', views_web.task_create, name='task_create'),
    path('tasks/<int:task_id>/edit/', views_web.task_edit, name='task_edit'),
]