# backend/results/views.py
from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Mark, Exam
from .serializers import MarkSerializer, ExamSerializer
from academics.models import Subject
from students.models import Enrollment
# Import Attendance model - ensure the app name matches your directory
from attendance.models import Attendance


class MarkViewSet(viewsets.ModelViewSet):
    queryset = Mark.objects.all()
    serializer_class = MarkSerializer
    filterset_fields = ['exam', 'subject',
                        'enrollment__school_class', 'enrollment__section']

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

    @action(detail=False, methods=['get'], url_path='student-report')
    def student_report(self, request):
        enrollment_id = request.query_params.get('enrollment_id')
        exam_id = request.query_params.get('exam_id')

        if not enrollment_id or not exam_id:
            return Response({"error": "Missing enrollment_id or exam_id"}, status=400)

        # 1. Fetch Exam and Enrollment to get context (dates/student)
        try:
            exam = Exam.objects.get(id=exam_id)
            enrollment = Enrollment.objects.get(id=enrollment_id)
        except (Exam.DoesNotExist, Enrollment.DoesNotExist):
            return Response({"error": "Exam or Enrollment not found"}, status=404)

        # 2. Get all marks for this student in this exam
        marks = Mark.objects.filter(
            enrollment_id=enrollment_id, exam_id=exam_id)
        serializer = MarkSerializer(marks, many=True)

        # 3. Calculate Attendance for the Exam Period
        # We look for all attendance records for this student within the Exam start/end dates
        attendance_qs = Attendance.objects.filter(
            student=enrollment.student,
            date__range=[exam.start_date, exam.end_date]
        )

        total_working_days = attendance_qs.count()
        # Count 'P' (Present) and 'L' (Late) as being present
        present_days = attendance_qs.filter(status__in=['P', 'L']).count()

        attendance_percent = 0
        if total_working_days > 0:
            attendance_percent = round(
                (present_days / total_working_days) * 100, 2)

        # 4. Calculate Mark Totals
        total_obtained = marks.aggregate(Sum('total_marks'))[
            'total_marks__sum'] or 0

        report_data = {
            "marks": serializer.data,
            "attendance": {
                "total_days": total_working_days,
                "present_days": present_days,
                "percentage": attendance_percent,
                "start_date": exam.start_date,
                "end_date": exam.end_date
            },
            "summary": {
                "total_obtained": total_obtained,
                "subject_count": marks.count(),
                "average": total_obtained / marks.count() if marks.count() > 0 else 0
            }
        }

        return Response(report_data)

    @action(detail=False, methods=['get'], url_path='tabulation-sheet')
    def tabulation_sheet(self, request):
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')
        exam_id = request.query_params.get('exam_id')

        if not all([class_id, section_id, exam_id]):
            return Response({"error": "Missing filters"}, status=400)

        # 1. Get all subjects for this class
        subjects = Subject.objects.filter(school_class_id=class_id)
        subject_list = [{"id": s.id, "name": s.name, "code": s.code}
                        for s in subjects]

        # 2. Get all enrolled students in this section
        enrollments = Enrollment.objects.filter(
            school_class_id=class_id,
            section_id=section_id
        ).select_related('student').order_by('student__roll_number')

        # 3. Get all marks for this exam and class
        all_marks = Mark.objects.filter(
            exam_id=exam_id,
            enrollment__in=enrollments
        )

        # 4. Map marks to a dictionary for quick lookup: {(enrollment_id, subject_id): mark_obj}
        marks_map = {
            (m.enrollment_id, m.subject_id): {
                "total": m.total_marks,
                "grade": m.get_grade()
            } for m in all_marks
        }

        # NEW: Get the exam dates for attendance filtering
        exam = Exam.objects.get(id=exam_id)

        # 5. Build the final matrix
        sheet_data = []
        for enr in enrollments:
            # Calculate attendance for THIS student
            att_qs = Attendance.objects.filter(
                student=enr.student,
                date__range=[exam.start_date, exam.end_date]
            )
            total_days = att_qs.count()
            present = att_qs.filter(status__in=['P', 'L']).count()
            att_percent = round((present / total_days * 100),
                                1) if total_days > 0 else 0
            student_row = {
                "roll": enr.student.roll_number,
                "name": f"{enr.student.first_name} {enr.student.last_name}",
                "attendance_pc": att_percent,
                "marks": []
            }
            total_score = 0
            for sub in subjects:
                mark = marks_map.get((enr.id, sub.id), {
                    "total": "-", "grade": "-"})
                student_row["marks"].append(mark)
                if isinstance(mark["total"], (int, float)):
                    total_score += mark["total"]

            student_row["grand_total"] = total_score
            sheet_data.append(student_row)

        # 6. Sort and Assign Rank
        # Sort a temporary list to determine rank
        ranked_list = sorted(
            sheet_data,
            key=lambda x: (x['grand_total'], x['attendance_pc']),
            reverse=True
        )

        # Assign rank based on sorted position
        for index, ranked_item in enumerate(ranked_list):
            for student in sheet_data:
                if student['roll'] == ranked_item['roll']:
                    student['rank'] = index + 1
                    break

        return Response({
            "subjects": subject_list,
            "students": sheet_data
        })


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
