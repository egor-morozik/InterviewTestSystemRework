from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Модели сотрудников компании.
    """

    class Roles(models.TextChoices):
        ADMIN = "admin", "Администратор"
        HR = "hr", "Рекрутер"
        TECH_LEAD = "tech_lead", "Техлид"

    role = models.CharField(
        "Роль", max_length=15, choices=Roles.choices, default=Roles.ADMIN
    )

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self):
        return f"{self.role} - {self.username}"
