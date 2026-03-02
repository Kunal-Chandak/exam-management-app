from rest_framework import serializers
from .models import Classroom

class ClassroomSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    room_number = serializers.CharField(max_length=20)
    department = serializers.CharField()  # MongoEngine ObjectId as string
    department_name = serializers.SerializerMethodField()
    capacity = serializers.IntegerField()

    def get_department_name(self, obj):
        # department may have been deleted; avoid throwing
        try:
            return obj.department.name if obj.department else ''
        except Exception as e:
            print(f"[CLASSROOMS SERIALIZER] warning invalid dept in get_department_name: {e}")
            return ''

    def to_representation(self, instance):
        data = super().to_representation(instance)
        dept_id = ''
        dept_name = ''
        if instance.department:
            try:
                dept_id = str(instance.department.id)
                dept_name = instance.department.name
            except Exception as e:
                print(f"[CLASSROOMS SERIALIZER] warning invalid dept reference: {e}")
        data['department'] = dept_id
        data['department_name'] = dept_name
        return data

    def create(self, validated_data):
        return Classroom(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        return instance.save()
