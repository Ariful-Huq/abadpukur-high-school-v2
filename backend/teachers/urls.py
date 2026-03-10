from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet, SubjectAssignmentViewSet

router = DefaultRouter()

router.register("teachers", TeacherViewSet)
router.register("subject-assignments", SubjectAssignmentViewSet)

urlpatterns = router.urls