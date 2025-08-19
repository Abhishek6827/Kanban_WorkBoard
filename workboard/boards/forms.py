from django import forms
from django.contrib.auth.models import User
from .models import Board, Task

class BoardForm(forms.ModelForm):
    class Meta:
        model = Board
        fields = ['name', 'description']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter board name'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Enter board description'
            }),
        }

class TaskForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            # Only show boards that the user owns
            self.fields['board'].queryset = Board.objects.filter(owner=user)
            self.fields['assignee'].queryset = User.objects.exclude(id=user.id)
        
        # Add Bootstrap classes to all fields
        for field_name, field in self.fields.items():
            if isinstance(field.widget, forms.TextInput):
                field.widget.attrs['class'] = 'form-control'
            elif isinstance(field.widget, forms.Textarea):
                field.widget.attrs['class'] = 'form-control'
            elif isinstance(field.widget, forms.Select):
                field.widget.attrs['class'] = 'form-select'

    class Meta:
        model = Task
        fields = ['title', 'description', 'board', 'assignee', 'status']
        widgets = {
            'title': forms.TextInput(attrs={
                'placeholder': 'Enter task title'
            }),
            'description': forms.Textarea(attrs={
                'rows': 3,
                'placeholder': 'Enter task description'
            }),
            'status': forms.Select(attrs={
                'class': 'form-select'
            }),
        }