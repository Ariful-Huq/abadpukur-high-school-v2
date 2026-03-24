# backend/users/views.py
from rest_framework import viewsets
from .models import User, AuditLog
from .serializers import UserSerializer, AuditLogSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        # Save the user first
        instance = serializer.save()
        # Create the Audit Log manually with the current logged-in user
        AuditLog.objects.create(
            performed_by=self.request.user,
            action='CREATE',
            target_model="User",
            target_id=str(instance.id),
            description=f"User {instance.username} was created by {self.request.user.username}."
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        AuditLog.objects.create(
            performed_by=self.request.user,
            action='UPDATE',
            target_model="User",
            target_id=str(instance.id),
            description=f"User {instance.username} was updated."
        )

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().select_related('performed_by') # Optimization
    serializer_class = AuditLogSerializer