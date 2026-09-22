from django.urls import path
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    register_user,
    login_user,
    upload_resume,
    get_profile,
    update_profile,
    analyze_resume,
    history,
    job_descriptions,
    job_description_detail,
    ats_match,
    ats_history,
    delete_resume,
    enhance_bullet_point_view,
    bullet_enhancer_resumes,
    save_bullet_enhancement,
    bullet_enhancement_history,
    preview_bullet_reanalysis,
)

def home(request):
    return JsonResponse({"message": "Backend API is running successfully!"})

urlpatterns = [
    path('', home, name='home'),
    path('api/register/', register_user, name='register'),
    path('api/login/', login_user, name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/resume/upload/', upload_resume, name='upload_resume'),
    path('api/analyze/<int:resume_id>/', analyze_resume, name='analyze_resume'),
    path('profile/', get_profile, name='get_profile'),
    path('profile/update/', update_profile, name='update_profile'),
    path('api/history/', history, name='history'),
    path('api/job-descriptions/', job_descriptions, name='job-descriptions'),
    path('api/job-descriptions/<int:job_id>/', job_description_detail, name='job-description-detail'),
    path('api/ats-match/', ats_match, name='ats_match'),
    path('api/ats-history/', ats_history, name='ats_history'),
    path('api/resume/<int:resume_id>/', delete_resume, name='delete_resume'),
    path('api/enhance-bullet/', enhance_bullet_point_view, name='enhance_bullet'),
    path('api/bullet-enhancer/resumes/', bullet_enhancer_resumes, name='bullet_enhancer_resumes'),
    path('api/bullet-enhancer/save/', save_bullet_enhancement, name='save_bullet_enhancement'),
    path('api/bullet-enhancer/history/', bullet_enhancement_history, name='bullet_enhancement_history'),
    path('api/bullet-enhancer/preview/', preview_bullet_reanalysis, name='preview_bullet_reanalysis'),
]