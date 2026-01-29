from django.shortcuts import get_object_or_404
from rest_framework import generics, serializers, viewsets
from rest_framework.decorators import action

from questions.serializers import QuestionSerializer

from .models import Attempt
from .serializers import AttemptSerializer, TabSwitchLogSerializer


class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt
    serializer_class = AttemptSerializer


class TabSwitchCreateView(generics.CreateAPIView):
    serializer_class = TabSwitchLogSerializer

    def perform_create(self, serializer):
        attempt = get_object_or_404(
            Attempt,
            unique_link=self.kwargs["unique_link"],
        )
        serializer.save(attempt=attempt)


class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer
    lookup_field = 'unique_link'  

    @action(detail=True, methods=['post'])
    def submit(self, request, unique_link=None):
        attempt = self.get_object()
        if attempt.completed:
            return Response({"error": "Тест уже пройден"}, status=status.HTTP_400_BAD_REQUEST)
        
        # логика сохранения ответов
        
        attempt.completed = True
        attempt.save()
        return Response({"status": "Тест успешно завершен"})
