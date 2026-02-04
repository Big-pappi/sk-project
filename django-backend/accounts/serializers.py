"""
Serializers for user authentication and profile management.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""
    
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'avatar_url', 'address', 'latitude', 'longitude',
            'date_joined'
        ]
        read_only_fields = ['id', 'email', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm Password')
    full_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2', 'full_name', 'phone', 'role']
        extra_kwargs = {
            'username': {'required': False},
            'role': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        full_name = validated_data.pop('full_name', '')
        
        # Split full name into first and last name
        if full_name:
            name_parts = full_name.split(' ', 1)
            validated_data['first_name'] = name_parts[0]
            if len(name_parts) > 1:
                validated_data['last_name'] = name_parts[1]
        
        # Generate username from email if not provided
        if not validated_data.get('username'):
            validated_data['username'] = validated_data['email'].split('@')[0]
        
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "New passwords do not match."})
        return attrs


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    full_name = serializers.CharField(required=False)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'full_name', 'phone', 'avatar_url', 'address', 'latitude', 'longitude']
    
    def update(self, instance, validated_data):
        full_name = validated_data.pop('full_name', None)
        if full_name:
            name_parts = full_name.split(' ', 1)
            validated_data['first_name'] = name_parts[0]
            if len(name_parts) > 1:
                validated_data['last_name'] = name_parts[1]
        
        return super().update(instance, validated_data)
