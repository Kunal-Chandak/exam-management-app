from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ViewSet):
    # only login should be publicly accessible
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        return Response(status=status.HTTP_403_FORBIDDEN)

    def create(self, request):
        # user creation disabled via API
        return Response({'detail': 'User creation not allowed'}, status=status.HTTP_403_FORBIDDEN)

    def retrieve(self, request, pk=None):
        return Response(status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = User.objects(username=username).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'user_id': str(user.id),
                'email': user.email,
                'role': user.role,
            })
        return Response({'detail': 'Invalid credentials'}, status=400)
