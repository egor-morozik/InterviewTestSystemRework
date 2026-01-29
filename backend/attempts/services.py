from django.core.exceptions import ValidationError

from .models import Answer


def submit_test_attempt(attempt, answers_data):
    if attempt.completed:
        raise ValidationError("Тест уже завершен")

    for ans in answers_data:
        Answer.objects.update_or_create(
            attempt=attempt,
            question_id=ans["question_id"],
            defaults={"response": ans["response"]},
        )

    attempt.completed = True
    attempt.save()
    # Mark logic 
