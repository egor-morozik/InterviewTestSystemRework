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

            if question.evaluation_type == question.QuestionEvalTypes.MANUAL:
                continue

            expected = question.get_expected_answer

            candidate_reply = answer.response

            def evaluate_answer(answer, is_right):
                answer.auto_score = 1 if is_right else 0

            match question.question_type:
                case question.QuestionType.TEXT:
                    evaluate_answer(answer, str(candidate_reply) == str(expected))

                case question.QuestionType.SINGLE_CHOICE:
                    evaluate_answer(answer, str(candidate_reply) == str(expected))

                case question.QuestionType.MULTIPLE_CHOICE:
                    candidate_list = sorted(json.loads(candidate_reply))
                    evaluate_answer(answer, candidate_list == expected)

                case _:
                    continue

            answer.save(
                update_fields=[
                    "auto_score",
                ],
            )

        attempt.calculate_percents()
        attempt.save()
