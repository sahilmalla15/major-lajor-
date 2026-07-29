from django.contrib import admin
from .models import LearningModule, Lesson, Exercise, DrawingAnimation, UserRoadmap, RoadmapItem, UserDrawingSubmission

@admin.register(LearningModule)
class LearningModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'order_index')
    list_filter = ('difficulty',)

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'order_index', 'estimated_minutes')
    list_filter = ('module',)

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'lesson')
    list_filter = ('difficulty', 'category')

@admin.register(DrawingAnimation)
class DrawingAnimationAdmin(admin.ModelAdmin):
    list_display = ('title', 'exercise', 'lesson')

@admin.register(UserRoadmap)
class UserRoadmapAdmin(admin.ModelAdmin):
    list_display = ('user', 'generated_at', 'is_active')

@admin.register(RoadmapItem)
class RoadmapItemAdmin(admin.ModelAdmin):
    list_display = ('roadmap', 'module', 'status', 'order_index')

@admin.register(UserDrawingSubmission)
class UserDrawingSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'exercise', 'submitted_at', 'score')