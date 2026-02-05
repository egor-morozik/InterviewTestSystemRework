from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from .models import Candidate


class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = [
            "full_name",
            "email",
            "status",
            "position",
        ]
        validators = [
            UniqueTogetherValidator(
                queryset=Candidate.objects.all(),
                fields=[
                    "email",
                    "position",
                ],
                message="Вы уже подали заявку на эту должность.",
            ),
        ]
