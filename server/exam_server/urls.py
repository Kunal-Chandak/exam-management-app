from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import UserViewSet
from departments.views import DepartmentViewSet
from classrooms.views import ClassroomViewSet
from subjects.views import SubjectViewSet
from students.views import StudentViewSet
from teachers.views import TeacherViewSet
from seating.views import SeatingViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'classrooms', ClassroomViewSet, basename='classroom')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'seating', SeatingViewSet, basename='seating')

urlpatterns = [
    path('api/', include(router.urls)),
]
