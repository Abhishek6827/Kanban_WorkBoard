from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from boards.views_web import dashboard

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
    
    path('', dashboard, name='dashboard'),
    path('admin/', admin.site.urls),
    path('api/', include('boards.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('boards/', include('boards.urls_web')),
]