from django.db import models
from django.core.exceptions import ValidationError
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

    def clean(self):
        # 1. Prevent Teacher Conflict: Same teacher, same day, same period in ANY class/section
        teacher_conflict = ClassRoutine.objects.filter(
            day=self.day,
            period=self.period,
            teacher=self.teacher
        ).exclude(id=self.id)

        if teacher_conflict.exists():
            conflict = teacher_conflict.first()
            raise ValidationError(
                f"Teacher conflict: This teacher is already assigned to {conflict.school_class.name} "
                f"({conflict.section.name}) during this period."
            )

        # 2. Prevent Slot Conflict: Same class, same section, same day, same period
        slot_conflict = ClassRoutine.objects.filter(
            day=self.day,
            period=self.period,
            school_class=self.school_class,
            section=self.section
        ).exclude(id=self.id)

        if slot_conflict.exists():
            raise ValidationError("This class slot is already occupied by another subject.")

    def save(self, *args, **kwargs):
        self.full_clean() # Triggers the clean method
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.school_class}-{self.section} {self.day} {self.period}"
