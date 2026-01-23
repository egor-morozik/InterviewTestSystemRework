from rest_framework import serializers
from .models import Attempt

class AttemptSerializer(serializers.ModelSerializer):
    
    candidate_name = serializers.ReadOnlyField(source='candidate.name')
    test_title = serializers.ReadOnlyField(source='test.title')

    class Meta:
        model = Attempt
        fields = [
            'sent', 
            'unique_link', 
            'completed', 
            'candidate_name', 
            'test_title',     
        ]
