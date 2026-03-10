from rest_framework import viewsets
from .models import Period, ClassRoutine
from .serializers import PeriodSerializer, ClassRoutineSerializer


class PeriodViewSet(viewsets.ModelViewSet):

    queryset = Period.objects.all()
    serializer_class = PeriodSerializer


class ClassRoutineViewSet(viewsets.ModelViewSet):

    queryset = ClassRoutine.objects.all()
    serializer_class = ClassRoutineSerializer