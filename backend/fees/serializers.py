from rest_framework import serializers
from .models import FeeStructure, Payment


class FeeStructureSerializer(serializers.ModelSerializer):

    class Meta:
        model = FeeStructure
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    # These read-only fields will help the frontend display names
    student_name = serializers.CharField(source="student.first_name", read_only=True)
    fee_name = serializers.CharField(source="fee.name", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "student", "student_name", "fee", "fee_name", "amount_paid", "payment_method", "payment_date", "transaction_id"]