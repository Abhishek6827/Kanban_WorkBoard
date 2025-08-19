from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from boards.views import (
    BoardViewSet, TaskViewSet, UserViewSet,
    LoginView, LogoutView, CurrentUserView, CSRFTokenView, CustomAuthToken
)

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
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/', include('boards.urls')),
    path('api-auth/', include('rest_framework.urls')),
]