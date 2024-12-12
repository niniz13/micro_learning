from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userprogress',
            old_name='last_accessed',
            new_name='updated_at',
        ),
        migrations.AddField(
            model_name='userprogress',
            name='last_page_viewed',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.page'),
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(max_length=150, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='page',
            name='order',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='userprogress',
            name='progress',
            field=models.FloatField(default=0.0),
        ),
    ]
