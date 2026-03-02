from rest_framework import serializers
from .models import SeatingAssignment, SeatAssignment

class SeatAssignmentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    classroom = serializers.CharField()
    student = serializers.CharField()
    row = serializers.IntegerField()
    column = serializers.IntegerField()
    seat_number = serializers.IntegerField()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['classroom'] = str(instance.classroom.id) if instance.classroom else ''
        data['student'] = str(instance.student.id) if instance.student else ''
        data['student_name'] = instance.student.name if instance.student else ''
        data['student_roll'] = instance.student.roll_number if instance.student else ''
        # student.department might point to deleted department
        try:
            data['student_dept'] = str(instance.student.department.id) if instance.student and instance.student.department else ''
        except Exception as _e:
            print(f"[SERIALIZER] Warning: student dept reference invalid: {_e}")
            data['student_dept'] = ''
        data['seat_number'] = instance.seat_number if hasattr(instance, 'seat_number') and instance.seat_number else 0
        return data

    def create(self, validated_data):
        return SeatAssignment(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        return instance.save()

class SeatingAssignmentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    subject = serializers.CharField()
    classroom = serializers.CharField()
    supervisors = serializers.ListField(child=serializers.CharField(), required=False)
    students = serializers.ListField(child=serializers.CharField(), required=False)
    status = serializers.CharField(required=False, default='draft')
    grid_rows = serializers.IntegerField(required=False, default=0)
    grid_cols = serializers.IntegerField(required=False, default=0)
    created_at = serializers.CharField(required=False)
    updated_at = serializers.CharField(required=False)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        try:
            # Explicitly set the ID from the MongoEngine document
            data['id'] = str(instance.id) if instance.id else ''
            data['subject'] = str(instance.subject.id) if instance.subject else ''
            data['subject_name'] = instance.subject.name if instance.subject else ''
            data['classroom'] = str(instance.classroom.id) if instance.classroom else ''
            data['classroom_number'] = instance.classroom.room_number if instance.classroom else ''
            # department may be a broken DBRef if the department was deleted; guard against DoesNotExist
            dept_id = ''
            dept_name = ''
            if instance.classroom:
                try:
                    if instance.classroom.department:
                        dept_id = str(instance.classroom.department.id)
                        dept_name = instance.classroom.department.name
                except Exception as _e:  # could be DoesNotExist
                    print(f"[SERIALIZER] Warning: classroom dept reference invalid: {_e}")
            data['classroom_dept'] = dept_id
            data['classroom_dept_name'] = dept_name
            data['classroom_capacity'] = instance.classroom.capacity if instance.classroom else 0
            data['supervisors'] = [str(s.id) for s in instance.supervisors]
            # protect supervisor department dereference too
            sup_detail = []
            for s in instance.supervisors:
                sup_dept = ''
                try:
                    if s.department:
                        sup_dept = str(s.department.id)
                except Exception:
                    sup_dept = ''
                sup_detail.append({'id': str(s.id), 'name': s.name, 'dept': sup_dept})
            data['supervisors_detail'] = sup_detail
            data['students'] = [str(s.id) for s in instance.students]
            data['students_count'] = len(instance.students)
            data['status'] = instance.status if hasattr(instance, 'status') and instance.status else 'draft'
            data['grid_rows'] = instance.grid_rows if hasattr(instance, 'grid_rows') else 0
            data['grid_cols'] = instance.grid_cols if hasattr(instance, 'grid_cols') else 0
            data['created_at'] = instance.created_at if hasattr(instance, 'created_at') else ''
            data['updated_at'] = instance.updated_at if hasattr(instance, 'updated_at') else ''
            
            print(f"[SERIALIZER] Processing seating - ID: {data['id']}, Classroom: {data['classroom_number']}")
            
            # IMPORTANT: Fetch the actual seat grid from SeatAssignment collection
            # but only those seats belonging to *this* seating assignment.  Before we
            # added the ``seating`` reference the code would grab every seat in the
            # classroom which meant a second seating for a different subject/date
            # would clobber the first.  We still include a fallback to the old
            # behaviour in case an existing seat record hasn't been backfilled yet.
            if instance.classroom:
                try:
                    # prefer seats that explicitly reference this seating
                    seat_query = SeatAssignment.objects(seating=instance)
                    if seat_query.count() == 0:
                        # fallback: legacy records without a seating reference only
                        # (do not pull in seats from later assignments)
                        seat_query = SeatAssignment.objects(classroom=instance.classroom, seating__exists=False)
                    seat_assignments = seat_query
                    print(f"[SERIALIZER] Found {len(seat_assignments)} seat assignments for seating {instance.id}")
                    
                    data['seat_grid'] = [
                        {
                            'id': str(s.id),
                            'student_id': str(s.student.id) if s.student else '',
                            'student_name': s.student.name if s.student else '',
                            'student_roll': s.student.roll_number if s.student else '',
                            'row': s.row,
                            'column': s.column,
                            'seat_number': s.seat_number if hasattr(s, 'seat_number') and s.seat_number else 0,
                            'seating_id': str(s.seating.id) if hasattr(s, 'seating') and s.seating else ''
                        }
                        for s in seat_assignments
                    ]
                    print(f"[SERIALIZER] Seat grid created with {len(data['seat_grid'])} seats")
                except Exception as e:
                    print(f"[SERIALIZER] Error fetching seat assignments: {str(e)}")
                    data['seat_grid'] = []
            else:
                data['seat_grid'] = []
            
            return data
        except Exception as e:
            import traceback
            print(f"[SERIALIZER] Error in to_representation: {str(e)}")
            traceback.print_exc()
            raise

    def create(self, validated_data):
        return SeatingAssignment(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        return instance.save()
