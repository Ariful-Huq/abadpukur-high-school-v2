# backend/teachers/models.py
from django.db import models
from django.conf import settings
from academics.models import Subject


class Teacher(models.Model):
    DESIGNATION_CHOICES = [
        ('Principal', 'Principal'),
        ('Headmaster', 'Headmaster'),
        ('Senior Teacher', 'Senior Teacher'),
        ('Assistant Teacher', 'Assistant Teacher'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teacher_profile'
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=15)
    photo = models.ImageField(
        upload_to='teachers/photos/', null=True, blank=True)
    designation = models.CharField(max_length=100, null=True, blank=True)
    qualification = models.CharField(max_length=200, null=True, blank=True)
    date_of_joining = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-id']  # Shows the most recently joined teacher at the top

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class SubjectAssignment(models.Model):
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name="assignments")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.teacher} - {self.subject}"
