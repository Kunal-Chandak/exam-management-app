from rest_framework import serializers
from .models import Subject

class SubjectSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=100)
    subject_code = serializers.CharField(max_length=20)
    department = serializers.CharField(required=False, allow_blank=True)
    department_name = serializers.SerializerMethodField()
    exam_date = serializers.CharField(max_length=10, required=True, allow_blank=False)
    exam_time = serializers.CharField(max_length=5, required=True, allow_blank=False)

    def get_department_name(self, obj):
        try:
            return obj.department.name if obj.department else ''
        except Exception as e:
            print(f"[SUBJECTS SERIALIZER] warning invalid dept in get_department_name: {e}")
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
                print(f"[SUBJECTS SERIALIZER] warning invalid dept reference: {e}")
        data['department'] = dept_id
        data['department_name'] = dept_name
        # Explicitly exclude exam_id from response
        data.pop('exam_id', None)
        return data

    def create(self, validated_data):
        return Subject(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        return instance.save()
