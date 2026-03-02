from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Subject
from .serializers import SubjectSerializer
from accounts.permissions import IsOfficeInChargeOrAdmin

class SubjectViewSet(viewsets.ViewSet):
    permission_classes = [IsOfficeInChargeOrAdmin]

    def list(self, request):
        # Pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        dept_id = request.query_params.get('department')
        query = {}
        if dept_id:
            try:
                from departments.models import Department
                dept = Department.objects.get(id=dept_id)
                query['department'] = dept
            except Exception:
                return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)
        subjects = Subject.objects(**query)[offset:offset+limit]
        total = Subject.objects(**query).count()
        serializer = SubjectSerializer(subjects, many=True)
        return Response({'results': serializer.data, 'total': total, 'offset': offset, 'limit': limit})

    def create(self, request):
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            # Check for duplicate exam_date
            exam_date = serializer.validated_data.get('exam_date', '').strip()
            if exam_date:
                existing = Subject.objects(exam_date=exam_date).first()
                if existing:
                    return Response(
                        {'error': f'Subject with exam date {exam_date} already exists'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            subject = serializer.save()
            return Response(SubjectSerializer(subject).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            subject = Subject.objects.get(id=pk)
            serializer = SubjectSerializer(subject)
            return Response(serializer.data)
        except Subject.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        # changing a subject's attributes (name, code, department, etc.)
        # automatically affects any seating assignments that reference it
        # because they store a ReferenceField to the Subject document.
        try:
            subject = Subject.objects.get(id=pk)
            serializer = SubjectSerializer(data=request.data)
            if serializer.is_valid():
                subject = serializer.update(subject, serializer.validated_data)
                return Response(SubjectSerializer(subject).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Subject.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            subject = Subject.objects.get(id=pk)
            # remove any seating arrangements for this subject, including
            # their seat assignments (remove only the seats belonging to the
            # seating record itself)
            from seating.models import SeatingAssignment, SeatAssignment
            for sa in SeatingAssignment.objects(subject=subject):
                SeatAssignment.objects(seating=sa).delete()
                sa.delete()
            subject.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Subject.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
