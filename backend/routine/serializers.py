from rest_framework import serializers
from .models import Period, ClassRoutine

class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = '__all__'

class ClassRoutineSerializer(serializers.ModelSerializer):
    # These read-only fields help display names in the React table
    period_detail = PeriodSerializer(source='period', read_only=True)
    subject_name = serializers.ReadOnlyField(source='subject.name')
    teacher_name = serializers.ReadOnlyField(source='teacher.first_name')
    
    class Meta:
        model = ClassRoutine
        fields = [
            'id', 'school_class', 'section', 'day', 'period', 
            'subject', 'teacher', 'period_detail', 'subject_name', 'teacher_name'
        ]