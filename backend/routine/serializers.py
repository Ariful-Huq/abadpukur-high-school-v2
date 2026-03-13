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
    teacher_name = serializers.ReadOnlyField(source='teacher.first_name')
    
    class Meta:
        model = ClassRoutine
        fields = [
            'id', 'school_class', 'section', 'day', 'period', 
            'subject', 'teacher', 'period_detail', 'subject_name', 'teacher_name'
        ]

    def validate(self, data):
        # Create a temporary instance to run model-level validation
        instance = ClassRoutine(**data)
        try:
            instance.clean()
        except ValidationError as e:
            # Send the error back to the frontend
            raise serializers.ValidationError(e.message if hasattr(e, 'message') else str(e))
        return data
