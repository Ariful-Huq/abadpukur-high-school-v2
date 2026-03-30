# backend/routine/views.py
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Period, ClassRoutine
from .serializers import PeriodSerializer, ClassRoutineSerializer


class PeriodViewSet(viewsets.ModelViewSet):

    queryset = Period.objects.all()
    serializer_class = PeriodSerializer


class ClassRoutineViewSet(viewsets.ModelViewSet):

    queryset = ClassRoutine.objects.all()
    serializer_class = ClassRoutineSerializer

    # 1. Add Filter Backends
    filter_backends = [DjangoFilterBackend]

    # 2. Define the fields React can filter by
    filterset_fields = ['school_class', 'section', 'teacher', 'period']
