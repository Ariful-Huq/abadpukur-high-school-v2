# backend/teachers/views.py
from rest_framework import viewsets
from .models import Teacher, SubjectAssignment
from .serializers import TeacherSerializer, SubjectAssignmentSerializer


class TeacherViewSet(viewsets.ModelViewSet):

    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer


class SubjectAssignmentViewSet(viewsets.ModelViewSet):

    queryset = SubjectAssignment.objects.all()
    serializer_class = SubjectAssignmentSerializer
