from rest_framework import viewsets

from .models import Attempt
from .serializers import AttemptSerializer


class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt
    serializer_class = AttemptSerializer
