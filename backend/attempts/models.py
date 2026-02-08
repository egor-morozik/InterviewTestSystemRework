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

    auto_score_percent = models.DecimalField(
        "Процент автооценки",
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    manual_score_percent = models.DecimalField(
        "Процент ручной оценки",
        max_digits=5,
        decimal_places=2,
        default=0,
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

    def calculate_percents(self):
        all_answers = self.answers.select_related("question").all()

        auto_questions = [answer for answer in all_answers if answer.question.evaluation_type in ["auto", "hybrid"]]
        auto_correct = sum(1 for a in auto_questions if (a.auto_score or 0) > 0)
        self.auto_score_percent = (auto_correct / len(auto_questions) * 100) if auto_questions else 0

        manual_questions = [answer for answer in all_answers if answer.question.evaluation_type in ["manual", "hybrid"]]
        manual_correct = sum(1 for a in manual_questions if a.manual_score)
        self.manual_score_percent = (manual_correct / len(manual_questions) * 100) if manual_questions else 0

    def mark_as_completed(self):
        self.completed = True
        self.completed_at = timezone.now()
        self.calculate_percents()
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

    auto_score = models.PositiveSmallIntegerField(
        "Баллы (автооценка)",
        null=True,
        blank=True,
    )

    manual_score = models.PositiveSmallIntegerField(
        "Баллы (ручная оценка)",
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
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "attempt",
                    "question",
                ],
                name="unique_answer_per_attempt",
            ),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.attempt.calculate_percents()
