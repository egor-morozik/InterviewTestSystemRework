from rest_framework import viewsets

from .models import Test
from .serializers import TestSerializer


class TestViewSet(viewsets.ModelViewSet):
    """
    Представление для работы с тестами.
    """

    queryset = Test.objects.prefetch_related("test_questions__question").all()
    serializer_class = TestSerializer
