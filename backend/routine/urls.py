from rest_framework.routers import DefaultRouter
from .views import PeriodViewSet, ClassRoutineViewSet

router = DefaultRouter()

router.register("periods", PeriodViewSet)
router.register("routines", ClassRoutineViewSet)

urlpatterns = router.urls