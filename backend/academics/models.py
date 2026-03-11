from django.db import models

class AcademicSession(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        ordering = ['-start_date'] # Shows the newest session first

    def __str__(self):
        return self.name


class Class(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        ordering = ['name'] # Orders: Class 1, Class 2, Class 3...
        verbose_name_plural = "Classes" # Fixes the "Classs" typo in Admin

    def __str__(self):
        return self.name


class Section(models.Model):
    name = models.CharField(max_length=20)
    school_class = models.ForeignKey(Class, on_delete=models.CASCADE)

    class Meta:
        ordering = ['school_class', 'name'] # Groups by class, then by section (A, B, C)

    def __str__(self):
        return f"{self.school_class} - {self.name}"


class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)

    class Meta:
        ordering = ['code'] # Useful for finding subjects by their official codes

    def __str__(self):
        return self.name