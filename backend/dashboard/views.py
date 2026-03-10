from datetime import date
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from students.models import Student
from teachers.models import Teacher
from attendance.models import Attendance
from fees.models import Payment


@api_view(["GET"])
@permission_classes([AllowAny])
def dashboard_stats(request):

    students = Student.objects.count()
    teachers = Teacher.objects.count()

    present_today = Attendance.objects.filter(
        date=date.today(),
        status="P"
    ).count()

    total_fees = Payment.objects.count()

    return Response({
        "students": students,
        "teachers": teachers,
        "present_today": present_today,
        "total_fees": total_fees
    })