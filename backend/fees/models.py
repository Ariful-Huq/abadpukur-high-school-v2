from django.db import models
from students.models import Student


class FeeStructure(models.Model):

    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


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