from django.contrib import admin
from .models import SchoolSettings, GradingSystem, Term

admin.site.register(SchoolSettings)
admin.site.register(GradingSystem)
admin.site.register(Term)