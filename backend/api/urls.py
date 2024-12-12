from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet,
    ModuleViewSet,
    PageViewSet,
    UserProgressViewSet,
    CustomTokenObtainPairView,
    complete_module,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'modules', ModuleViewSet)
router.register(r'pages', PageViewSet, basename='page')
router.register(r'progress', UserProgressViewSet, basename='progress')

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', UserViewSet.as_view({'post': 'register'}), name='register'),
    path('auth/password-reset/', UserViewSet.as_view({'post': 'password_reset'}), name='password_reset'),
    path('users/me/', UserViewSet.as_view({
        'get': 'me',
        'put': 'update',
        'patch': 'partial_update'
    }), name='user-me'),
    
    # Nested routes for module pages
    path('modules/<int:module_pk>/pages/', PageViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='module-pages'),
    path('modules/<int:module_pk>/pages/<int:pk>/', PageViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='module-page-detail'),
    
    # Module pages through module viewset
    path('modules/<int:pk>/pages/', ModuleViewSet.as_view({
        'get': 'pages',
        'post': 'pages'
    }), name='module-pages-alt'),
    
    # Complete module endpoint
    path('modules/<int:module_id>/complete/', complete_module, name='complete_module'),
]
