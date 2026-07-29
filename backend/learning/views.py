from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import LearningModule, Lesson, Exercise, DrawingAnimation, UserRoadmap, RoadmapItem, UserDrawingSubmission
from .serializers import (
    LearningModuleListSerializer, ModuleDetailSerializer, LessonDetailSerializer,
    ExerciseListSerializer, DrawingAnimationSerializer, UserDrawingSubmissionSerializer,
    UserRoadmapSerializer, RoadmapItemSerializer
)

class ModuleListView(generics.ListAPIView):
    queryset = LearningModule.objects.all()
    serializer_class = LearningModuleListSerializer
    permission_classes = (AllowAny,)

class ModuleDetailView(generics.RetrieveAPIView):
    queryset = LearningModule.objects.all()
    serializer_class = ModuleDetailSerializer
    permission_classes = (AllowAny,)

class LessonDetailView(generics.RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonDetailSerializer
    permission_classes = (AllowAny,)

class ExerciseListView(generics.ListAPIView):
    serializer_class = ExerciseListSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        queryset = Exercise.objects.all()
        difficulty = self.request.query_params.get('difficulty')
        category = self.request.query_params.get('category')
        lesson_id = self.request.query_params.get('lesson')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if category:
            queryset = queryset.filter(category=category)
        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)
        return queryset

class ExerciseAnimationView(generics.RetrieveAPIView):
    queryset = DrawingAnimation.objects.all()
    serializer_class = DrawingAnimationSerializer
    permission_classes = (AllowAny,)

    def get_object(self):
        exercise_id = self.kwargs['pk']
        exercise = get_object_or_404(Exercise, pk=exercise_id)
        animation = DrawingAnimation.objects.filter(exercise=exercise).first()
        if not animation:
            animation = DrawingAnimation.objects.filter(lesson=exercise.lesson).first()
        if not animation:
            return None
        return animation

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_drawing(request, pk):
    exercise = get_object_or_404(Exercise, pk=pk)
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
    submission = UserDrawingSubmission.objects.create(
        user=request.user,
        exercise=exercise,
        image=request.FILES['image']
    )
    serializer = UserDrawingSubmissionSerializer(submission)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserSubmissionListView(generics.ListAPIView):
    serializer_class = UserDrawingSubmissionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return UserDrawingSubmission.objects.filter(user=self.request.user)

class CurrentRoadmapView(generics.RetrieveAPIView):
    serializer_class = UserRoadmapSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        roadmap = UserRoadmap.objects.filter(user=self.request.user, is_active=True).first()
        if not roadmap:
            modules = LearningModule.objects.all()[:3]
            roadmap = UserRoadmap.objects.create(user=self.request.user)
            for i, module in enumerate(modules):
                RoadmapItem.objects.create(roadmap=roadmap, module=module, order_index=i)
        return roadmap

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_roadmap(request):
    # Deactivate old roadmaps
    UserRoadmap.objects.filter(user=request.user, is_active=True).update(is_active=False)
    # Create new roadmap with all modules
    modules = LearningModule.objects.all()
    roadmap = UserRoadmap.objects.create(user=request.user)
    for i, module in enumerate(modules):
        RoadmapItem.objects.create(roadmap=roadmap, module=module, order_index=i)
    serializer = UserRoadmapSerializer(roadmap)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

class UpdateRoadmapItemView(generics.UpdateAPIView):
    queryset = RoadmapItem.objects.all()
    serializer_class = RoadmapItemSerializer
    permission_classes = (IsAuthenticated,)