from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer
from accounts.permissions import IsOfficeInChargeOrAdmin

class StudentViewSet(viewsets.ViewSet):
    permission_classes = [IsOfficeInChargeOrAdmin]

    def list(self, request):
        # Pagination: default 20 per page, support limit and offset params
        limit = int(request.query_params.get('limit', 20))
        offset = int(request.query_params.get('offset', 0))
        # Optionally filter by department
        dept_id = request.query_params.get('department')
        query = {}
        if dept_id:
            from departments.models import Department
            try:
                dept = Department.objects.get(id=dept_id)
                query['department'] = dept
            except:
                pass
        # Fetch students with limit/offset for pagination
        students = Student.objects(**query)[offset:offset+limit]
        total = Student.objects(**query).count()
        serializer = StudentSerializer(students, many=True)
        return Response({'results': serializer.data, 'total': total, 'offset': offset, 'limit': limit})

    def create(self, request):
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            # resolve references
            from departments.models import Department
            from subjects.models import Subject
            if 'department' in data:
                data['department'] = Department.objects.get(id=data['department'])
            if 'subjects' in data:
                data['subjects'] = [Subject.objects.get(id=s) for s in data['subjects']]
            student = Student(**data).save()
            return Response(StudentSerializer(student).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            student = Student.objects.get(id=pk)
            serializer = StudentSerializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        # changing student details (dept, subjects, etc.) is safe; seat
        # assignments store a ReferenceField to this Student so updates show
        # up automatically without extra work.
        try:
            student = Student.objects.get(id=pk)
            serializer = StudentSerializer(data=request.data)
            if serializer.is_valid():
                data = serializer.validated_data
                from departments.models import Department
                from subjects.models import Subject
                if 'department' in data:
                    data['department'] = Department.objects.get(id=data['department'])
                if 'subjects' in data:
                    data['subjects'] = [Subject.objects.get(id=s) for s in data['subjects']]
                student = serializer.update(student, data)
                return Response(StudentSerializer(student).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Student.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            student = Student.objects.get(id=pk)
            # remove student from any seat assignments and seating lists
            from seating.models import SeatAssignment, SeatingAssignment
            SeatAssignment.objects(student=student).delete()
            # pull student id out of any seating assignment documents
            for sa in SeatingAssignment.objects(students=student):
                sa.students = [s for s in sa.students if s.id != student.id]
                sa.save()
            student.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Student.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
