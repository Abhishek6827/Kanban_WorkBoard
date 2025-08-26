from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from boards.views_web import dashboard, boards_list, tasks_list, board_create, board_edit, task_create, task_edit  # Import all views

def api_root(request):
    return JsonResponse({
        'message': 'WorkBoard API',
        'version': '1.0',
        'endpoints': {
            'api': '/api/',
            'admin': '/admin/',
            'boards': '/api/boards/',
            'tasks': '/api/tasks/',
            'users': '/api/users/',
            'login': '/api/login/',
            'logout': '/api/logout/',
        },
        'frontend': 'http://localhost:5173'
    })

urlpatterns = [
    # Homepage - Dashboard
    path('', dashboard, name='home'),
    
    # Web pages
    path('dashboard/', dashboard, name='dashboard'),
    path('boards/', boards_list, name='boards_list'),
    path('tasks/', tasks_list, name='tasks_list'),
    path('boards/create/', board_create, name='board_create'),
    path('boards/<int:board_id>/edit/', board_edit, name='board_edit'),
    path('tasks/create/', task_create, name='task_create'),
    path('tasks/<int:task_id>/edit/', task_edit, name='task_edit'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/', include('boards.urls')),
    
    # REST framework auth
    path('api-auth/', include('rest_framework.urls')),
]

# Add error handlers
handler404 = 'boards.views_web.handler404'
handler500 = 'boards.views_web.handler500'