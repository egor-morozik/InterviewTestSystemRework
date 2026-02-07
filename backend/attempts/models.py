import uuid

from django.db import models
from django.utils import timezone

from candidates.models import Candidate
from questions.models import Question
from tests.models import Test


class Attempt(models.Model):
    """
    Модель состояния теста кандидата.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    sent = models.BooleanField(
        "Отправлено",
        default=False,
    )

    last_send = models.DateTimeField(
        "Последняя отправка теста",
        null=True,
        blank=True,
    )

    completed = models.BooleanField(
        "Пройден",
        default=False,
    )

    completed_at = models.DateTimeField(
        "Время завершения",
        null=True,
        blank=True,
    )

    total_score = models.PositiveSmallIntegerField(
        "Общий балл",
        null=True,
        blank=True,
    )

    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.CASCADE,
        related_name="attempts",
        verbose_name="Кандидат",
    )

    test = models.ForeignKey(
        Test,
        on_delete=models.PROTECT,
        related_name="attempts",
        verbose_name="Шаблон теста",
    )

    class Meta:
        verbose_name = "Попытка"
        verbose_name_plural = "Попытки"

    def __str__(self):
        return f"Приглашение для {self.candidate.email} - {self.test.title}"

    def mark_as_completed(self):
        self.completed = True
        self.completed_at = timezone.now()
        self.save()


class ActivityLog(models.Model):
    """
    Записи о подозрительной активности кандидата.
    """

    class EVENTS_TYPES(models.TextChoices):
        HIDDEN = "hidden", "ушёл"
        VISIBLE = "visible", "вернулся"
        COPYTEXT = "copytext", "скопировал текст"
        SCREENSHOT = "screenshot", "сделал скриншот"

    event_type = models.CharField(
        "Тип события",
        max_length=15,
        choices=EVENTS_TYPES.choices,
    )

    attempt = models.ForeignKey(
        Attempt,
        on_delete=models.CASCADE,
        related_name="activity",
        verbose_name="Приглашение",
    )

    timestamp = models.DateTimeField(
        "Время события",
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        verbose_name = "Лог подозрительных действий"
        verbose_name_plural = "Логи подозрительных действий"

    def __str__(self):
        return f"{self.attempt} - {self.get_event_type_display()} ({self.timestamp})"


class Answer(models.Model):
    """
    Ответ кандидата на вопрос теста.
    """

    response = models.TextField(
        "Ответ кандидата",
    )

    score = models.PositiveSmallIntegerField(
        "Баллы (автооценка)",
        null=True,
        blank=True,
    )

    attempt = models.ForeignKey(
        Attempt,
        on_delete=models.CASCADE,
        related_name="answers",
        verbose_name="Приглашение",
    )

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="answers",
        verbose_name="Вопрос",
    )

    class Meta:
        verbose_name = "Ответ"
        verbose_name_plural = "Ответы"
        constraints = [models.UniqueConstraint(fields=["attempt", "question"], name="unique_answer_per_attempt")]
