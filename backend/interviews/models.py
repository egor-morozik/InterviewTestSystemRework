import uuid

from django.db import models

from candidates.models import Candidate
from core.models import User
from tests.models import Test


class Interview(models.Model):
    """
    Модель для технического интервью кандидата.
    """

    unique_link = models.UUIDField(
        "Уникальная ссылка на интервью",
        default=uuid.uuid4,
        editable=False,
        unique=True,
    )

    score = models.PositiveSmallIntegerField(
        "Оценка кандидата",
    )

    description = models.TextField(
        "Общее впечатление о кандидате",
    )

    completed = models.BooleanField(
        "Окончено",
        default=False,
    )

    tech_lead = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="interviews",
        verbose_name="Проводящий техническое интервью",
    )

    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.CASCADE,
        related_name="interviews",
        verbose_name="Кандидат",
    )

    test = models.ForeignKey(
        Test,
        on_delete=models.SET_NULL,
        related_name="in_interview",
        verbose_name="Набор заданий",
    )

    class Meta:
        verbose_name = "Результат интервью"
        verbose_name_plural = "Результаты интервью"
