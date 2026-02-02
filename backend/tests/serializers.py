from rest_framework import serializers

from questions.models import Question
from questions.serializers import QuestionSerializer

from .models import Test, TestQuestion


class TestQuestionSerializer(serializers.ModelSerializer):
    """
    Сериализатор для промежуточной модели
    Связывающей тест и вопросы в нём добавляя порядок.
    """

    question = QuestionSerializer(
        read_only=True,
    )

    question_id = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all(),
        source="question",
        write_only=True,
    )

    class Meta:
        model = TestQuestion
        fields = [
            "question_id",
            "question",
            "order",
        ]


class TestSerializer(serializers.ModelSerializer):
    """
    Сериализатор тестов.
    """

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

    def create(self, validated_data):
        questions_data = validated_data.pop("test_questions")
        test = Test.objects.create(**validated_data)

        TestQuestion.objects.bulk_create(
            [TestQuestion(test=test, **item) for item in questions_data],
        )
