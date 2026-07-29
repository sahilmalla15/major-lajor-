from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    SKILL_CHOICES = [('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    skill_level = models.CharField(max_length=20, choices=SKILL_CHOICES, default='beginner')
    artistic_goals = models.TextField(blank=True)
    interests = models.JSONField(default=list, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"