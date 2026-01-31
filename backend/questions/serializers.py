from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import Choice, Question, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = [
            "title",
        ]


# Убрать искоррект для кандидата
class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = [
            "text",
            "is_correct",
        ]


class QuestionSerializer(serializers.ModelSerializer):

    choices = ChoiceSerializer(
        many=True
    )
    
    tags = serializers.SlugRelatedField(
        many=True, 
        slug_field="title", 
        queryset=Tag.objects.all(),
    )

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

    def create(self, validated_data):
        choices_data = validated_data.pop("choices")
        tags_data = validated_data.pop("tags")

        question = Question.objects.create(**validated_data)
        question.tags.set(tags_data)

        for choice in choices_data:
            Choice.objects.create(question=question, **choice)

        return question

    def validate(self, data):
        instance = Question(
            **{k: v for k, v in data.items() if k != "choices" and k != "tags"}
        )
        try:
            instance.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        choices_list = data.get("choices", [])
        question_type = data.get("question_type")

        correct_count = sum(1 for c in choices_list if c.get("is_correct"))

        if question_type == Question.QuestionType.SINGLE_CHOICE:
            if correct_count != 1:
                raise serializers.ValidationError(
                    {
                        "choices": "Для этого типа вопроса должен быть ровно ОДИН правильный ответ."
                    }
                )

        elif question_type == Question.QuestionType.MULTIPLE_CHOICE:
            if correct_count < 1:
                raise serializers.ValidationError(
                    {"choices": "Выберите хотя бы один правильный ответ."}
                )

        return data
