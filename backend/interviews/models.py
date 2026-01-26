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

    scrore = models.PositiveSmallIntegerField(
        "Оценка кандидата",
    )

    description = models.TextField(
        "Общее впечетление о кандидате",
    )

    completed = models.BooleanField(
        "Окончено",
    )

    tech_lead = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
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
        on_delete=models.Set_NULL,
        related_name="in_interview",
        verbose_name="Набор заданий",
    )

    class Meta:
        verbose_name = "Результат интервью"
        verbose_name_plural = "Результаты интерью"
