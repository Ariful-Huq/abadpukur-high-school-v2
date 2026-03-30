# backend/students/models.py
from django.db import models
from academics.models import Class, Section, AcademicSession


class Student(models.Model):

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    roll_number = models.CharField(max_length=20)
    photo = models.ImageField(
        upload_to='students/photos/', null=True, blank=True)  # New Field

    class Meta:
        ordering = ['roll_number']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Enrollment(models.Model):

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    school_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.student} - {self.school_class}"
