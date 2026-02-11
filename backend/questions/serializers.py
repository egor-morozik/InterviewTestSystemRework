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
        required=False,
        allow_empty=True,
    )

    tags = TagSerializer(
        many=True, 
        read_only=True,
    )

    tags_titles = serializers.SerializerMethodField()

    tags_list = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "content",
            "question_type",
            "question_complexity",
            "extra_data",
            "tags",
            "tags_titles",
            "tags_list",
            "choices",
            "evaluation_type",
            "expected_answer",
        ]

    def get_tags_titles(self, instance):
        return [tag.title for tag in instance.tags.all()]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if self.context.get("hide_correct_answers"):
            choices = instance.choices.all()
            if choices:
                choice_serializer = ChoiceSerializer(
                    choices, 
                    many=True, 
                    context={
                        "hide_correct_answers": True,
                    },
                )
                data["choices"] = choice_serializer.data
            data.pop("expected_answer", None)

        return data

    def create(self, validated_data):
        choices_data = validated_data.pop("choices", [])
        tags_list = validated_data.pop("tags_list", [])

        question = Question.objects.create(**validated_data)

        tags_to_set = []
        for tag_title in tags_list:
            tag, created = Tag.objects.get_or_create(title=tag_title)
            tags_to_set.append(tag)

        question.tags.set(tags_to_set)

        if choices_data:
            Choice.objects.bulk_create([Choice(question=question, **choice) for choice in choices_data])

        return question

    def validate(self, data):
        question_type = data.get("question_type")
        choices = data.get("choices", [])
        correct_count = sum(1 for c in choices if c.get("is_correct"))

        if question_type == Question.QuestionType.SINGLE_CHOICE and correct_count != 1:
            raise serializers.ValidationError({"choices": "Должен быть ровно один правильный ответ."})

        elif question_type == Question.QuestionType.MULTIPLE_CHOICE and correct_count < 1:
            raise serializers.ValidationError({"choices": "Выберите хотя бы один правильный ответ."})

        return data

    def update(self, instance, validated_data):
        choices_data = validated_data.pop("choices", None)
        tags_list = validated_data.pop("tags_list", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_list is not None:
            tags_to_set = []
            for tag_title in tags_list:
                tag, created = Tag.objects.get_or_create(title=tag_title)
                tags_to_set.append(tag)
            instance.tags.set(tags_to_set)

        if choices_data is not None:
            instance.choices.all().delete()
            if choices_data:
                Choice.objects.bulk_create([Choice(question=instance, **choice) for choice in choices_data])

        return instance
