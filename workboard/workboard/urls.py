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

router = DefaultRouter()
router.register(r'boards', BoardViewSet)
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/', include('boards.urls')),
    path('api/', include(router.urls)),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/users/me/', CurrentUserView.as_view(), name='current_user'),
    path('api/csrf/', CSRFTokenView.as_view(), name='csrf_token'),
    path('api-auth/', include('rest_framework.urls')),
    path('api/login/', CustomAuthToken.as_view(), name='api_token_auth'),
]