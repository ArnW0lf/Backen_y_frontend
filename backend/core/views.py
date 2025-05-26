from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView
from django.shortcuts import get_object_or_404
from .models import GradeRecord, Attendance, CustomUser  
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny


User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]  # Permite registro sin autenticación
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()  # Esto usa el create() de tu UserSerializer
        
        # Opcional: Autenticar al usuario inmediatamente después del registro
        from rest_framework.authtoken.models import Token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            "message": "Usuario registrado exitosamente",
            "token": token.key,  # Opcional: devolver el token
            "user_id": user.id,
            "role": user.role
        }, status=status.HTTP_201_CREATED)

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

class TeacherSubjectViewSet(viewsets.ModelViewSet):
    queryset = TeacherSubject.objects.all()
    serializer_class = TeacherSubjectSerializer
    permission_classes = [IsAuthenticated]

class StudentEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = StudentEnrollment.objects.all()
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]

class GradeRecordViewSet(viewsets.ModelViewSet):
    queryset = GradeRecord.objects.all()
    serializer_class = GradeRecordSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_student(self, request):
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({'error': 'student_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        records = self.queryset.filter(student_id=student_id)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_subject(self, request):
        subject_id = request.query_params.get('subject_id')
        if not subject_id:
            return Response({'error': 'subject_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        records = self.queryset.filter(subject_id=subject_id)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_date(self, request):
        date = request.query_params.get('date')
        subject_id = request.query_params.get('subject_id')
        
        if not date or not subject_id:
            return Response(
                {'error': 'date and subject_id parameters are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendances = self.queryset.filter(date=date, subject_id=subject_id)
        serializer = self.get_serializer(attendances, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    

class ChildGradesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'PARENT':
            return Response(
                {"detail": "Acceso no autorizado"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        grades = GradeRecord.objects.filter(student__in=request.user.children.all())
        serializer = GradeRecordSerializer(grades, many=True)
        return Response(serializer.data)
    
class ChildAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'PARENT':
            return Response(
                {"detail": "Acceso no autorizado"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        attendance = Attendance.objects.filter(student__in=request.user.children.all())
        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)
    
class StudentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        student = get_object_or_404(CustomUser, id=student_id, role='STUDENT')
        
        if request.user.role == 'PARENT':
            if not request.user.children.filter(id=student.id).exists():
                return Response(
                    {"detail": "No tiene permiso para ver este estudiante"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Agrega tu lógica de serialización aquí
        serializer = UserSerializer(student)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ParentStudentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'PARENT':
            return Response(
                {"detail": "Acceso no autorizado"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        children = request.user.children.all()
        serializer = UserSerializer(children, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)