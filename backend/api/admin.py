from django.contrib import admin

# Register your models here.
from .models import Module, Page, UserProgress, User

admin.site.register(Module)
admin.site.register(Page)
admin.site.register(UserProgress)
admin.site.register(User)
