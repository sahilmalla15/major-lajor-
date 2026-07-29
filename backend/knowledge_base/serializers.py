from rest_framework import serializers
from .models import ResourceCategory, ArtResource, ResourceChunk

class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = '__all__'

class ResourceChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceChunk
        fields = '__all__'

class ArtResourceListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = ArtResource
        fields = ('id', 'title', 'description', 'category', 'category_name', 'difficulty_level', 'source_url', 'created_at')

class ArtResourceDetailSerializer(serializers.ModelSerializer):
    category = ResourceCategorySerializer(read_only=True)
    chunks = ResourceChunkSerializer(many=True, read_only=True)
    class Meta:
        model = ArtResource
        fields = '__all__'