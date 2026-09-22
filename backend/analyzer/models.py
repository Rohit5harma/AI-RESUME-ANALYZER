from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    phone = models.CharField(max_length=20, default="", blank=True)
    location = models.CharField(max_length=100, default="", blank=True)
    preferred_role = models.CharField(max_length=100, default="", blank=True)
    experience = models.CharField(max_length=50, default="", blank=True)
    expected_salary = models.CharField(max_length=50, default="", blank=True)
    preferred_location = models.CharField(max_length=100, default="", blank=True)
    skills = models.TextField(
        default="React, Node.js, Django, Python",
        blank=True
    )
    github = models.CharField(max_length=200, default="", blank=True)
    linkedin = models.CharField(max_length=200, default="", blank=True)
    portfolio = models.CharField(max_length=200, default="", blank=True)
    leetcode = models.CharField(max_length=200, default="", blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Resume(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="resumes"
    )
    resume_file = models.FileField(upload_to="resumes/")
    file_name = models.CharField(max_length=255)
    extracted_text = models.TextField(
        blank=True,
        default=""
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.file_name}"


class ResumeAnalysis(models.Model):
    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name="analysis"
    )
    ats_score = models.IntegerField(default=0)
    skills = models.JSONField(default=list)
    missing_keywords = models.JSONField(default=list)
    strengths = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)
    score_breakdown = models.JSONField(default=dict, blank=True)
    categorized_skills = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis - {self.resume.file_name}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, "profile"):
        instance.profile.save()


class JobDescription(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="job_descriptions"
    )
    job_title = models.CharField(max_length=200)
    company = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.job_title} - {self.company or 'Unknown Company'}"


class ATSMatchAnalysis(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="ats_matches"
    )
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="ats_matches"
    )
    job_description = models.ForeignKey(
        JobDescription,
        on_delete=models.CASCADE,
        related_name="ats_matches"
    )
    ats_score = models.FloatField(default=0)
    matched_keywords = models.JSONField(default=list)
    missing_keywords = models.JSONField(default=list)
    matching_skills = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.resume.file_name} - {self.job_description.job_title}"

class BulletEnhancement(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bullet_enhancements"
    )
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="bullet_enhancements"
    )
    original_bullet = models.TextField()
    enhanced_bullet = models.TextField()
    style = models.CharField(max_length=100, default="Professional & Clear")
    target_role = models.CharField(max_length=150, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.resume.file_name} - {self.style}"
