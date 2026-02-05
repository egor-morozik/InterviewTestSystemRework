from rest_framework import serializers

from questions.serializers import QuestionSerializer

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

    question_text = serializers.CharField(source="question.text", read_only=True)

    class Meta:
        model = Answer
        fields = [
            "question",
            "question_text",
            "response",
            "score",
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
