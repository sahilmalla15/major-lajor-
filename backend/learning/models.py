from django.db import models
from django.contrib.auth.models import User

class LearningModule(models.Model):
    DIFFICULTY_CHOICES = [('beginner','Beginner'), ('intermediate','Intermediate'), ('advanced','Advanced')]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order_index = models.IntegerField(default=0)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    category = models.ForeignKey('knowledge_base.ResourceCategory', on_delete=models.SET_NULL, null=True, blank=True)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['order_index']

    def __str__(self):
        return self.title

class Lesson(models.Model):
    module = models.ForeignKey(LearningModule, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content = models.TextField()
    order_index = models.IntegerField(default=0)
    estimated_minutes = models.IntegerField(default=10)

    class Meta:
        ordering = ['order_index']

    def __str__(self):
        return f"{self.module.title} - {self.title}"

class Exercise(models.Model):
    DIFFICULTY_CHOICES = [('beginner','Beginner'), ('intermediate','Intermediate'), ('advanced','Advanced')]
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='exercises')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    instructions = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    category = models.CharField(max_length=100, blank=True)
    image_ref_url = models.URLField(blank=True)

    def __str__(self):
        return self.title

class DrawingAnimation(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.SET_NULL, null=True, blank=True, related_name='animations')
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='animations')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    canvas_width = models.IntegerField(default=800)
    canvas_height = models.IntegerField(default=600)
    stroke_data = models.JSONField()
    total_duration = models.IntegerField(default=30)
    thumbnail_url = models.URLField(blank=True)

    def __str__(self):
        return self.title

class UserRoadmap(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roadmaps')
    generated_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f"{self.user.username}'s Roadmap ({self.generated_at.date()})"

class RoadmapItem(models.Model):
    STATUS_CHOICES = [('pending','Pending'), ('in_progress','In Progress'), ('completed','Completed')]
    roadmap = models.ForeignKey(UserRoadmap, on_delete=models.CASCADE, related_name='items')
    module = models.ForeignKey(LearningModule, on_delete=models.CASCADE)
    order_index = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['order_index']

    def __str__(self):
        return f"{self.module.title} - {self.status}"

class UserDrawingSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    exercise = models.ForeignKey(Exercise, on_delete=models.SET_NULL, null=True, blank=True)
    image = models.ImageField(upload_to='submissions/')
    submitted_at = models.DateTimeField(auto_now_add=True)
    ai_feedback = models.TextField(blank=True)
    score = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user.username}'s submission - {self.exercise.title if self.exercise else 'Unknown'}"