from rest_framework import serializers

from .models import JobDescription, ATSMatchAnalysis


class JobDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = [
            'id',
            'job_title',
            'company',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]


class ATSMatchAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ATSMatchAnalysis
        fields = [
            'id',
            'user',
            'resume',
            'job_description',
            'ats_score',
            'matched_keywords',
            'missing_keywords',
            'matching_skills',
            'recommendations',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'created_at',
        ]