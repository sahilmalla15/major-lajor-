from rest_framework import serializers
from .models import ChatSession, ChatMessage, SketchEvaluation

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('session', 'timestamp')

class ChatSessionListSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = ('id', 'title', 'created_at', 'updated_at', 'message_count', 'last_message')

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return msg.content[:100] if msg else ""

class ChatSessionDetailSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ('id', 'title', 'created_at', 'updated_at', 'messages')

class ChatInputSerializer(serializers.Serializer):
    message = serializers.CharField()

class SketchEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SketchEvaluation
        fields = '__all__'
        read_only_fields = ('user', 'created_at')