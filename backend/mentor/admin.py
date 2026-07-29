from django.contrib import admin
from .models import ChatSession, ChatMessage, SketchEvaluation

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'updated_at')
    search_fields = ('user__username', 'title')

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'role', 'timestamp', 'content_preview')
    list_filter = ('role',)

    def content_preview(self, obj):
        return obj.content[:75]
    content_preview.short_description = 'Content'

@admin.register(SketchEvaluation)
class SketchEvaluationAdmin(admin.ModelAdmin):
    list_display = ('user', 'overall_score', 'created_at')
    search_fields = ('user__username',)