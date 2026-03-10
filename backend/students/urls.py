from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, EnrollmentViewSet

router = DefaultRouter()

router.register("students", StudentViewSet)
router.register("enrollments", EnrollmentViewSet)

urlpatterns = router.urls