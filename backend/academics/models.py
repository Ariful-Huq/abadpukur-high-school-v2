from django.db import models


class AcademicSession(models.Model):

    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name


class Class(models.Model):

    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Section(models.Model):

    name = models.CharField(max_length=20)
    school_class = models.ForeignKey(Class, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.school_class} - {self.name}"


class Subject(models.Model):

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)

    def __str__(self):
        return self.name