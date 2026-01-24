from django.db import models


class Question(models.Model):
    """
    Модель вопроса для системы тестирования.
    """

    class QuestionType(models.TextChoices):
        TEXT = "text", "Текстовый"
        SINGLE_CHOICE = "single_choice", "Выбор одного варианта"
        MULTIPLE_CHOICE = "multiple_choice", "Выбор нескольких вариантов"
        CODE = "code", "Написать код"

    class QuestionComplexity(models.TextChoices):
        EASY = "easy", "лёгкий"
        MEDIUM = "medium", "средний"
        HARD = "hard", "сложный"

    title = models.CharField(
        "Название вопроса",
        max_length=100,
        unique=True,
    )

    content = models.TextField(
        "Содержание вопроса",
    )

    question_type = models.CharField(
        "Тип вопроса",
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.TEXT,
    )

    question_complexity = models.CharField(
        "Сложность вопроса",
        max_length=10,
        choices=QuestionComplexity.choices,
        default=QuestionComplexity.EASY,
    )

    extra_data = models.JSONField(
        "Дополнительные параметры вопроса",
        default=dict,
        blank=True,
        help_text="JSON со специфичными полями (stdin, timeout и т.д.)",
    )

    tags = models.ManyToManyField(
        "Tag",
        verbose_name="Теги",
        related_name="questions",
        blank=True,
    )

    class Meta:
        verbose_name = "Вопрос"
        verbose_name_plural = "Вопросы"
        ordering = ["-id"]

    def __str__(self):
        return f"{self.title}"


class Tag(models.Model):
    """
    Теги для вопроса.
    """

    title = models.CharField(
        "Название тега",
        max_length=31,
        unique=True,
    )

    class Meta:
        verbose_name = "Тег"
        verbose_name_plural = "Теги"

    def __str__(self):
        return self.title


class Choice(models.Model):
    """
    Модель для специальных вариантов ответов на вопрос типа выбор ответа (-ов)
    """

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="choices",
        verbose_name="Вопрос",
    )
    text = models.CharField(
        "Содержимое варианта ответа",
        max_length=255,
    )
    is_correct = models.BooleanField(
        "Правильность ответа",
        default=False,
    )

    class Meta:
        verbose_name = "Вариант ответа"
        verbose_name_plural = "Варианты ответов"
