from django.contrib import admin
from .models import AcademicSession, Class, Section, Subject


admin.site.register(AcademicSession)
admin.site.register(Class)
admin.site.register(Section)
admin.site.register(Subject)