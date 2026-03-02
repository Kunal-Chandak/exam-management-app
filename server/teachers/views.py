from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Teacher
from .serializers import TeacherSerializer
from accounts.permissions import IsOfficeInChargeOrAdmin

class TeacherViewSet(viewsets.ViewSet):
    permission_classes = [IsOfficeInChargeOrAdmin]

    def list(self, request):
        # Pagination: default 20 per page
        limit = int(request.query_params.get('limit', 20))
        offset = int(request.query_params.get('offset', 0))
        dept_id = request.query_params.get('department')
        query = {}
        if dept_id:
            from departments.models import Department
            try:
                dept = Department.objects.get(id=dept_id)
                query['department'] = dept
            except:
                pass
        teachers = Teacher.objects(**query)[offset:offset+limit]
        total = Teacher.objects(**query).count()
        serializer = TeacherSerializer(teachers, many=True)
        return Response({'results': serializer.data, 'total': total, 'offset': offset, 'limit': limit})

    def create(self, request):
        serializer = TeacherSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            from departments.models import Department
            if 'department' in data:
                data['department'] = Department.objects.get(id=data['department'])
            teacher = Teacher(**data).save()
            return Response(TeacherSerializer(teacher).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            teacher = Teacher.objects.get(id=pk)
            serializer = TeacherSerializer(teacher)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        # editing a teacher's details (name, department, etc.) affects any
        # seating assignment that includes them because the supervisor list
        # holds a direct reference to the Teacher document.
        try:
            teacher = Teacher.objects.get(id=pk)
            serializer = TeacherSerializer(data=request.data)
            if serializer.is_valid():
                data = serializer.validated_data
                from departments.models import Department
                if 'department' in data:
                    data['department'] = Department.objects.get(id=data['department'])
                teacher = serializer.update(teacher, data)
                return Response(TeacherSerializer(teacher).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Teacher.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            teacher = Teacher.objects.get(id=pk)
            # any seating assignment where this teacher served as a supervisor should
            # be removed entirely (along with its seat records) as per requirements
            from seating.models import SeatingAssignment, SeatAssignment
            for sa in SeatingAssignment.objects(supervisors=teacher):
                # remove only the seats linked to that seating
                SeatAssignment.objects(seating=sa).delete()
                sa.delete()
            teacher.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Teacher.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
