from rest_framework import serializers
from .models import ActivityLog, Achievement, UserStats

class ActivityLogSerializer(serializers.ModelSerializer):
    activity_display = serializers.CharField(source='get_activity_type_display', read_only=True)

    class Meta:
        model = ActivityLog
        fields = '__all__'
        read_only_fields = ('user', 'timestamp')

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ('user', 'earned_at')

class UserStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStats
        fields = '__all__'
        read_only_fields = ('user',)

class DashboardSerializer(serializers.Serializer):
    stats = UserStatsSerializer(read_only=True)
    recent_activity = ActivityLogSerializer(many=True, read_only=True)
    achievements = AchievementSerializer(many=True, read_only=True)