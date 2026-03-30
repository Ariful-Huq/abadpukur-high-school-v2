# backend/results/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Mark, Exam
from .serializers import MarkSerializer, ExamSerializer
from students.models import Enrollment


class MarkViewSet(viewsets.ModelViewSet):
    queryset = Mark.objects.all()
    serializer_class = MarkSerializer

    @action(detail=False, methods=['post'], url_path='bulk-entry')
    def bulk_entry(self, request):
        marks_data = request.data.get('marks_list', [])
        exam_id = request.data.get('exam_id')
        subject_id = request.data.get('subject_id')

        results = []
        for entry in marks_data:
            # entry should contain enrollment_id and the mark components
            obj, created = Mark.objects.update_or_create(
                enrollment_id=entry['enrollment_id'],
                subject_id=subject_id,
                exam_id=exam_id,
                defaults={
                    'written_marks': entry.get('written_marks', 0),
                    'objective_marks': entry.get('objective_marks', 0),
                    'practical_marks': entry.get('practical_marks', 0),
                }
            )
            results.append(MarkSerializer(obj).data)

        return Response(results, status=status.HTTP_201_CREATED)


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
