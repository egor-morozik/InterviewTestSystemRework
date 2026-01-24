from rest_framework import serializers

from .models import Choice, Question, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = [
            "title",
        ]


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = [
            "text",
            "is_correct",
        ]


class QuestionSerializer(serializers.ModelSerializer):

    choices = ChoiceSerializer(many=True)
    tags = TagSerializer(many=True)

    class Meta:
        model = Question
        fields = [
            "title",
            "content",
            "question_type",
            "question_complexity",
            "extra_data",
            "tags",
            "choices",
        ]
