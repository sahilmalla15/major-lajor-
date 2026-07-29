from django.db import models
from django.contrib.auth.models import User

class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=200, default='New Conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"

class ChatMessage(models.Model):
    ROLE_CHOICES = [('user','User'), ('assistant','Assistant')]
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    retrieved_chunks = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"

class SketchEvaluation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sketch_evaluations')
    submission = models.ForeignKey('learning.UserDrawingSubmission', on_delete=models.SET_NULL, null=True, blank=True)
    original_image = models.ImageField(upload_to='evaluations/')
    evaluation_result = models.TextField()
    overall_score = models.IntegerField(default=0)
    strengths = models.JSONField(default=list)
    improvements = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - Score: {self.overall_score}"