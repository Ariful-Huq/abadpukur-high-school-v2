from rest_framework.routers import DefaultRouter
from .views import (
    AcademicSessionViewSet,
    ClassViewSet,
    SectionViewSet,
    SubjectViewSet
)

router = DefaultRouter()

router.register("sessions", AcademicSessionViewSet)
router.register("classes", ClassViewSet)
router.register("sections", SectionViewSet)
router.register("subjects", SubjectViewSet)

urlpatterns = router.urls
