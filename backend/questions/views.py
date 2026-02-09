from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import SearchFilter

from .models import Question
from .serializers import QuestionSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Представление вопроса который можно добавить в тест.
    """

    queryset = Question.objects.prefetch_related("tags", "choices").all()
    serializer_class = QuestionSerializer

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
    ]

    filterset_fields = [
        "question_type",
        "question_complexity",
        "tags__title",
        "evaluation_type",
    ]

    search_fields = [
        "^title",
    ]

    def get_serializer_context(self):
        context = super().get_serializer_context()

        if not self.request.user.is_authenticated:
            context["hide_correct_answers"] = True

        return context
