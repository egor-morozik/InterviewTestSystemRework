from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from evaluations.tasks import evaluate_answer

from .models import Attempt
from .serializers import (
    ActivityLogSerializer,
    AdminAttemptSerializer,
    AnswerSerializer,
    CandidateAttemptSerializer,
)


class AdminAttemptViewSet(viewsets.ModelViewSet):
    """
    Представление для предоставления всех попыток пройти тест и инфо. о попытках.
    """

    queryset = (
        Attempt.objects.select_related("candidate", "test")
        .prefetch_related(
            "tab_switches",
            "answers__question",
        )
        .all()
    )
    serializer_class = AdminAttemptSerializer


class CandidateAttemptViewSet(viewsets.GenericViewSet):
    """
    Представления для отдачи данных для прохождения теста кандидату.
    """

    queryset = (
        Attempt.objects.all()
        .select_related("candidate", "test")
        .prefetch_related(
            "activity",
            "answers__question",
        )
        .all()
    )
    serializer_class = CandidateAttemptSerializer

    @action(detail=True, methods=["post"], url_path="log")
    def log_switch(self, request, unique_link):
        attempt = self.get_object()
        serializer = ActivityLogSerializer(data=request.data)
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

        answers_data = request.data.get("answers", [])

        answer_serializer = AnswerSerializer(data=answers_data, many=True)
        answer_serializer.save(attempt=attempt)

        attempt.completed = True
        attempt.save()

        evaluate_answer.delay(attempt.id)

        return Response({"status": "Тест успешно завершен"})
