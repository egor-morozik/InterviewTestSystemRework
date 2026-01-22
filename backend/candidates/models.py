from django.db import models

class Candidate(models.Model):
    """
    Модель кандидата на получение должности.
    """
    
    full_name = models.CharField(
        "ФИО",
        max_length=255,
    )

    email = models.EmailField(
        "Электронная почта",
        unique=True,
    )

    vacancy = models.CharField(
        "Претендуемая должность",
        max_length=100,
    )
    
    class Meta:
        verbose_name = "Кандидат"
        verbose_name_plural = "Кандидаты"

    def __str__(self):
        return self.full_name
    