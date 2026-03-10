from rest_framework import serializers
from .models import Teacher, SubjectAssignment


class TeacherSerializer(serializers.ModelSerializer):

    class Meta:
        model = Teacher
        fields = "__all__"


class SubjectAssignmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = SubjectAssignment
        fields = "__all__"