from django.db import models

class ResourceCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name_plural = "Resource categories"

    def __str__(self):
        return self.name

class ArtResource(models.Model):
    DIFFICULTY_CHOICES = [('beginner','Beginner'), ('intermediate','Intermediate'), ('advanced','Advanced')]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    content = models.TextField()
    category = models.ForeignKey(ResourceCategory, on_delete=models.SET_NULL, null=True, related_name='resources')
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    source_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ResourceChunk(models.Model):
    resource = models.ForeignKey(ArtResource, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.IntegerField()
    content = models.TextField()
    embedding = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['chunk_index']

    def __str__(self):
        return f"{self.resource.title} - Chunk {self.chunk_index}"