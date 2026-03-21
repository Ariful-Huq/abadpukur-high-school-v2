from django.db import models
from students.models import Student
from academics.models import Class


class FeeStructure(models.Model):

    name = models.CharField(max_length=100)
    school_class = models.ForeignKey(
        Class, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name="fees"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    frequency = models.CharField(max_length=20, default="monthly")

    def __str__(self):
        return f"{self.name} - {self.school_class if self.school_class else 'All'}"


class Payment(models.Model):

    PAYMENT_METHOD = (
        ("cash", "Cash"),
        ("mfs", "Mobile Financial Service"),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    fee = models.ForeignKey(FeeStructure, on_delete=models.CASCADE)

    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)

    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD)

    payment_date = models.DateField(auto_now_add=True)

    transaction_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.student} {self.amount_paid}"