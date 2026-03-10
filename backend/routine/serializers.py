from rest_framework import serializers
from .models import Period, ClassRoutine


class PeriodSerializer(serializers.ModelSerializer):

    class Meta:
        model = Period
        fields = "__all__"


class ClassRoutineSerializer(serializers.ModelSerializer):

    class Meta:
        model = ClassRoutine
        fields = "__all__"