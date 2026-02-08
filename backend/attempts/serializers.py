from rest_framework import serializers

from candidates.serializers import CandidateSerializer
from questions.serializers import QuestionSerializer
from tests.serializers import TestResultsSerializer

from .models import ActivityLog, Answer, Attempt


class ActivityLogSerializer(serializers.ModelSerializer):
    """
    Сериализатор данных о подозрительной активности во время прохождения теста.
    """

    class Meta:
        model = ActivityLog
        fields = [
            "event_type",
            "timestamp",
        ]


class AnswerSerializer(serializers.ModelSerializer):
    """
    Сериализатор данных ответа кандидата.
    """

    question_text = serializers.CharField(
        source="question.text",
        read_only=True,
    )

    class Meta:
        model = Answer
        fields = [
            "id",
            "question",
            "question_text",
            "response",
            "auto_score",
            "manual_score",
        ]


class AdminAttemptSerializer(serializers.ModelSerializer):
    """
    Сериализатор данных о попытках прохождения тестов кандидатами.
    """

    activity = ActivityLogSerializer(
        many=True,
        read_only=True,
    )

    answers = AnswerSerializer(
        many=True,
        read_only=True,
    )

    test_title = serializers.CharField(
        source="test.title",
        read_only=True,
    )

    candidate_name = serializers.CharField(
        source="candidate.full_name",
        read_only=True,
    )

    candidate_email = serializers.EmailField(
        source="candidate.email",
        read_only=True,
    )

    class Meta:
        model = Attempt
        fields = [
            "unique_link",
            "sent",
            "completed",
            "candidate",
            "candidate_name",
            "candidate_email",
            "test",
            "test_title",
            "activity",
            "answers",
            "last_send",
            "manual_score_percent",
            "auto_score_percent",
        ]
        read_only_fields = [
            "unique_link",
        ]


class CandidateAttemptSerializer(serializers.ModelSerializer):
    """
    Сериализатор данных о тесте для предоставления кандидату.
    """

    questions = QuestionSerializer(
        source="test.questions",
        many=True,
        read_only=True,
    )

    time_limit = serializers.IntegerField(
        source="test.time_limit",
        read_only=True,
    )

    class Meta:
        model = Attempt
        fields = [
            "unique_link",
            "questions",
            "time_limit",
            "completed",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.completed:
            data["questions"] = []
            data["message"] = "Тест уже завершен."
        return data


class ResultsSerializer(serializers.ModelSerializer):
    """
    Сериализатор для результатов тестирования.
    """

    candidate = CandidateSerializer(
        read_only=True,
    )

    test = TestResultsSerializer(
        read_only=True,
    )

    answers = AnswerSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Attempt
        fields = [
            "id",
            "candidate",
            "test",
            "auto_score_percent",
            "manual_score_percent",
            "last_send",
            "completed_at",
            "answers",
        ]
