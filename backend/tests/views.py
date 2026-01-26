from rest_framework import viewsets

from .models import Test
from .serializers import TestSerializer


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test
    serializer_class = TestSerializer
