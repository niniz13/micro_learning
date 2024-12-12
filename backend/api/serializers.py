from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Module, Page, UserProgress, QuizOption, User

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        credentials = {
            'email': attrs.get('email'),
            'password': attrs.get('password')
        }

        if all(credentials.values()):
            return super().validate(credentials)
        else:
            msg = 'Must include "email" and "password".'
            raise serializers.ValidationError(msg)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    saved_modules = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'password', 'is_admin', 'is_superuser', 'saved_modules')
        read_only_fields = ('is_admin', 'is_superuser')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        # Remove password from validated data if it's not provided
        if 'password' in validated_data and not validated_data['password']:
            validated_data.pop('password')
            
        # Handle password update separately if provided
        if 'new_password' in validated_data:
            instance.set_password(validated_data.pop('new_password'))
            
        # Update other fields
        for attr, value in validated_data.items():
            if attr != 'password':  # Skip password field in normal update
                setattr(instance, attr, value)
                
        instance.save()
        return instance

class QuizOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ['id', 'text', 'is_correct']

class PageSerializer(serializers.ModelSerializer):
    quiz_options = QuizOptionSerializer(many=True, required=False)
    module = serializers.PrimaryKeyRelatedField(queryset=Module.objects.all(), required=False)

    class Meta:
        model = Page
        fields = ['id', 'module', 'type', 'content', 'order', 'quiz_options', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        if data.get('type') == 'quiz':
            quiz_options = self.initial_data.get('quiz_options', [])
            if not quiz_options:
                raise serializers.ValidationError({
                    'quiz_options': 'Quiz options are required for quiz pages'
                })
            # Validate quiz options
            for option in quiz_options:
                if not option.get('text', '').strip():
                    raise serializers.ValidationError({
                        'quiz_options': 'All quiz options must have text'
                    })
            if not any(option.get('is_correct', False) for option in quiz_options):
                raise serializers.ValidationError({
                    'quiz_options': 'At least one option must be marked as correct'
                })
        return data

    def create(self, validated_data):
        quiz_options_data = validated_data.pop('quiz_options', [])
        page = Page.objects.create(**validated_data)

        if page.type == 'quiz':
            for option_data in quiz_options_data:
                QuizOption.objects.create(page=page, **option_data)

        return page

    def update(self, instance, validated_data):
        quiz_options_data = validated_data.pop('quiz_options', [])
        
        # Update page fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if instance.type == 'quiz':
            # Delete existing options
            instance.quiz_options.all().delete()
            # Create new options
            for option_data in quiz_options_data:
                QuizOption.objects.create(page=instance, **option_data)

        return instance

class ModuleSerializer(serializers.ModelSerializer):
    pages = PageSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ('id', 'title', 'description', 'category', 'pages', 'progress', 'created_at', 'updated_at')

    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                progress = UserProgress.objects.get(user=request.user, module=obj)
                return progress.progress
            except UserProgress.DoesNotExist:
                return 0
        return 0

class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = ('id', 'user', 'module', 'progress', 'last_page_viewed', 'updated_at')
