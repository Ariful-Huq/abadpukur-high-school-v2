# backend/dashboard/views.py
from datetime import date
from django.db.models import Sum, Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from academics.models import Section
from students.models import Student
from teachers.models import Teacher
from attendance.models import Attendance
from fees.models import Payment

@api_view(["GET"])
@permission_classes([AllowAny])
def dashboard_stats(request):
    try:
        # 1. Basic Stats
        total_students = Student.objects.count()
        total_teachers = Teacher.objects.count()

        # 2. Overall Attendance %
        present_count = Attendance.objects.filter(
            date=date.today(),
            status__in=["P", "L"]
        ).count()
        
        attendance_percentage = 0
        if total_students > 0:
            attendance_percentage = round((present_count / total_students) * 100)

        # 3. Fees Collection (Sum of amount_paid)
        fee_data = Payment.objects.aggregate(total_sum=Sum('amount_paid'))
        total_fees_amount = fee_data.get('total_sum') or 0

        # 4. Section Performance Logic
        sections = Section.objects.all()
        section_list = []
        for sec in sections:
            # Note: adjust filter to match your specific Student-Section relationship model
            total_in_sec = Student.objects.filter(enrollment__section=sec).count()
            if total_in_sec > 0:
                present_in_sec = Attendance.objects.filter(
                    date=date.today(),
                    section=sec,
                    status__in=["P", "L"]
                ).count()
                perc = round((present_in_sec / total_in_sec) * 100)
                section_list.append({
                    "name": f"{sec.school_class.name}-{sec.name}",
                    "percentage": perc
                })
        
        # Sort for Highest and Lowest
        top_sections = sorted(section_list, key=lambda x: x['percentage'], reverse=True)[:5]
        lowest_sections = sorted(section_list, key=lambda x: x['percentage'])[:5]

        # 5. Recent 5 Payments
        recent_pay_queries = Payment.objects.select_related('student').order_by('-payment_date')[:5]
        recent_payments = [{
            "id": p.id,
            "student": f"{p.student.first_name} {p.student.last_name}",
            "amount": p.amount_paid,
            "date": p.payment_date.strftime("%d %b")
        } for p in recent_pay_queries]

        return Response({
            "students": total_students,
            "teachers": total_teachers,
            "present_today": attendance_percentage, 
            "total_fees": total_fees_amount,
            "top_sections": top_sections,
            "lowest_sections": lowest_sections,
            "recent_payments": recent_payments
        })

    except Exception as e:
        print(f"DASHBOARD ERROR: {str(e)}")
        return Response({"error": "Internal Server Error"}, status=500)