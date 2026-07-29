from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.SessionListCreateView.as_view(), name='session-list'),
    path('sessions/<int:pk>/', views.SessionDetailView.as_view(), name='session-detail'),
    path('sessions/<int:pk>/chat/', views.chat_message, name='session-chat'),
    path('evaluate-sketch/', views.evaluate_sketch_view, name='evaluate-sketch'),
    path('evaluations/', views.EvaluationListView.as_view(), name='evaluation-list'),
]