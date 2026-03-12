from rest_framework import serializers
from .models import Student, Enrollment

class StudentSerializer(serializers.ModelSerializer):
    # SerializerMethodField allows us to run a small function to find related data
    class_name = serializers.SerializerMethodField()
    section_name = serializers.SerializerMethodField()
    session_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'roll_number', 
            'photo', 'class_name', 'section_name', 'session_name'
        ]

    def get_class_name(self, obj):
        # We look into the Enrollment table for this student
        enrollment = obj.enrollment_set.first()
        return enrollment.school_class.name if enrollment else "Not Enrolled"

    def get_section_name(self, obj):
        enrollment = obj.enrollment_set.first()
        return enrollment.section.name if enrollment else "N/A"

    def get_session_name(self, obj):
        enrollment = obj.enrollment_set.first()
        return enrollment.session.name if enrollment else "N/A"


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = "__all__"
