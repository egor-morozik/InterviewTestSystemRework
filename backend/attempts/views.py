from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Attempt
from .serializers import AttemptSerializer

class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer
    lookup_field = 'unique_link'

    @action(detail=True, methods=['post'], url_path='log')
    def log_switch(self, request, unique_link=None):
        attempt = self.get_object()
        serializer = TabSwitchLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(attempt=attempt)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def submit(self, request, unique_link=None):
        attempt = self.get_object()
        if attempt.completed:
            return Response({"error": "Тест уже пройден"}, status=status.HTTP_400_BAD_REQUEST)
        
        # логика сохранения ответов 
        
        attempt.completed = True
        attempt.save()
        return Response({"status": "Тест успешно завершен"})
