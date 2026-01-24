from django.db import models

from questions.models import Question


class Test(models.Model):
    "Модель теста состоящего из различных вопросов."

    title = models.CharField(
        "Название теста",
        max_length=63,
        unique=True,
    )

    description = models.TextField(
        "Описание теста",
    )

    time_limit = models.PositiveSmallIntegerField(
        "Ограничение по времени",
        default=0,
        help_text="В минутах. Для бесконечности - 0",
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
    "Модель для связывания вопросов внутри тестов."

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
    )

    class Meta:
        ordering = [
            "order",
        ]
        unique_together = (
            "test",
            "question",
        )
        verbose_name = "Вопрос в шаблоне"
        verbose_name_plural = "Вопросы в шаблоне"

    def __str__(self):
        return f"{self.test} - {self.question} (порядок {self.order})"
