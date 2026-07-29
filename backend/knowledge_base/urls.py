from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list'),
    path('resources/', views.ResourceListView.as_view(), name='resource-list'),
    path('resources/<int:pk>/', views.ResourceDetailView.as_view(), name='resource-detail'),
]