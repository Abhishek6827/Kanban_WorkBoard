# boards/views.py
from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import action
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import Http404
from django.middleware.csrf import get_token
from .models import Board, Task
from .serializers import BoardSerializer, TaskSerializer, UserSerializer, TaskStatusUpdateSerializer
from django.contrib.auth import get_user_model
import logging
from django.core.cache import cache
from django.utils import timezone

# Use get_user_model() to get the custom user model
User = get_user_model()

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        # Input validation
        if not username or not password:
            return Response(
                {'error': 'Please provide both username and password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check for empty strings
        if not username.strip() or not password.strip():
            return Response(
                {'error': 'Username and password cannot be empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Simple rate limiting (optional)
        ip_address = self.get_client_ip(request)
        cache_key = f'login_attempts_{ip_address}'
        attempts = cache.get(cache_key, 0)
        
        if attempts >= 5:  # Allow 5 attempts per IP
            return Response(
                {'error': 'Too many login attempts. Please try again later.'}, 
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Check if user exists
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Increment attempt counter
            cache.set(cache_key, attempts + 1, timeout=300)  # 5 minutes
            return Response(
                {'error': 'Invalid username or password'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Authenticate the user
        user = authenticate(username=username, password=password)
        
        if user is not None:
            if user.is_active:
                # Reset attempt counter on successful login
                cache.delete(cache_key)
                
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user_id': user.pk,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                })
            else:
                return Response(
                    {'error': 'Account is disabled'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            # Increment attempt counter for failed password
            cache.set(cache_key, attempts + 1, timeout=300)  # 5 minutes
            return Response(
                {'error': 'Invalid username or password'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    def get_client_ip(self, request):
        """Get the client's IP address for rate limiting"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

@method_decorator(csrf_exempt, name='dispatch')
class SignUpView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not username or not email or not password:
            return Response({'error': 'Please provide username, email and password'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists (case-insensitive)
        if User.objects.filter(email__iexact=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'User created successfully',
                'user_id': user.pk,
                'username': user.username,
                'email': user.email,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response({'error': 'Failed to create user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error during logout: {str(e)}")
            return Response({'error': 'An error occurred during logout.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CurrentUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class CSRFTokenView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({'csrfToken': get_token(request)})
    
class APIRootView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
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
                'signup': '/api/signup/',
                'current-user': '/api/users/me/',
            },
            'frontend': 'http://localhost:5173'
        })

class BoardViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = BoardSerializer
    queryset = Board.objects.all()
    
    def get_queryset(self):
        return Board.objects.filter(Q(owner=self.request.user) | Q(tasks__assignee=self.request.user)).distinct()
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Remove owner from request data if present
        request_data = request.data.copy()
        if 'owner' in request_data:
            del request_data['owner']
        
        serializer = self.get_serializer(data=request_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if instance.owner != request.user:
                raise PermissionDenied("You don't have permission to edit this board")
            
            # Remove owner from request data if present
            request_data = request.data.copy()
            if 'owner' in request_data:
                del request_data['owner']
            
            # Use partial=True for PATCH requests
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request_data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            return Response(serializer.data)
            
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error updating board: {str(e)}")
            return Response({'error': f'An error occurred while updating the board: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if instance.owner != request.user:
                raise PermissionDenied("You don't have permission to delete this board")
            return super().destroy(request, *args, **kwargs)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Error deleting board: {str(e)}")
            return Response({'error': f'An error occurred while deleting the board: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class TaskViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    queryset = Task.objects.all()
    
    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(Q(board__owner=user) | Q(assignee=user) | Q(created_by=user))
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    # boards/views.py - TaskViewSet update method
def update(self, request, *args, **kwargs):
    try:
        instance = self.get_object()
        user = request.user
        
        if user == instance.board.owner or user == instance.assignee or user == instance.created_by:
            return super().update(request, *args, **kwargs)
        else:
            raise PermissionDenied("You don't have permission to edit this task")
    
    except PermissionDenied as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    
    except ValidationError as e:
        # Return validation errors directly without wrapping
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error updating task {instance.id if 'instance' in locals() else 'unknown'}: {str(e)}")
        return Response({'error': 'An unexpected error occurred while updating the task.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if request.user != instance.board.owner and request.user != instance.created_by:
                raise PermissionDenied("You don't have permission to delete this task")
            return super().destroy(request, *args, **kwargs)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Http404:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting task: {str(e)}")
            return Response({'error': f'An error occurred while deleting the task: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TaskStatusUpdateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
            
            # Check permissions - allow board owner or task assignee to update
            if request.user != task.board.owner and request.user != task.assignee and request.user != task.created_by:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # Validate status
            valid_statuses = ['To-Do', 'In Progress', 'Completed']
            new_status = request.data.get('status')
            if new_status not in valid_statuses:
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update task status
            task.status = new_status
            task.save()
            
            # Return updated task data
            serializer = TaskSerializer(task)
            return Response(serializer.data)
            
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating task status: {str(e)}")
            return Response({'error': f'An error occurred while updating the task: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    # Add custom action for /users/me/ endpoint
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class UserAssignmentsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            if user != request.user:
                raise PermissionDenied("You don't have permission to view this user's assignments")
            
            assignments = Task.objects.filter(assignee=user)
            serializer = TaskSerializer(assignments, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Error fetching user assignments: {str(e)}")
            return Response({'error': f'An error occurred while fetching user assignments: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserAssignedBoardsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            if user != request.user:
                raise PermissionDenied("You don't have permission to view this user's assigned boards")
            
            assigned_boards = Board.objects.filter(tasks__assignee=user).distinct()
            serializer = BoardSerializer(assigned_boards, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Error fetching user assigned boards: {str(e)}")
            return Response({'error': f'An error occurred while fetching user assigned boards: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)