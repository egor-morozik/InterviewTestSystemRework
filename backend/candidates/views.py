from rest_framework import viewsets

from .models import Candidate
from .serializers import CandidateSerializer


class TestViewSet(viewsets.ModelViewSet):
    queryset = Candidate
    serializer_class = CandidateSerializer
