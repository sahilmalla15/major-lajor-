from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
    path('activity/', views.RecentActivityView.as_view(), name='recent-activity'),
    path('achievements/', views.AchievementListView.as_view(), name='achievement-list'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
]