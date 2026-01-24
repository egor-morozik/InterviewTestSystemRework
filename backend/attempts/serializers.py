from rest_framework import serializers

from .models import Answer, Attempt, TabSwitchLog


class TabSwitchLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TabSwitchLog
        fields = [
            "event_type",
            "timestamp",
        ]


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            "question",
            "response",
            "score",
        ]


class AttemptSerializer(serializers.ModelSerializer):

    tab_switches = TabSwitchLogSerializer(
        many=True,
        read_only=True,
    )

    answers = AnswerSerializer(
        many=True,
        read_only=True,
    )

    test_title = serializers.CharField(source="test.title")
    candidate_email = serializers.EmailField(source="candidate.email")

    class Meta:
        model = Attempt
        fields = [
            "unique_link",
            "sent",
            "completed",
            "candidate",
            "candidate_email",
            "test",
            "test_title",
            "tab_switches",
            "answers",
        ]
        read_only_fields = [
            "unique_link",
        ]
