from django.db import models

from questions.models import Question


class Test(models.Model):
    """
    Модель теста состоящего из различных вопросов.
    """

    title = models.CharField(
        "Название теста",
        max_length=63,
        unique=True,
    )

    description = models.TextField(
        "Описание теста",
        blank=True,
    )

    time_limit = models.PositiveSmallIntegerField(
        "Ограничение по времени",
        default=0,
        help_text="В минутах. 0 - неограничен",
    )

    questions = models.ManyToManyField(
        Question,
        through="TestQuestion",
        related_name="tests",
        verbose_name="Вопросы",
    )

    class Meta:
        verbose_name = "Тест"
        verbose_name_plural = "Тесты"

    def __str__(self):
        return self.title


class TestQuestion(models.Model):
    """
    Модель для связывания вопросов внутри тестов.
    """

    test = models.ForeignKey(
        Test,
        on_delete=models.CASCADE,
        related_name="test_questions",
        verbose_name="Тест",
    )

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="in_tests",
        verbose_name="Вопрос",
    )

    order = models.PositiveSmallIntegerField(
        "Порядок вопроса в тесте",
        default=0,
        help_text="Чем меньше - тем раньше",
        db_index=True,
    )

    class Meta:
        ordering = [
            "order",
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["test", "question"],
                name="unique_test_question",
            ),
            models.UniqueConstraint(
                fields=["test", "order"],
                name="unique_order_per_test",
            ),
        ]
        verbose_name = "Вопрос в шаблоне"
        verbose_name_plural = "Вопросы в шаблоне"

    def __str__(self):
        return f"тест : {self.test.title} - номер : {self.order} - вопрос : {self.question.title}"
