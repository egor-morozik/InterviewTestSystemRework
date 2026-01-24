from rest_framework import serializers
from .models import Test, TestQuestion
from questions.serializers import QuestionSerializer


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
