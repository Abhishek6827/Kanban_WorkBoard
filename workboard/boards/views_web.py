from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from .models import Board, Task
from .forms import BoardForm, TaskForm
from django.db.models import Q

@login_required
def dashboard(request):
    """Dashboard view showing overview of boards and tasks"""
    user = request.user
    
    # Get counts
    boards_count = Board.objects.filter(owner=user).count()
    tasks_count = Task.objects.filter(
        Q(board__owner=user) | Q(assignee=user)
    ).count()
    users_count = User.objects.count()
    
    # Get recent boards
    recent_boards = Board.objects.filter(owner=user).order_by('-created_at')[:5]
    
    # Get recent tasks
    recent_tasks = Task.objects.filter(
        Q(board__owner=user) | Q(assignee=user)
    ).order_by('-created_at')[:5]
    
    context = {
        'boards_count': boards_count,
        'tasks_count': tasks_count,
        'users_count': users_count,
        'recent_boards': recent_boards,
        'recent_tasks': recent_tasks,
    }
    
    return render(request, 'dashboard.html', context)

@login_required
def boards_list(request):
    """List all boards for the current user"""
    user = request.user
    boards = Board.objects.filter(
        Q(owner=user) | Q(tasks__assignee=user)
    ).distinct().order_by('-created_at')
    
    context = {
        'boards': boards,
    }
    return render(request, 'boards_list.html', context)

@login_required
def board_detail(request, board_id):
    """Show board details and tasks"""
    board = get_object_or_404(Board, id=board_id)
    
    # Check if user has access to this board
    if board.owner != request.user and not board.tasks.filter(assignee=request.user).exists():
        messages.error(request, "You don't have permission to view this board.")
        return redirect('boards_list')
    
    tasks = board.tasks.all().order_by('status', 'created_at')
    
    context = {
        'board': board,
        'tasks': tasks,
    }
    return render(request, 'board_detail.html', context)

@login_required
def board_create(request):
    """Create a new board"""
    if request.method == 'POST':
        form = BoardForm(request.POST)
        if form.is_valid():
            board = form.save(commit=False)
            board.owner = request.user
            board.save()
            messages.success(request, f'Board "{board.name}" created successfully!')
            return redirect('board_detail', board_id=board.id)
    else:
        form = BoardForm()
    
    context = {
        'form': form,
        'title': 'Create New Board',
    }
    return render(request, 'board_form.html', context)

@login_required
def board_edit(request, board_id):
    """Edit an existing board"""
    board = get_object_or_404(Board, id=board_id, owner=request.user)
    
    if request.method == 'POST':
        form = BoardForm(request.POST, instance=board)
        if form.is_valid():
            form.save()
            messages.success(request, f'Board "{board.name}" updated successfully!')
            return redirect('board_detail', board_id=board.id)
    else:
        form = BoardForm(instance=board)
    
    context = {
        'form': form,
        'board': board,
        'title': f'Edit Board: {board.name}',
    }
    return render(request, 'board_form.html', context)

@login_required
def tasks_list(request):
    """List all tasks for the current user"""
    user = request.user
    tasks = Task.objects.filter(
        Q(board__owner=user) | Q(assignee=user)
    ).order_by('-created_at')
    
    context = {
        'tasks': tasks,
    }
    return render(request, 'tasks_list.html', context)

@login_required
def task_create(request):
    """Create a new task"""
    if request.method == 'POST':
        form = TaskForm(request.POST, user=request.user)
        if form.is_valid():
            task = form.save(commit=False)
            task.created_by = request.user
            task.save()
            messages.success(request, f'Task "{task.title}" created successfully!')
            return redirect('board_detail', board_id=task.board.id)
    else:
        form = TaskForm(user=request.user)
    
    context = {
        'form': form,
        'title': 'Create New Task',
    }
    return render(request, 'task_form.html', context)

@login_required
def task_edit(request, task_id):
    """Edit an existing task"""
    task = get_object_or_404(Task, id=task_id)
    
    # Check permissions
    if task.board.owner != request.user and task.assignee != request.user:
        messages.error(request, "You don't have permission to edit this task.")
        return redirect('tasks_list')
    
    if request.method == 'POST':
        form = TaskForm(request.POST, instance=task, user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, f'Task "{task.title}" updated successfully!')
            return redirect('board_detail', board_id=task.board.id)
    else:
        form = TaskForm(instance=task, user=request.user)
    
    context = {
        'form': form,
        'task': task,
        'title': f'Edit Task: {task.title}',
    }
    return render(request, 'task_form.html', context)

@login_required
@require_http_methods(["POST"])
def task_status_update(request, task_id):
    """Update task status via AJAX"""
    task = get_object_or_404(Task, id=task_id)
    
    # Check permissions
    if task.board.owner != request.user and task.assignee != request.user:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    new_status = request.POST.get('status')
    if new_status in ['TODO', 'IN_PROGRESS', 'DONE']:
        task.status = new_status
        task.save()
        return JsonResponse({'success': True, 'status': task.status})
    
    return JsonResponse({'error': 'Invalid status'}, status=400)