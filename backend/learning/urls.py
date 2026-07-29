from django.urls import path
from . import views

urlpatterns = [
    path('modules/', views.ModuleListView.as_view(), name='module-list'),
    path('modules/<int:pk>/', views.ModuleDetailView.as_view(), name='module-detail'),
    path('lessons/<int:pk>/', views.LessonDetailView.as_view(), name='lesson-detail'),
    path('exercises/', views.ExerciseListView.as_view(), name='exercise-list'),
    path('exercises/<int:pk>/animation/', views.ExerciseAnimationView.as_view(), name='exercise-animation'),
    path('exercises/<int:pk>/submit-drawing/', views.submit_drawing, name='submit-drawing'),
    path('submissions/', views.UserSubmissionListView.as_view(), name='submission-list'),
    path('roadmap/', views.CurrentRoadmapView.as_view(), name='current-roadmap'),
    path('roadmap/generate/', views.generate_roadmap, name='generate-roadmap'),
    path('roadmap/item/<int:pk>/', views.UpdateRoadmapItemView.as_view(), name='update-roadmap-item'),
]