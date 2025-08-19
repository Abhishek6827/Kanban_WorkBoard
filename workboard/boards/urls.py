from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView,
    LogoutView,
    CurrentUserView,
    CSRFTokenView,
    BoardViewSet,
    TaskViewSet,
    UserViewSet,
    UserAssignmentsView,
    UserAssignedBoardsView
)

router = DefaultRouter()
router.register(r'boards', BoardViewSet)
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('users/me/', CurrentUserView.as_view(), name='current_user'),
    path('csrf/', CSRFTokenView.as_view(), name='csrf_token'),
    path('users/<int:user_id>/assignments/', UserAssignmentsView.as_view(), name='user_assignments'),
    path('users/<int:user_id>/assigned-boards/', UserAssignedBoardsView.as_view(), name='user_assigned_boards'),
]