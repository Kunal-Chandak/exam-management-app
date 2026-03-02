from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Classroom
from .serializers import ClassroomSerializer
from accounts.permissions import IsOfficeInChargeOrAdmin

class ClassroomViewSet(viewsets.ViewSet):
    permission_classes = [IsOfficeInChargeOrAdmin]

    def list(self, request):
        # Pagination: default 20 per page
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
        rooms = Classroom.objects(**query)[offset:offset+limit]
        total = Classroom.objects(**query).count()
        serializer = ClassroomSerializer(rooms, many=True)
        return Response({'results': serializer.data, 'total': total, 'offset': offset, 'limit': limit})

    def create(self, request):
        serializer = ClassroomSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            from departments.models import Department
            if 'department' in data:
                data['department'] = Department.objects.get(id=data['department'])
            room = Classroom(**data).save()
            return Response(ClassroomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            room = Classroom.objects.get(id=pk)
            serializer = ClassroomSerializer(room)
            return Response(serializer.data)
        except Classroom.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        # updating a classroom (e.g. changing room number or department) does
        # not require manual propagation because related seating assignments
        # store only a ReferenceField to the Classroom itself.  Any field
        # change on the room will be reflected automatically when those
        # documents are serialized later.
        try:
            room = Classroom.objects.get(id=pk)
            serializer = ClassroomSerializer(data=request.data)
            if serializer.is_valid():
                data = serializer.validated_data
                from departments.models import Department
                if 'department' in data:
                    data['department'] = Department.objects.get(id=data['department'])
                room = serializer.update(room, data)
                return Response(ClassroomSerializer(room).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Classroom.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            room = Classroom.objects.get(id=pk)
            # delete any seating assignments tied to this room (and their seat records)
            from seating.models import SeatingAssignment, SeatAssignment
            for sa in SeatingAssignment.objects(classroom=room):
                SeatAssignment.objects(seating=sa).delete()
            # cleanup any stray seats that didn't get linked properly
            SeatAssignment.objects(classroom=room).delete()
            SeatingAssignment.objects(classroom=room).delete()
            room.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Classroom.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
