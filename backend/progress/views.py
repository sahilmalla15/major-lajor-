from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from .models import ActivityLog, Achievement, UserStats
from .serializers import ActivityLogSerializer, AchievementSerializer, UserStatsSerializer, DashboardSerializer

class UserStatsView(generics.RetrieveAPIView):
    serializer_class = UserStatsSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        stats, created = UserStats.objects.get_or_create(user=self.request.user)
        return stats

class RecentActivityView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        limit = self.request.query_params.get('limit', 20)
        return ActivityLog.objects.filter(user=self.request.user)[:int(limit)]

class AchievementListView(generics.ListAPIView):
    serializer_class = AchievementSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Achievement.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    stats, _ = UserStats.objects.get_or_create(user=request.user)
    recent = ActivityLog.objects.filter(user=request.user)[:10]
    achievements = Achievement.objects.filter(user=request.user)

    # Update streak
    today = timezone.now().date()
    if stats.last_active_date != today:
        if stats.last_active_date and (today - stats.last_active_date).days == 1:
            stats.streak_days += 1
        elif stats.last_active_date and (today - stats.last_active_date).days > 1:
            stats.streak_days = 1
        elif not stats.last_active_date:
            stats.streak_days = 1
        stats.last_active_date = today
        stats.save()

    data = {
        'stats': UserStatsSerializer(stats).data,
        'recent_activity': ActivityLogSerializer(recent, many=True).data,
        'achievements': AchievementSerializer(achievements, many=True).data,
    }
    return Response(data)