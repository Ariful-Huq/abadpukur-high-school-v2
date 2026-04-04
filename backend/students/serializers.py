# backend/students/serializers.py
from rest_framework import serializers
from .models import Student, Enrollment


class StudentSerializer(serializers.ModelSerializer):
    # We add ID fields so the frontend "Edit" form can pre-select the dropdowns
    class_id = serializers.SerializerMethodField()
    section_id = serializers.SerializerMethodField()
    session_id = serializers.SerializerMethodField()
    enrollment_id = serializers.SerializerMethodField()

    class_name = serializers.SerializerMethodField()
    section_name = serializers.SerializerMethodField()
    session_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'roll_number',
            'father_name', 'father_contact', 'mother_name', 'mother_contact',
            'date_of_birth', 'religion', 'address', 'photo',
            'class_id', 'section_id', 'session_id', 'enrollment_id',
            'class_name', 'section_name', 'session_name'
        ]

    def get_enrollment(self, obj):
        return obj.enrollment_set.first()

    def get_enrollment_id(self, obj):
        enroll = self.get_enrollment(obj)
        return enroll.id if enroll else None

    def get_class_id(self, obj):
        enroll = self.get_enrollment(obj)
        return enroll.school_class.id if enroll else None

    def get_section_id(self, obj):
        enroll = self.get_enrollment(obj)
        return enroll.section.id if enroll else None

    def get_session_id(self, obj):
        enroll = self.get_enrollment(obj)
        return enroll.session.id if enroll else None

    def get_class_name(self, obj):
        enroll = self.get_enrollment(obj)
        return enroll.school_class.name if enroll else "Not Enrolled"

    def get_section_name(self, obj):
        enroll = self.get_enrollment(obj)
        return enroll.section.name if enroll else "N/A"

    def get_session_name(self, obj):
        enroll = self.get_enrollment(obj)
        return enroll.session.name if enroll else "N/A"


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = "__all__"
