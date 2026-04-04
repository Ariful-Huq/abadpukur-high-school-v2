# backend/fees/serializers.py
from rest_framework import serializers
from .models import FeeStructure, Payment


class FeeStructureSerializer(serializers.ModelSerializer):

    class Meta:
        model = FeeStructure
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    # These read-only fields will help the frontend display names
    student_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    section_name = serializers.SerializerMethodField()
    roll_number = serializers.CharField(
        source="student.roll_number", read_only=True)
    fee_name = serializers.CharField(source="fee.name", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "student", "student_name", "class_name",
            "section_name", "roll_number", "fee", "fee_name",
            "amount_paid", "payment_method", "payment_date", "transaction_id"
        ]

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_class_name(self, obj):
        # We look for the enrollment record linked to this student
        enrollment = obj.student.enrollment_set.first()
        return enrollment.school_class.name if enrollment else "Not Enrolled"

    def get_section_name(self, obj):
        enrollment = obj.student.enrollment_set.first()
        return enrollment.section.name if enrollment else "N/A"
