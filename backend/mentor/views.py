import os
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import ChatSession, ChatMessage, SketchEvaluation
from .serializers import (
    ChatSessionListSerializer, ChatSessionDetailSerializer,
    ChatMessageSerializer, ChatInputSerializer, SketchEvaluationSerializer
)
from .services import search_knowledge_base, get_ai_response, evaluate_sketch

class SessionListCreateView(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatSessionListSerializer
        return ChatSessionListSerializer

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SessionDetailView(generics.RetrieveAPIView):
    serializer_class = ChatSessionDetailSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_message(request, pk):
    session = get_object_or_404(ChatSession, pk=pk, user=request.user)
    serializer = ChatInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user_message = serializer.validated_data['message']

    # Save user message
    user_msg = ChatMessage.objects.create(
        session=session,
        role='user',
        content=user_message
    )

    # RAG pipeline: search knowledge base
    retrieved_chunks = search_knowledge_base(user_message)
    chunk_data = [{'id': c.id, 'content': c.content[:200], 'resource_id': c.resource_id} for c in retrieved_chunks]

    # Get AI response
    ai_response = get_ai_response(user_message, retrieved_chunks)

    # Save assistant response
    assistant_msg = ChatMessage.objects.create(
        session=session,
        role='assistant',
        content=ai_response,
        retrieved_chunks=chunk_data
    )

    # Update session title if first message
    if session.messages.count() <= 2:
        session.title = user_message[:50] + ('...' if len(user_message) > 50 else '')
        session.save()

    return Response({
        'user_message': ChatMessageSerializer(user_msg).data,
        'assistant_message': ChatMessageSerializer(assistant_msg).data,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def evaluate_sketch_view(request):
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']
    image_path = os.path.join(settings.MEDIA_ROOT, 'evaluations', image_file.name)
    os.makedirs(os.path.dirname(image_path), exist_ok=True)

    with open(image_path, 'wb+') as f:
        for chunk in image_file.chunks():
            f.write(chunk)

    exercise_title = request.data.get('exercise_title', '')
    result = evaluate_sketch(image_path, exercise_title)

    evaluation = SketchEvaluation.objects.create(
        user=request.user,
        original_image='evaluations/' + image_file.name,
        evaluation_result=result.get('evaluation_result', ''),
        overall_score=result.get('overall_score', 0),
        strengths=result.get('strengths', []),
        improvements=result.get('improvements', []),
    )

    return Response(SketchEvaluationSerializer(evaluation).data, status=status.HTTP_201_CREATED)

class EvaluationListView(generics.ListAPIView):
    serializer_class = SketchEvaluationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return SketchEvaluation.objects.filter(user=self.request.user)