# backend/teachers/urls.py
from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet, SubjectAssignmentViewSet

router = DefaultRouter()

router.register("", TeacherViewSet, basename="teachers")
router.register("subject-assignments", SubjectAssignmentViewSet)

urlpatterns = router.urls
