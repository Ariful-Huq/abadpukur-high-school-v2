from rest_framework import viewsets
from .models import SchoolSettings, GradingSystem, Term
from .serializers import (
    SchoolSettingsSerializer,
    GradingSystemSerializer,
    TermSerializer
)


class SchoolSettingsViewSet(viewsets.ModelViewSet):

    queryset = SchoolSettings.objects.all()
    serializer_class = SchoolSettingsSerializer


class GradingSystemViewSet(viewsets.ModelViewSet):

    queryset = GradingSystem.objects.all()
    serializer_class = GradingSystemSerializer


class TermViewSet(viewsets.ModelViewSet):

    queryset = Term.objects.all()
    serializer_class = TermSerializer