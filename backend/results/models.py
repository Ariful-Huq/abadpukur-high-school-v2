# backend/results/models.py
from django.db import models
from students.models import Enrollment
from academics.models import Subject


class Exam(models.Model):
    TERM_CHOICES = [
        ('1st Term', '1st Term Exam'),
        ('2nd Term', '2nd Term Exam'),
        ('Final', 'Final Exam'),
    ]
    name = models.CharField(max_length=50, choices=TERM_CHOICES)
    # Reference the session from academics to keep track of the year
    session = models.ForeignKey(
        'academics.AcademicSession', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.session.name}"


class Mark(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)

    # Grading components (standard for many school systems)
    written_marks = models.FloatField(default=0)
    objective_marks = models.FloatField(default=0)
    practical_marks = models.FloatField(default=0)
    total_marks = models.FloatField(editable=False)

    class Meta:
        # A student can only have ONE mark record for a specific subject in a specific exam
        unique_together = ('enrollment', 'subject', 'exam')

    def save(self, *args, **kwargs):
        self.total_marks = self.written_marks + \
            self.objective_marks + self.practical_marks
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.enrollment.student} - {self.subject.name} ({self.exam.name})"
