from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import Candidate
from .serializers import CandidateSerializer


class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate
    serializer_class = CandidateSerializer

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]
    filterset_fields = [
        "status",
        "position",
    ]
    search_fields = [
        "^full_name",
        "^email",
    ]
    ordering_fields = [
        "full_name",
    ]
