from django.db import models


class Candidate(models.Model):
    """
    Модель кандидата на получение должности.
    """

    class CandidateStatus(models.TextChoices):
        TEST = "test", "тестирование"
        INTERVIEW = "interview", "интервью"

    full_name = models.CharField(
        "ФИО",
        max_length=255,
    )

    email = models.EmailField(
        "Электронная почта",
        unique=True,
    )

    position = models.CharField(
        "Претендуемая должность",
        max_length=100,
    )

    status = models.CharField(
        "Статус кандидата",
        choices=CandidateStatus.choices,
        default=CandidateStatus.TEST,
        max_length=15,
    )

    class Meta:
        verbose_name = "Кандидат"
        verbose_name_plural = "Кандидаты"

    def __str__(self):
        return self.full_name
