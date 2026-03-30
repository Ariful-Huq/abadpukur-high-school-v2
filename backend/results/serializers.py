# backend/results/serializers.py
from rest_framework import serializers
from .models import Mark, Exam


class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'


class MarkSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(
        source='enrollment.student.first_name')
    roll = serializers.ReadOnlyField(source='enrollment.student.roll_number')

    class Meta:
        model = Mark
        fields = [
            'id', 'enrollment', 'subject', 'exam',
            'written_marks', 'objective_marks', 'practical_marks',
            'total_marks', 'student_name', 'roll'
        ]
