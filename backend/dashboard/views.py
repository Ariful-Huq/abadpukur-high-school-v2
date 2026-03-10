from datetime import date
from rest_framework.decorators import api_view
from rest_framework.response import Response


from students.models import Student
from teachers.models import Teacher
from attendance.models import Attendance
from fees.models import Payment


@api_view(["GET"])
def dashboard_stats(request):

    total_students = Student.objects.count()

    total_teachers = Teacher.objects.count()

    today_attendance = Attendance.objects.filter(
        date=date.today(),
        status="P"
    ).count()

    total_fees = Payment.objects.all().count()

    total_amount = sum(
        p.amount_paid for p in Payment.objects.all()
    )

    return Response({
        "students": total_students,
        "teachers": total_teachers,
        "present_today": today_attendance,
        "total_payments": total_fees,
        "total_fee_amount": total_amount
    })
