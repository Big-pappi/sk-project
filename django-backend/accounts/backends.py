"""
Custom authentication backend for email-based authentication.
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Custom authentication backend that authenticates users using email address.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate using email address.
        The 'username' parameter contains the email address.
        """
        try:
            # Try to find the user by email
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            # Run the default password hasher once to reduce timing attacks
            User().set_password(password)
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def get_user(self, user_id):
        """Get user by primary key."""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
