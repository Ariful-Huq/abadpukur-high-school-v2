from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, monthly_attendance

router = DefaultRouter()
router.register(r"", AttendanceViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("monthly/", monthly_attendance),
]