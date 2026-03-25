# backend/routine/serializers.py
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Period, ClassRoutine

class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = '__all__'

class ClassRoutineSerializer(serializers.ModelSerializer):
    period_detail = PeriodSerializer(source='period', read_only=True)
    subject_name = serializers.ReadOnlyField(source='subject.name')
    subject_code = serializers.ReadOnlyField(source='subject.code')
    # Changed to SerializerMethodField to combine first and last name
    teacher_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ClassRoutine
        fields = [
            'id', 'school_class', 'section', 'day', 'period', 
            'subject', 'teacher', 'period_detail', 'subject_name', 
            'subject_code', 'teacher_name'
        ]

    def get_teacher_name(self, obj):
        # Combines first and last name, handling potential None values
        if obj.teacher:
            return f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return "Unknown Teacher"

    def validate(self, data):
        # Create a temporary instance to run model-level validation
        # We use 'self.instance' to handle updates correctly (exclude current record from conflict check)
        instance = ClassRoutine(**data)
        if self.instance:
            instance.id = self.instance.id
            
        try:
            instance.clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message if hasattr(e, 'message') else str(e))
        return data