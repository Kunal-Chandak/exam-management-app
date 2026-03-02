from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Department
from .serializers import DepartmentSerializer
from accounts.permissions import IsOfficeInChargeOrAdmin

class DepartmentViewSet(viewsets.ViewSet):
    permission_classes = [IsOfficeInChargeOrAdmin]

    def list(self, request):
        depts = Department.objects()
        serializer = DepartmentSerializer(depts, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            dept = serializer.save()
            return Response(DepartmentSerializer(dept).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            dept = Department.objects.get(id=pk)
            serializer = DepartmentSerializer(dept)
            return Response(serializer.data)
        except Department.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        try:
            dept = Department.objects.get(id=pk)
            serializer = DepartmentSerializer(data=request.data)
            if serializer.is_valid():
                dept = serializer.update(dept, serializer.validated_data)
                return Response(DepartmentSerializer(dept).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Department.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            dept = Department.objects.get(id=pk)
            # delete all entities tied to this department, including any seating
            from classrooms.models import Classroom
            from students.models import Student
            from teachers.models import Teacher
            from subjects.models import Subject
            from seating.models import SeatingAssignment, SeatAssignment

            # classrooms: deleting a classroom should remove its seatings
            for cls in Classroom.objects(department=dept):
                # remove seat records for each seating in this classroom
                for sa in SeatingAssignment.objects(classroom=cls):
                    SeatAssignment.objects(seating=sa).delete()
                # also remove any leftover seats that somehow lack a seating ref
                SeatAssignment.objects(classroom=cls).delete()
                SeatingAssignment.objects(classroom=cls).delete()
                cls.delete()

            # subjects: remove subject-specific seatings as well
            for subj in Subject.objects(department=dept):
                for sa in SeatingAssignment.objects(subject=subj):
                    # delete seats that belong only to this seating
                    SeatAssignment.objects(seating=sa).delete()
                    sa.delete()
                subj.delete()

            # students: clear seat records and seating lists then delete
            for stu in Student.objects(department=dept):
                # remove any seat assignment for this student regardless of seating
                SeatAssignment.objects(student=stu).delete()
                for sa in SeatingAssignment.objects(students=stu):
                    sa.students = [s for s in sa.students if s.id != stu.id]
                    sa.save()
                stu.delete()

            # teachers: remove seatings they supervise before deleting
            for tea in Teacher.objects(department=dept):
                for sa in SeatingAssignment.objects(supervisors=tea):
                    SeatAssignment.objects(seating=sa).delete()
                    sa.delete()
                tea.delete()

            dept.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Department.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
