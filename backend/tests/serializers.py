from rest_framework import serializers

from questions.serializers import QuestionSerializer

from .models import Test, TestQuestion


class TestQuestionSerializer(serializers.ModelSerializer):

    question = QuestionSerializer()

    class Meta:
        model = TestQuestion
        fields = [
            "question",
            "order",
        ]


class TestSerializer(serializers.ModelSerializer):

    test_questions = TestQuestionSerializer(
        many=True,
    )

    class Meta:
        model = Test
        fields = [
            "id",
            "title",
            "description",
            "time_limit",
            "test_questions",
        ]
