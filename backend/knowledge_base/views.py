from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import ResourceCategory, ArtResource
from .serializers import ResourceCategorySerializer, ArtResourceListSerializer, ArtResourceDetailSerializer

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

class ResourceListView(generics.ListAPIView):
    serializer_class = ArtResourceListSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        queryset = ArtResource.objects.all()
        category = self.request.query_params.get('category')
        difficulty = self.request.query_params.get('difficulty')
        if category:
            queryset = queryset.filter(category__slug=category)
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
        return queryset

class ResourceDetailView(generics.RetrieveAPIView):
    queryset = ArtResource.objects.all()
    serializer_class = ArtResourceDetailSerializer
    permission_classes = (AllowAny,)