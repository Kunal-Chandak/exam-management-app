from rest_framework import serializers
from .models import User

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    role = serializers.CharField(max_length=20)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['id'] = str(instance.id)
        return data

    def create(self, validated_data):
        user = User(**validated_data)
        if 'password' in validated_data:
            user.set_password(validated_data['password'])
        return user.save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        return instance.save()
