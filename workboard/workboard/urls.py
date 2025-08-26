from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Web pages (from boards/urls.py)
    path('', include('boards.urls')),
    
    # API endpoints (from boards/api_urls.py) 
    path('api/', include('boards.api_urls')),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # REST framework auth
    path('api-auth/', include('rest_framework.urls')),
]

handler404 = 'boards.views_web.handler404'
handler500 = 'boards.views_web.handler500'