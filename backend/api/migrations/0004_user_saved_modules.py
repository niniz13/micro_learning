# Generated by Django 5.0 on 2024-12-12 22:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_user_managers_remove_user_username_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='saved_modules',
            field=models.ManyToManyField(blank=True, related_name='saved_by_users', to='api.module'),
        ),
    ]
