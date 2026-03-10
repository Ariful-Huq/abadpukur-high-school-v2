from rest_framework import serializers
from .models import AcademicSession, Class, Section, Subject


class AcademicSessionSerializer(serializers.ModelSerializer):

    class Meta:
        model = AcademicSession
        fields = "__all__"


class ClassSerializer(serializers.ModelSerializer):

    class Meta:
        model = Class
        fields = "__all__"


class SectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Section
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subject
        fields = "__all__"