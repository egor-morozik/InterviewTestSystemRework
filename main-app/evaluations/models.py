from django.db import models

from attempts.models import Attempt
from questions.models import Question

class ManualGrade(models.Model):
    """
    Ручная оценка кандидата.
    """

    attempt = models.OneToOneField(
        Attempt,
        on_delete=models.CASCADE,
        related_name="manual_grade",
        verbose_name="Приглашение",
    )
    
    score = models.PositiveSmallIntegerField(
        "Ручной балл",
        default=0,
        help_text="Общий балл (0-максимум)",
    )
    
    comment = models.TextField(
        "Комментарий оценивающего",
        blank=True,
    )

    class Meta:
        verbose_name = "Ручная оценка"
        verbose_name_plural = "Ручные оценки"
    
    def __str__(self):
        return (
            f"Ручная оценка кандидата {self.attempt.candidate.full_name} -" 
            f"{self.score} на наборе {self.attempt.test.title}"
        )


class QuestionFeedback(models.Model):
    """
    Ручная оценка ответа кандидата на вопрос. 
    """

    attempt = models.ForeignKey(
        Attempt, 
        on_delete=models.CASCADE, 
        related_name="feedbacks",
        verbose_name="Попытка пройти тест",
    )
    
    question = models.ForeignKey(
        Question, 
        on_delete=models.CASCADE,
        related_name="feedbacks",
        verbose_name="Исходный вопрос",
    )

    comment = models.TextField(
        "Комментарий оценщика",
        blank=True, 
    )
    
    score = models.PositiveSmallIntegerField(
        "Баллы за вопрос",
        null=True, 
        blank=True, 
    )

    class Meta:
        unique_together = (
            "attempt", 
            "question",
        )
        verbose_name = "Оценка ответа по вопросу"
        verbose_name_plural = "Оценки ответов по вопросу"  

    def __str__(self):
        return (
            f"Ручная оценка ответа кандидата {self.attempt.candidate.full_name} "
            f"на вопрос {self.question.title} - {self.score}"
            )
    