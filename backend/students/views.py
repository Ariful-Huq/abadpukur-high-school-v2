# backend/students/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Student, Enrollment
from .serializers import StudentSerializer, EnrollmentSerializer
from academics.models import Class, Section, AcademicSession

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        queryset = Student.objects.all()
        class_id = self.request.query_params.get('school_class')
        section_id = self.request.query_params.get('section')

        # Filter students based on Enrollment records
        if class_id and section_id:
            # We find the IDs of students who have an active enrollment in this class/section
            student_ids = Enrollment.objects.filter(
                school_class_id=class_id, 
                section_id=section_id
            ).values_list('student_id', flat=True)
            
            queryset = queryset.filter(id__in=student_ids)
            
        return queryset

    def create(self, request, *args, **kwargs):
        # 1. Extract Academic IDs from the frontend request
        class_id = request.data.get('class_id')
        section_id = request.data.get('section_id')
        session_id = request.data.get('session_id')

        # 2. Save the Student first (Basic info like Name, Roll, Photo)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()

        # 3. Create the Enrollment record automatically if IDs are provided
        if class_id and section_id and session_id:
            try:
                school_class = Class.objects.get(id=class_id)
                section = Section.objects.get(id=section_id)
                session = AcademicSession.objects.get(id=session_id)

                Enrollment.objects.create(
                    student=student,
                    school_class=school_class,
                    section=section,
                    session=session
                )
            except (Class.DoesNotExist, Section.DoesNotExist, AcademicSession.DoesNotExist):
                # If specific academic data is missing, we log it but don't crash
                print("Enrollment failed: One or more academic records not found.")

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
