# backend/users/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, AuditLog

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims for the frontend to read
        token['username'] = user.username
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        
        return token

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username", "password", "first_name", "last_name", "role", "phone", "is_active", "last_login"]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},
            "last_login": {"read_only": True}
        }

    def create(self, validated_data):
        # Use create_user to handle hashing automatically
        user = User.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password) # Hash if password is being changed
        instance.save()
        return instance

class AuditLogSerializer(serializers.ModelSerializer):
    # Use CharField to get the username string
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'performed_by', 'performed_by_name', 
            'action', 'target_model', 'target_id', 
            'description', 'timestamp', 'ip_address'
        ]