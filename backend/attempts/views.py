from django_filters import FilterSet, NumberFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from evaluations.tasks import evaluate_answer

from .models import Attempt
from .serializers import (
    ActivityLogSerializer,
    AdminAttemptSerializer,
    AnswerSerializer,
    CandidateAttemptSerializer,
    ResultsSerializer,
)


class AdminAttemptViewSet(viewsets.ModelViewSet):
    """
    Представление для предоставления всех попыток пройти тест и инфо. о попытках.
    """

    queryset = (
        Attempt.objects.select_related("candidate", "test")
        .prefetch_related(
            "activity",
            "answers__question",
        )
        .all()
    )
    serializer_class = AdminAttemptSerializer

    def create(self, request, *args, **kwargs):
        candidate_id = request.data.get("candidate")
        test_id = request.data.get("test")

        if candidate_id and test_id:
            existing_attempt = Attempt.objects.filter(
                candidate_id=candidate_id, 
                test_id=test_id, 
                completed=True,
            ).first()

            if existing_attempt:
                return Response({"error": "Кандидат уже прошел этот тест."}, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)


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
        ).all()
    )
    serializer_class = CandidateAttemptSerializer

    @action(detail=True, methods=["post"], url_path="log")
    def log_switch(self, request, pk):
        attempt = self.get_object()
        serializer = ActivityLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(attempt=attempt)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], url_path="start")
    def start(self, request, pk):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="finish")
    def finish(self, request, pk):
        attempt = self.get_object()

        if attempt.completed:
            return Response(
                {"error": "Тест уже пройден"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        answers_data = request.data.get("answers", [])

        answer_serializer = AnswerSerializer(data=answers_data, many=True)
        if answer_serializer.is_valid():
            answer_serializer.save(attempt=attempt)

            attempt.mark_as_completed()

            evaluate_answer.delay(attempt.id)

            return Response({"status": "Тест успешно завершен"})

        return Response(answer_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttemptFilterSet(FilterSet):
    """
    FilterSet для фильтрации результатов тестов по процентам оценок.
    """

    auto_score_percent_min = NumberFilter(
        field_name="auto_score_percent", 
        lookup_expr="gte",
    )
    auto_score_percent_max = NumberFilter(
        field_name="auto_score_percent", 
        lookup_expr="lte",
    )
    manual_score_percent_min = NumberFilter(
        field_name="manual_score_percent", 
        lookup_expr="gte",
    )
    manual_score_percent_max = NumberFilter(
        field_name="manual_score_percent", 
        lookup_expr="lte",
    )

    class Meta:
        model = Attempt
        fields = []


class ResultsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для отображения результатов прохождения тестов.
    """

    queryset = (
        Attempt.objects.filter(completed=True)
        .select_related("candidate", "test")
        .prefetch_related("answers__question")
        .order_by("-completed_at")
    )

    serializer_class = ResultsSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = AttemptFilterSet

    search_fields = [
        "candidate__full_name",
        "candidate__email",
        "test__title",
    ]

    ordering_fields = [
        "completed_at",
        "auto_score_percent",
        "manual_score_percent",
    ]

    ordering = ["-completed_at"]

    @action(detail=True, methods=["patch"], url_path="answer/(?P<answer_id>[^/.]+)/score")
    def update_answer_score(self, request, pk=None, answer_id=None):
        attempt = self.get_object()
        answer = attempt.answers.get(id=answer_id)

        manual_score = request.data.get("manual_score")
        if manual_score is not None:
            manual_score = int(manual_score)
            answer.manual_score = manual_score
            answer.save()
            attempt.refresh_from_db()
            return Response(
                {"message": "Updated successfully", "manual_score_percent": float(attempt.manual_score_percent)},
                status=status.HTTP_200_OK,
            )
        return Response({"error": "manual_score is required"}, status=status.HTTP_400_BAD_REQUEST)
