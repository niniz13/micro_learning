import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'micro_learning.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(username='niniz').exists():
    User.objects.create_superuser('niniz', 'niniz@example.com', 'admin', first_name='Admin', last_name='User')
