# backend/users/views.py
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status, permissions, views
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import User, AuditLog
from .serializers import UserSerializer, AuditLogSerializer


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

# --- CUSTOM LOGIN LOGGING ---


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            username = request.data.get('username')
            UserModel = get_user_model()
            try:
                user = UserModel.objects.get(username=username)
                AuditLog.objects.create(
                    performed_by=user,
                    action='LOGIN',
                    target_model="User",
                    target_id=str(user.id),
                    ip_address=get_client_ip(request),
                    description=f"User {user.username} logged in successfully."
                )
            except UserModel.DoesNotExist:
                pass
        return response

# --- CUSTOM LOGOUT LOGGING ---


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            AuditLog.objects.create(
                performed_by=request.user,
                action='LOGOUT',
                target_model="User",
                target_id=str(request.user.id),
                ip_address=get_client_ip(request),
                description=f"User {request.user.username} logged out."
            )
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    pagination_class = None

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

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
        AuditLog.objects.create(
            performed_by=self.request.user,
            action='DELETE',
            target_model="User",
            target_id=str(user_id),
            ip_address=get_client_ip(self.request),
            description=f"User {username} was permanently deleted."
        )
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get("password")
        if not new_password:
            return Response({"error": "Password is required"}, status=400)

        user.set_password(new_password)
        user.force_logout_timestamp = timezone.now()
        user.save()

        AuditLog.objects.create(
            performed_by=request.user,
            action='UPDATE',
            target_model="User",
            target_id=str(user.id),
            ip_address=get_client_ip(request),
            description=f"Admin reset password for user: {user.username}"
        )
        return Response({"message": f"Password reset for {user.username}"})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def force_logout(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({"error": "You cannot force logout yourself."}, status=400)

        user.force_logout_timestamp = timezone.now()
        user.save()

        tokens = OutstandingToken.objects.filter(user=user)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

        AuditLog.objects.create(
            performed_by=request.user,
            action='LOGOUT',
            target_model="User",
            target_id=str(user.id),
            ip_address=get_client_ip(request),
            description=f"Admin forced logout for user: {user.username}"
        )
        return Response({"message": f"All sessions for {user.username} invalidated."})


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().select_related(
        'performed_by').order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
