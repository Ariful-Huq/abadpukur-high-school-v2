from django.db import models
from academics.models import Class, Section, Subject
from teachers.models import Teacher


class Period(models.Model):

    name = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return self.name


class ClassRoutine(models.Model):

    DAY_CHOICES = (
        ("sun", "Sunday"),
        ("mon", "Monday"),
        ("tue", "Tuesday"),
        ("wed", "Wednesday"),
        ("thu", "Thursday"),
    )

    school_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)

    day = models.CharField(max_length=10, choices=DAY_CHOICES)

    period = models.ForeignKey(Period, on_delete=models.CASCADE)

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.school_class}-{self.section} {self.day} {self.period}"