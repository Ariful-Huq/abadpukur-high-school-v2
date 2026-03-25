# backend/attendance/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import Attendance
from .serializers import AttendanceSerializer
from students.models import Student, Enrollment

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    @action(detail=False, methods=['post'], url_path='bulk-mark')
    def bulk_mark(self, request):
        """
        Handles saving attendance for an entire class/section at once.
        Uses update_or_create to prevent duplicate entries for the same day.
        """
        attendance_data = request.data.get('attendance_list', [])
        date = request.data.get('date')
        
        results = []
        for entry in attendance_data:
            obj, created = Attendance.objects.update_or_create(
                student_id=entry['student_id'],
                date=date,
                defaults={
                    'status': entry['status'],
                    'school_class_id': entry['class_id'],
                    'section_id': entry['section_id']
                }
            )
            results.append(AttendanceSerializer(obj).data)
            
        return Response({"message": "Attendance marked successfully", "data": results}, status=status.HTTP_201_CREATED)

@api_view(["GET"])
def monthly_attendance(request):
    """
    Generates a 31-day grid report for a specific month/year/class.
    Used by MonthlyAttendance.jsx for the table and Excel export.
    """
    month = request.query_params.get("month")
    year = request.query_params.get("year")
    class_id = request.query_params.get("class_id")
    section_id = request.query_params.get("section_id")

    if not month or not year:
        return Response({"error": "month and year are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        month = int(month)
        year = int(year)
        
        # Filter students based on Class/Section via Enrollment
        students = Student.objects.all()
        if class_id or section_id:
            enroll_filters = {}
            if class_id: enroll_filters['school_class_id'] = class_id
            if section_id: enroll_filters['section_id'] = section_id
            
            student_ids = Enrollment.objects.filter(**enroll_filters).values_list('student_id', flat=True)
            students = students.filter(id__in=student_ids)

        # Get attendance records
        attendance_records = Attendance.objects.filter(date__month=month, date__year=year)

        # Format for the 31-day grid
        report = []
        for student in students:
            days_data = {str(day): "" for day in range(1, 32)}
            student_recs = attendance_records.filter(student=student)
            
            for rec in student_recs:
                days_data[str(rec.date.day)] = rec.status

            report.append({
                "student_id": student.id,
                "student_name": f"{student.first_name} {student.last_name}",
                "roll": student.roll_number,
                "days": days_data
            })

        return Response(report)
        
    except ValueError:
        return Response({"error": "month and year must be integers"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
