# backend/settings_app/models.py
from django.db import models


class SchoolSettings(models.Model):

    school_name = models.CharField(max_length=200)

    start_time = models.TimeField(default="10:00")

    working_days = models.CharField(
        max_length=100,
        default="Sunday,Monday,Tuesday,Wednesday,Thursday"
    )

    def __str__(self):
        return self.school_name


class GradingSystem(models.Model):

    grade = models.CharField(max_length=5)
    min_mark = models.IntegerField()
    max_mark = models.IntegerField()

    def __str__(self):
        return self.grade


class Term(models.Model):

    name = models.CharField(max_length=100)

    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name
