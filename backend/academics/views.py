from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AcademicSession, Class, Section, Subject
from .serializers import (
    AcademicSessionSerializer,
    ClassSerializer,
    SectionSerializer,
    SubjectSerializer
)


class AcademicSessionViewSet(viewsets.ModelViewSet):
    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer

    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        session = self.get_object()
        session.is_active = True
        session.save() # The model's save() method will handle deactivating others
        return Response({'status': 'session set to active'}, status=status.HTTP_200_OK)


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
