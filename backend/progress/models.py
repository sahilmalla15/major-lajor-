from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class ActivityLog(models.Model):
    ACTIVITY_TYPES = [
        ('lesson_complete','Lesson Completed'), ('exercise_done','Exercise Done'),
        ('mentor_query','AI Mentor Query'), ('submission','Drawing Submitted'),
        ('login','Login'), ('roadmap_generated','Roadmap Generated'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    duration_minutes = models.IntegerField(default=0)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.get_activity_type_display()} - {self.timestamp.date()}"

class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='trophy')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    total_lessons_completed = models.IntegerField(default=0)
    total_exercises_done = models.IntegerField(default=0)
    total_mentor_queries = models.IntegerField(default=0)
    total_submissions = models.IntegerField(default=0)
    streak_days = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Stats"