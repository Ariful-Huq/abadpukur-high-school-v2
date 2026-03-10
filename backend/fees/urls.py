from rest_framework.routers import DefaultRouter
from .views import FeeStructureViewSet, PaymentViewSet

router = DefaultRouter()

router.register("fees", FeeStructureViewSet)
router.register("payments", PaymentViewSet)

urlpatterns = router.urls