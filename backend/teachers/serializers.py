from rest_framework import serializers
from .models import Teacher, SubjectAssignment
from academics.models import Subject

class SubjectAssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')

    class Meta:
        model = SubjectAssignment
        fields = ['id', 'teacher', 'subject', 'subject_name']

class TeacherSerializer(serializers.ModelSerializer):
    assigned_subjects = serializers.SerializerMethodField()
    # Explicitly define this so the create() method can find it in validated_data
    subject_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Teacher
        # List all fields to ensure the custom ones are included in the API
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone', 
            'photo', 'designation', 'qualification', 'date_of_joining', 
            'assigned_subjects', 'subject_id'
        ]

    def get_assigned_subjects(self, obj):
        return [assignment.subject.name for assignment in obj.assignments.all()]

    def create(self, validated_data):
        # 1. Try to get subject_id from validated_data (DRF parsed)
        # 2. Fallback to initial_data (Raw request data)
        subject_id = validated_data.pop('subject_id', None)
        if not subject_id:
            subject_id = self.initial_data.get('subject_id') or self.initial_data.get('subject')

        teacher = Teacher.objects.create(**validated_data)
    
        if subject_id:
            try:
                subject = Subject.objects.get(id=subject_id)
                # This is the line that makes "General Faculty" disappear
                SubjectAssignment.objects.get_or_create(teacher=teacher, subject=subject)
            except (Subject.DoesNotExist, ValueError):
                print(f"DEBUG: Subject ID {subject_id} not found or invalid")
            
        return teacher