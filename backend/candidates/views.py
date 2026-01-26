from rest_framework import viewsets

from .models import Candidate
from .serializers import CandidateSerializer


class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate
    serializer_class = CandidateSerializer
