from rest_framework import viewsets
from .models import Student, Enrollment
from .serializers import StudentSerializer, EnrollmentSerializer


class StudentViewSet(viewsets.ModelViewSet):

    queryset = Student.objects.all()
    serializer_class = StudentSerializer


class EnrollmentViewSet(viewsets.ModelViewSet):

    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer