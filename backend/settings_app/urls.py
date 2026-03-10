from rest_framework.routers import DefaultRouter
from .views import (
    SchoolSettingsViewSet,
    GradingSystemViewSet,
    TermViewSet
)

router = DefaultRouter()

router.register("school-settings", SchoolSettingsViewSet)
router.register("grading", GradingSystemViewSet)
router.register("terms", TermViewSet)

urlpatterns = router.urls