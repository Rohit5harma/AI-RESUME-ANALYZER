from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("analyzer", "0006_atsmatchanalysis"),
    ]

    operations = [
        migrations.AddField(
            model_name="resumeanalysis",
            name="score_breakdown",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="resumeanalysis",
            name="categorized_skills",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.CreateModel(
            name="BulletEnhancement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("original_bullet", models.TextField()),
                ("enhanced_bullet", models.TextField()),
                ("style", models.CharField(default="Professional & Clear", max_length=100)),
                ("target_role", models.CharField(blank=True, default="", max_length=150)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("resume", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="bullet_enhancements", to="analyzer.resume")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="bullet_enhancements", to="auth.user")),
            ],
        ),
    ]
