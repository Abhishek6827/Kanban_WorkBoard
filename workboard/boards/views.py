from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from .models import Board, Task
from .serializers import BoardSerializer, TaskSerializer, UserSerializer
import logging

logger = logging.getLogger(__name__)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'username': user.username
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error during logout: {str(e)}", exc_info=True)
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
        from django.middleware.csrf import get_token
        return Response({'csrfToken': get_token(request)})

class BoardViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = BoardSerializer
    queryset = Board.objects.all()

    def get_queryset(self):
        return Board.objects.filter(Q(owner=self.request.user) | Q(tasks__assignee=self.request.user)).distinct()

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Attempting to create board with data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            logger.info(f"Board created successfully: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            logger.error(f"Validation error creating board: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating board: {str(e)}", exc_info=True)
            return Response({'error': f'An error occurred while creating the board: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if instance.owner != request.user:
                raise PermissionDenied("You don't have permission to edit this board")
            return super().update(request, *args, **kwargs)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Error updating board: {str(e)}", exc_info=True)
            return Response({'error': f'An error occurred while updating the board: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if instance.owner != request.user:
                raise PermissionDenied("You don't have permission to delete this board")
            return super().destroy(request, *args, **kwargs)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Error deleting board: {str(e)}", exc_info=True)
            return Response({'error': f'An error occurred while deleting the board: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TaskViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    queryset = Task.objects.all()
    
    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(Q(board__owner=user) | Q(assignee=user))

    def create(self, request, *args, **kwargs):
        try:
            board_id = request.data.get('board')
            logger.info(f"Attempting to create task for board {board_id}")
            logger.debug(f"Request data: {request.data}")
            
            board = Board.objects.get(id=board_id)
            if board.owner != request.user:
                raise PermissionDenied("You don't have permission to create tasks on this board")
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            logger.info(f"Task created successfully: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Board.DoesNotExist:
            logger.error(f"Board with id {board_id} does not exist")
            return Response({'error': 'Invalid board ID'}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as e:
            logger.error(f"Validation error creating task: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating task: {str(e)}", exc_info=True)
            return Response({'error': f'An error occurred while creating the task: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        board_id = self.request.data.get('board')
        board = Board.objects.get(id=board_id)
        assignee_id = self.request.data.get('assignee_id')
        assignee = User.objects.get(id=assignee_id) if assignee_id else None
        serializer.save(created_by=self.request.user, board=board, assignee=assignee)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            user = request.user
            if user == instance.board.owner or user == instance.assignee:
                return super().update(request, *args, **kwargs)
            else:
                raise PermissionDenied("You don't have permission to edit this task")
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Error updating task: {str(e)}", exc_info=True)
            return Response({'error': f'An error occurred while updating the task: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if request.user != instance.board.owner:
                raise PermissionDenied("You don't have permission to delete this task")
            return super().destroy(request, *args, **kwargs)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Error deleting task: {str(e)}", exc_info=True)
            return Response({'error': f'An error occurred while deleting the task: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def list(self, request):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing users: {str(e)}", exc_info=True)
            return Response({'error': f'An error occurred while fetching users: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None):
        try:
            if pk == 'me':
                user = request.user
            else:
                user = self.get_object()
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving user: {str(e)}", exc_info=True)
            return Response({'error': f'An error occurred while fetching the user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            logger.error(f"Error fetching user assignments: {str(e)}", exc_info=True)
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
            logger.error(f"Error fetching user assigned boards: {str(e)}", exc_info=True)
            return Response({'error': f'An error occurred while fetching user assigned boards: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)