from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Attendance
from .serializers import AttendanceSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


@api_view(["GET"])
def monthly_attendance(request):

    month = request.GET.get("month")
    year = request.GET.get("year")

    if not month or not year:
        return Response(
            {"error": "month and year are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        month = int(month)
        year = int(year)
    except ValueError:
        return Response(
            {"error": "month and year must be integers"},
            status=status.HTTP_400_BAD_REQUEST
        )

    attendance = Attendance.objects.filter(
        date__month=month,
        date__year=year
    )

    serializer = AttendanceSerializer(attendance, many=True)

    return Response(serializer.data)