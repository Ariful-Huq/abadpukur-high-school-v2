from rest_framework import serializers
from .models import SchoolSettings, GradingSystem, Term


class SchoolSettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = SchoolSettings
        fields = "__all__"


class GradingSystemSerializer(serializers.ModelSerializer):

    class Meta:
        model = GradingSystem
        fields = "__all__"


class TermSerializer(serializers.ModelSerializer):

    class Meta:
        model = Term
        fields = "__all__"