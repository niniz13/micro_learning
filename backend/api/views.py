from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from .models import Module, Page, UserProgress
from .serializers import (
    UserSerializer,
    ModuleSerializer,
    PageSerializer,
    UserProgressSerializer,
    CustomTokenObtainPairSerializer,
)
from django.db.models import F

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if email:
            # Convert email to username for authentication
            try:
                user = User.objects.get(email=email)
                request.data['email'] = user.email
            except User.DoesNotExist:
                pass
                
        return super().post(request, *args, **kwargs)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and (request.user.is_admin or request.user.is_superuser)

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
    
    def get_permissions(self):
        if self.action in ['register', 'password_reset']:
            return []
        return [IsAuthenticated()]
    
    def get_object(self):
        # Override to ensure users can only update their own profile
        pk = self.kwargs.get('pk')
        if pk and str(pk) != str(self.request.user.id):
            raise PermissionDenied("You don't have permission to modify this user.")
        return self.request.user
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Prepare the data for the serializer
        data = request.data.copy()
        
        # Handle password change if requested
        if 'new_password' in data:
            current_password = data.pop('current_password', None)
            if not current_password:
                return Response(
                    {'current_password': 'Current password is required to change password'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not instance.check_password(current_password):
                return Response(
                    {'current_password': 'Current password is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Set the new password
            instance.set_password(data.pop('new_password'))
            instance.save()
        
        # Update other fields
        serializer = self.get_serializer(instance, data=data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            
            # Return updated user data
            return Response(self.get_serializer(instance).data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def password_reset(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            # Generate password reset token
            refresh = RefreshToken.for_user(user)
            reset_token = str(refresh.access_token)
            
            # Send email
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
            send_mail(
                'Password Reset Request',
                f'Click here to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Password reset email sent'
            })
        except User.DoesNotExist:
            return Response({
                'message': 'If an account exists with this email, a password reset link will be sent.'
            })

    @action(detail=False, methods=['delete'])
    def delete_account(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_admin and not self.request.user.is_superuser:
            # Add progress information for regular users
            for module in queryset:
                try:
                    progress = UserProgress.objects.get(
                        user=self.request.user,
                        module=module
                    )
                    module.progress = progress.progress
                except UserProgress.DoesNotExist:
                    module.progress = 0.0
        return queryset

    @action(detail=True, methods=['get', 'post'])
    def pages(self, request, pk=None):
        module = self.get_object()
        if request.method == 'GET':
            pages = module.pages.all().order_by('order')
            serializer = PageSerializer(pages, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = PageSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(module=module)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def save(self, request, pk=None):
        module = self.get_object()
        request.user.saved_modules.add(module)
        return Response({'status': 'module saved'})

    @action(detail=True, methods=['post'])
    def unsave(self, request, pk=None):
        module = self.get_object()
        request.user.saved_modules.remove(module)
        return Response({'status': 'module unsaved'})

    @action(detail=False, methods=['get'])
    def saved(self, request):
        saved_modules = request.user.saved_modules.all()
        serializer = self.get_serializer(saved_modules, many=True)
        return Response(serializer.data)

class PageViewSet(viewsets.ModelViewSet):
    serializer_class = PageSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        module_id = self.kwargs.get('module_pk')
        if module_id is not None:
            return Page.objects.filter(module_id=module_id).order_by('order')
        return Page.objects.none()

    def perform_create(self, serializer):
        module_id = self.kwargs.get('module_pk')
        module = Module.objects.get(id=module_id)
        
        # Get the highest order value
        last_page = Page.objects.filter(module=module).order_by('-order').first()
        next_order = (last_page.order + 1) if last_page else 0
        
        serializer.save(module=module, order=next_order)

    def perform_update(self, serializer):
        instance = self.get_object()
        old_order = instance.order
        new_order = self.request.data.get('order')

        if new_order is not None and old_order != new_order:
            # Convert to integers for comparison
            old_order = int(old_order)
            new_order = int(new_order)
            
            # Get all pages for the module
            pages = Page.objects.filter(module=instance.module)
            
            # Moving down: update pages between old and new position
            if new_order > old_order:
                pages.filter(
                    order__gt=old_order,
                    order__lte=new_order
                ).update(order=F('order') - 1)
            # Moving up: update pages between new and old position
            else:
                pages.filter(
                    order__gte=new_order,
                    order__lt=old_order
                ).update(order=F('order') + 1)
            
            # Update the moved page's order
            instance.order = new_order
            instance.save(update_fields=['order'])
        
        serializer.save()

    def perform_destroy(self, instance):
        # Get the order of the page being deleted
        deleted_order = instance.order
        
        # Update the order of remaining pages
        Page.objects.filter(
            module=instance.module,
            order__gt=deleted_order
        ).update(order=F('order') - 1)
        
        instance.delete()

class UserProgressViewSet(viewsets.ModelViewSet):
    serializer_class = UserProgressSerializer
    queryset = UserProgress.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['user'] = request.user.id
        
        # Check if progress already exists
        existing_progress = UserProgress.objects.filter(
            user=request.user,
            module_id=data.get('module')
        ).first()
        
        if existing_progress:
            # Update existing progress
            serializer = self.get_serializer(existing_progress, data=data, partial=True)
        else:
            # Create new progress
            serializer = self.get_serializer(data=data)
            
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        
        # Handle completion
        if request.data.get('completed'):
            request.data['progress'] = 100.0
            
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        progress = self.get_object()
        new_progress = request.data.get('progress')
        if new_progress is not None:
            progress.progress = float(new_progress)
            progress.save()
            return Response({'status': 'progress updated'})
        return Response({'error': 'No progress value provided'},
                      status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_module(request, module_id):
    try:
        module = Module.objects.get(id=module_id)
        profile = request.user.profile
        
        # Check if module is already completed
        if module not in profile.completed_modules.all():
            # Add to completed modules
            profile.completed_modules.add(module)
            
            # Calculate new progress
            total_modules = Module.objects.count()
            completed_count = profile.completed_modules.count()
            profile.progression = (completed_count / total_modules) * 100 if total_modules > 0 else 0
            profile.save()
            
            return Response({
                'message': 'Module completed successfully',
                'progression': profile.progression,
                'completed_modules': list(profile.completed_modules.values_list('id', flat=True))
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Module already completed',
            'progression': profile.progression,
            'completed_modules': list(profile.completed_modules.values_list('id', flat=True))
        }, status=status.HTTP_200_OK)
        
    except Module.DoesNotExist:
        return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
