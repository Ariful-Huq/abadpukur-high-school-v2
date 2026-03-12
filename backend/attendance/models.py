from django.db import models
from students.models import Student
from academics.models import Class, Section


class Attendance(models.Model):

    STATUS_CHOICES = (
        ("P", "Present"),
        ("L", "Late Entry"),
        ("EL", "Early Leave"),
        ("A", "Absent"),
        ("LE", "Leave"),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    school_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)

    date = models.DateField()

    status = models.CharField(max_length=5, choices=STATUS_CHOICES)

    def __str__(self):
        return f"{self.student} {self.date} {self.status}"