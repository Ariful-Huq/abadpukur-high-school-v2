from rest_framework.routers import DefaultRouter
from .views import UserViewSet, AuditLogViewSet

router = DefaultRouter()
router.register("users", UserViewSet)
router.register("audit-logs", AuditLogViewSet)

urlpatterns = router.urls