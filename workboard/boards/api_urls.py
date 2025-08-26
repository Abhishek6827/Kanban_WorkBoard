from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, LogoutView, SignUpView, CurrentUserView,
    CSRFTokenView, APIRootView, BoardViewSet, TaskViewSet,
    UserViewSet, UserAssignmentsView, UserAssignedBoardsView,
    TaskStatusUpdateView
)

router = DefaultRouter()
router.register(r'boards', BoardViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('csrf/', CSRFTokenView.as_view(), name='csrf-token'),
    path('users/me/', CurrentUserView.as_view(), name='current-user'),
    path('users/<int:user_id>/assignments/', UserAssignmentsView.as_view(), name='user-assignments'),
    path('users/<int:user_id>/assigned-boards/', UserAssignedBoardsView.as_view(), name='user-assigned-boards'),
    path('tasks/<int:task_id>/status/', TaskStatusUpdateView.as_view(), name='task-status-update'),
    path('', include(router.urls)),
]