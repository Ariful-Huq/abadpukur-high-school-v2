# backend/students/urls.py
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, EnrollmentViewSet

router = DefaultRouter()

router.register("", StudentViewSet, basename="student")
router.register("enrollments", EnrollmentViewSet)

urlpatterns = router.urls
