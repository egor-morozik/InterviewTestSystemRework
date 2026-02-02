from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Attempt
from .serializers import (
    AdminAttemptSerializer,
    CandidateAttemptSerializer,
    TabSwitchLogSerializer,
)


class AdminAttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all()
    serializer_class = AdminAttemptSerializer


class CandidateAttemptViewSet(viewsets.GenericViewSet):
    queryset = Attempt.objects.all()
    serializer_class = CandidateAttemptSerializer
    lookup_field = "unique_link"

    @action(detail=True, methods=["post"], url_path="log")
    def log_switch(self, request, unique_link):
        attempt = self.get_object()
        serializer = TabSwitchLogSerializer(data=request.data)
        serializer.save(attempt=attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="start")
    def start(self, request, unique_link):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="finish")
    def finish(self, request, unique_link):
        attempt = self.get_object()

        if attempt.completed:
            return Response(
                {"error": "Тест уже пройден"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # save answers
        # start celery task to evaluate answers

        attempt.completed = True
        attempt.save()
        return Response({"status": "Тест успешно завершен"})
