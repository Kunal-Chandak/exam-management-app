from rest_framework import serializers
from .models import Department

class DepartmentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=100)
    code = serializers.CharField(max_length=20)

    def create(self, validated_data):
        return Department(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        return instance.save()
