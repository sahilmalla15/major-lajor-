from django.contrib import admin
from .models import ActivityLog, Achievement, UserStats

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'description', 'timestamp')
    list_filter = ('activity_type',)

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'earned_at')
    search_fields = ('user__username', 'title')

@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_lessons_completed', 'streak_days', 'last_active_date')