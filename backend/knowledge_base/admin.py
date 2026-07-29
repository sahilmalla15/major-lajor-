from django.contrib import admin
from .models import ResourceCategory, ArtResource, ResourceChunk

@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}
    list_display = ('name', 'slug')

@admin.register(ArtResource)
class ArtResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'difficulty_level', 'created_at')
    list_filter = ('category', 'difficulty_level')
    search_fields = ('title', 'content')

@admin.register(ResourceChunk)
class ResourceChunkAdmin(admin.ModelAdmin):
    list_display = ('resource', 'chunk_index')