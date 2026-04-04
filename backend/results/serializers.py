# backend/results/serializers.py
from rest_framework import serializers
from .models import Mark, Exam
from academics.serializers import SubjectSerializer


class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'


class MarkSerializer(serializers.ModelSerializer):
    subject_details = SubjectSerializer(source='subject', read_only=True)
    student_name = serializers.ReadOnlyField(
        source='enrollment.student.first_name')
    roll = serializers.ReadOnlyField(source='enrollment.student.roll_number')
    subject_name = serializers.ReadOnlyField(source='subject.name')
    grade = serializers.ReadOnlyField(source='get_grade')

    class Meta:
        model = Mark
        fields = [
            'id', 'enrollment', 'subject', 'subject_details', 'exam',
            'written_marks', 'objective_marks', 'practical_marks',
            'total_marks', 'grade', 'student_name', 'roll', 'subject_name'
        ]
