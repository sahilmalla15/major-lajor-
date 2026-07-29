from rest_framework import serializers
from .models import LearningModule, Lesson, Exercise, DrawingAnimation, UserRoadmap, RoadmapItem, UserDrawingSubmission

class LearningModuleListSerializer(serializers.ModelSerializer):
    lesson_count = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)

    class Meta:
        model = LearningModule
        fields = ('id', 'title', 'description', 'order_index', 'difficulty', 'category', 'category_name', 'icon', 'lesson_count')

    def get_lesson_count(self, obj):
        return obj.lessons.count()

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class LessonDetailSerializer(serializers.ModelSerializer):
    exercises = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_exercises(self, obj):
        exercises = obj.exercises.all()
        return ExerciseListSerializer(exercises, many=True).data

class ModuleDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)

    class Meta:
        model = LearningModule
        fields = ('id', 'title', 'description', 'order_index', 'difficulty', 'category', 'category_name', 'icon', 'lessons')

class ExerciseListSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True, allow_null=True)

    class Meta:
        model = Exercise
        fields = ('id', 'lesson', 'lesson_title', 'title', 'description', 'difficulty', 'category', 'image_ref_url')

class DrawingAnimationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrawingAnimation
        fields = '__all__'

class UserDrawingSubmissionSerializer(serializers.ModelSerializer):
    exercise_title = serializers.CharField(source='exercise.title', read_only=True, allow_null=True)

    class Meta:
        model = UserDrawingSubmission
        fields = ('id', 'user', 'exercise', 'exercise_title', 'image', 'submitted_at', 'ai_feedback', 'score')
        read_only_fields = ('user', 'submitted_at', 'ai_feedback', 'score')

class RoadmapItemSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)

    class Meta:
        model = RoadmapItem
        fields = ('id', 'roadmap', 'module', 'module_title', 'order_index', 'status', 'started_at', 'completed_at')

class UserRoadmapSerializer(serializers.ModelSerializer):
    items = RoadmapItemSerializer(many=True, read_only=True)

    class Meta:
        model = UserRoadmap
        fields = ('id', 'user', 'generated_at', 'is_active', 'items')