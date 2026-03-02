from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings
from .models import User

class MongoJWTAuthentication(JWTAuthentication):
    """JWT auth that retrieves user from mongoengine instead of Django ORM."""

    def get_user(self, validated_token):
        # override to avoid Django model lookup
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            return None
        # ObjectId strings stored
        return User.objects(id=user_id).first()
