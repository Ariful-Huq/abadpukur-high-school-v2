# backend/users/views.py
from rest_framework import viewsets
from .models import User, AuditLog
from .serializers import UserSerializer, AuditLogSerializer

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class UserViewSet(viewsets.ModelViewSet):
    # Optimized query to include last_login and related fields
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLog.objects.create(
            performed_by=self.request.user,
            action='CREATE',
            target_model="User",
            target_id=str(instance.id),
            ip_address=get_client_ip(self.request),
            description=f"User {instance.username} was created."
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        AuditLog.objects.create(
            performed_by=self.request.user,
            action='UPDATE',
            target_model="User",
            target_id=str(instance.id),
            ip_address=get_client_ip(self.request),
            description=f"User {instance.username} was updated."
        )

    def perform_destroy(self, instance):
        username = instance.username
        user_id = instance.id
        # We log BEFORE deleting so we can capture the info
        AuditLog.objects.create(
            performed_by=self.request.user,
            action='DELETE',
            target_model="User",
            target_id=str(user_id),
            ip_address=get_client_ip(self.request),
            description=f"User {username} was permanently deleted."
        )
        instance.delete()

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().select_related('performed_by')
    serializer_class = AuditLogSerializer
