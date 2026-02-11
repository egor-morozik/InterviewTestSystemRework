from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from .models import Candidate


class CandidateSerializer(serializers.ModelSerializer):
    """
    Сериализатор данных кандидата в системе.
    """

    tests_completed = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = [
            "id",
            "full_name",
            "email",
            "status",
            "position",
            "tests_completed",
        ]
        validators = [
            UniqueTogetherValidator(
                queryset=Candidate.objects.all(),
                fields=[
                    "email",
                    "position",
                ],
            ),
        ]

    def get_tests_completed(self, obj):
        return obj.attempts.filter(completed=True).count()
