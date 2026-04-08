# backend/api/v1/urls.py
from django.urls import path, include

urlpatterns = [
    path("dashboard/", include("dashboard.urls")),

    path("users/", include("users.urls")),
    path("academics/", include("academics.urls")),
    path("students/", include("students.urls")),
    path("teachers/", include("teachers.urls")),
    path("routine/", include("routine.urls")),
    path("attendance/", include("attendance.urls")),
    path("results/", include("results.urls")),
    path("fees/", include("fees.urls")),
    path("settings/", include("settings_app.urls")),

]
