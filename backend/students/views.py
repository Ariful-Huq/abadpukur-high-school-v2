# backend/students/views.py
# backend/students/views.py
from rest_framework import viewsets, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Max, IntegerField
from django.db.models.functions import Cast
from academics.models import Class, Section, AcademicSession
from .models import Student, Enrollment
from .serializers import StudentSerializer, EnrollmentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    # Using prefetch_related because enrollment_set is a reverse relationship
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    # Add SearchFilter to your backends
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['enrollment__school_class', 'enrollment__section']
    # Define which fields can be searched
    search_fields = ['first_name', 'last_name', 'roll_number']
    serializer_class = StudentSerializer

    def get_queryset(self):
        """
        Restricts the returned students to a given class/section if provided.
        Otherwise returns all students.
        """
        queryset = Student.objects.all()
        class_id = self.request.query_params.get('school_class')
        section_id = self.request.query_params.get('section')

        if class_id and section_id:
            # We filter by enrollment
            student_ids = Enrollment.objects.filter(
                school_class_id=int(class_id),
                section_id=int(section_id)
            ).values_list('student_id', flat=True)

            # Use order_by('roll_number') here for attendance/mark logic
            queryset = queryset.filter(
                id__in=student_ids).order_by('roll_number')
        else:
            # For the general directory, maybe you want newest added at the top
            queryset = queryset.order_by('-id')

        return queryset.annotate(
            roll_int=Cast('roll_number', output_field=IntegerField())
        ).order_by('roll_int')

    @action(detail=False, methods=['get'])
    def get_next_roll(self, request):
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')

        if not class_id or not section_id:
            return Response({"next_roll": "1"})

        last_roll_data = Enrollment.objects.filter(
            school_class_id=class_id,
            section_id=section_id
        ).annotate(
            roll_int=Cast('student__roll_number', output_field=IntegerField())
        ).aggregate(Max('roll_int'))

        last_roll = last_roll_data['roll_int__max']
        next_roll = (last_roll or 0) + 1
        return Response({"next_roll": str(next_roll)})

    def create(self, request, *args, **kwargs):
        # 1. Save the Student first
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()

        # 2. Extract Academic IDs
        class_id = request.data.get('class_id')
        section_id = request.data.get('section_id')
        session_id = request.data.get('session_id')

        # 3. Create the Enrollment record automatically
        if class_id and section_id and session_id:
            try:
                Enrollment.objects.create(
                    student=student,
                    school_class_id=int(class_id),
                    section_id=int(section_id),
                    session_id=int(session_id)
                )
            except Exception as e:
                print(f"Enrollment Error: {e}")

        # 4. Re-serialize to get updated enrollment field values (class_name, etc.)
        final_serializer = self.get_serializer(student)
        headers = self.get_success_headers(final_serializer.data)
        return Response(final_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()

        # Academic IDs from request
        class_id = request.data.get('class_id')
        section_id = request.data.get('section_id')
        session_id = request.data.get('session_id')

        if class_id and section_id and session_id:
            # Update or Create enrollment
            Enrollment.objects.update_or_create(
                student=student,
                defaults={
                    'school_class_id': int(class_id),
                    'section_id': int(section_id),
                    'session_id': int(session_id)
                }
            )

        return Response(serializer.data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
