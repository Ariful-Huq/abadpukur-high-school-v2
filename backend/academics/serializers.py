# backend/academics/serializers.py
from rest_framework import serializers
from .models import AcademicSession, Class, Section, Subject


class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = "__all__"


class SectionSerializer(serializers.ModelSerializer):
    # This provides the 'school_class_name' used in Sections.jsx
    school_class_name = serializers.ReadOnlyField(source='school_class.name')

    class Meta:
        model = Section
        fields = ['id', 'name', 'school_class', 'school_class_name']


class AcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'school_class']
