from rest_framework import serializers

from .models import Choice, Question, Tag


class TagSerializer(serializers.ModelSerializer):
    """
    Сериализатор тегов для вопросов.
    """

    class Meta:
        model = Tag
        fields = [
            "title",
        ]


class ChoiceSerializer(serializers.ModelSerializer):
    """
    Сериализатор варианта ответа в вопросах с выбором.
    """

    class Meta:
        model = Choice
        fields = [
            "id",
            "text",
            "is_correct",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if self.context.get("hide_correct_answers"):
            data.pop("is_correct", None)

        return data


class QuestionSerializer(serializers.ModelSerializer):
    """
    Сериализатор для моделей вопросов(заданий).
    """

    choices = ChoiceSerializer(
        many=True,
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

        Choice.objects.bulk_create(
            [Choice(question=question, **choice) for choice in choices_data]
        )

        return question

    def validate(self, data):
        question_type = data.get("question_type")
        choices = data.get("choices", [])
        correct_count = sum(1 for c in choices if c.get("is_correct"))

        if question_type == Question.QuestionType.SINGLE_CHOICE and correct_count != 1:
            raise serializers.ValidationError(
                {"choices": "Должен быть ровно один правильный ответ."}
            )

        elif (
            question_type == Question.QuestionType.MULTIPLE_CHOICE and correct_count < 1
        ):
            raise serializers.ValidationError(
                {"choices": "Выберите хотя бы один правильный ответ."}
            )

        return data
