import json

from celery import shared_task
from django.apps import apps
from django.db import transaction


@shared_task
def evaluate_answer(attempt_id):
    """
    Фоновая задача для оценки ответов кандидата где это возможно автоматически.
    """
    Attempt = apps.get_model("attempts", "Attempt")

    attempt = Attempt.objects.select_related("test").prefetch_related("answers__question__choices").get(id=attempt_id)

    with transaction.atomic():
        for answer in attempt.answers.all():
            question = answer.question

            if question.is_manual_verification_only:
                continue

            expected = question.get_expected_answer

            candidate_reply = answer.response

            match question.question_type:
                case question.QuestionType.TEXT:
                    if str(candidate_reply) == str(expected):
                        answer.auto_score = 1

                case question.QuestionType.SINGLE_CHOICE:
                    if str(candidate_reply) == str(expected):
                        answer.auto_score = 1

                case question.QuestionType.MULTIPLE_CHOICE:
                    candidate_list = sorted(json.loads(candidate_reply))
                    if candidate_list == expected:
                        answer.auto_score = 1

                case _:
                    continue

            answer.save(
                update_fields=[
                    "auto_score",
                ],
            )
