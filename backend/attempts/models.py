from django.db import models

from candidates.models import Candidate
from questions.models import Question
from tests.models import Test

import uuid


class Attempt(models.Model):
    """
    Модель состояния теста кандидата.
    """

    unique_link = models.UUIDField(
        "Уникальная ссылка на тест",
        default=uuid.uuid4,
        editable=False,
        unique=True,
    )
    
    sent = models.BooleanField(
        "Отправлено",
        default=False, 
    )
    
    completed = models.BooleanField(
        "Пройден",
        default=False,
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


class TabSwitchLog(models.Model):
    """
    Уходы кандидата со страницы теста во время его выполнения.
    """

    event_type = models.CharField(
        "Тип события",
        max_length=10,
        choices=(
            ("hidden", "Ушёл"), 
            ("visible", "Вернулся")
        ),
    )

    attempt = models.ForeignKey(
        Attempt,
        on_delete=models.CASCADE,
        related_name="tab_switches",
        verbose_name="Приглашение",
    )

    timestamp = models.DateTimeField(
        "Время события",
        auto_now_add=True, 
    )

    class Meta:
        ordering = ["timestamp"]
        verbose_name = "Лог ухода/возврата"
        verbose_name_plural = "Логи уходов/возвратов"

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
        default=0,
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
        unique_together = (
            "attempt", 
            "question",
        )
