import re
import json
import pypdf
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from google import genai
from .models import (
    UserProfile,
    Resume,
    ResumeAnalysis,
    JobDescription,
    ATSMatchAnalysis,
    BulletEnhancement,
)
from .serializers import (
    JobDescriptionSerializer,
    ATSMatchAnalysisSerializer,
)
from .gemini_service import (
    analyze_resume_with_gemini,
    analyze_resume_heuristic,
    analyze_standalone_resume,
    enhance_bullet_point,
)

def extract_resume_bullets(text: str) -> list[str]:
    raw_lines = (text or "").replace("\r", "\n").splitlines()
    lines = [re.sub(r"\s+", " ", line).strip() for line in raw_lines]
    include_sections = {
        "experience",
        "work experience",
        "professional experience",
        "internship",
        "internships",
        "projects",
        "project",
    }
    exclude_sections = {
        "summary",
        "profile",
        "objective",
        "education",
        "skills",
        "technical skills",
        "certifications",
        "certification",
        "achievements",
        "achievements and certifications",
        "extracurricular activities",
        "coursework",
        "contact",
        "languages",
        "interests",
    }
    all_section_names = include_sections | exclude_sections
    action_words = (
        "built", "developed", "created", "implemented", "designed", "worked",
        "engineered", "integrated", "optimized", "deployed", "tested",
        "automated", "managed", "led", "contributed", "developing",
        "maintained", "configured", "analyzed", "collaborated", "improved",
        "fixed", "used", "utilized", "wrote", "completed", "architected",
        "organized", "includes", "enabled", "delivered", "implemented",
        "supported", "created", "performed", "handled",
    )
    bullet_prefix = re.compile(r"^\s*(?:[•●▪◦‣*-]\s*|\d+[.)]\s*)")
    current_section = ""
    collected: list[str] = []
    current_bullet: str | None = None

    def normalized_heading(line: str) -> str:
        return re.sub(r"[^a-z0-9& ]+", "", line.lower()).strip()

    def is_heading(line: str) -> bool:
        normalized = normalized_heading(line)
        if normalized in all_section_names:
            return True
        compact = normalized.replace("&", "and")
        if compact in all_section_names:
            return True
        return (
            len(line) <= 45
            and line.upper() == line
            and any(word in normalized for word in ("experience", "internship", "project", "education",
                                                    "skill", "certification", "achievement", "summary",
                                                    "profile", "objective", "activity"))
        )

    def looks_like_date(line: str) -> bool:
        return bool(re.fullmatch(
            r"(?:19|20)\d{2}(?:\s*[-–]\s*(?:19|20)\d{2})?|"
            r"(?:0?[1-9]|1[0-2])/\d{4}(?:\s*[-–]\s*(?:0?[1-9]|1[0-2])/\d{4})?",
            line.strip()
        ))

    def looks_like_project_heading(line: str) -> bool:
        if len(line) > 180 or re.search(r"[.!?]$", line):
            return False
        if re.search(r"\bsource\s+code\b", line, re.I):
            return True
        if "|" in line and not line.lstrip().startswith(("-", "•", "*")):
            return True
        return False

    def flush() -> None:
        nonlocal current_bullet
        if current_bullet:
            cleaned = re.sub(r"\s+", " ", current_bullet).strip()
            cleaned = cleaned.rstrip("•●▪◦‣-* ").strip()
            if len(cleaned) >= 20 and cleaned not in collected:
                collected.append(cleaned)
        current_bullet = None

    for raw in lines:
        if not raw:
            continue
        heading = normalized_heading(raw)
        if heading in all_section_names or heading.replace("&", "and") in all_section_names or is_heading(raw):
            flush()
            if heading in include_sections:
                current_section = heading
            elif heading.replace("&", "and") in include_sections:
                current_section = heading.replace("&", "and")
            else:
                current_section = ""
            continue
        if not current_section:
            continue
        marker_match = bullet_prefix.match(raw)
        cleaned = bullet_prefix.sub("", raw).strip() if marker_match else raw.strip()
        if not cleaned:
            continue
        if looks_like_date(cleaned):
            flush()
            continue
        if current_section in {"projects", "project"} and looks_like_project_heading(cleaned):
            flush()
            continue
        lower = cleaned.lower()
        if marker_match:
            flush()
            current_bullet = cleaned
            continue
        starts_with_action = lower.startswith(action_words)
        if starts_with_action:
            flush()
            current_bullet = cleaned
            continue
        if current_bullet and len(cleaned) > 3:
            current_bullet += " " + cleaned
    flush()
    return collected[:40]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bullet_enhancer_resumes(request):
    resumes = Resume.objects.filter(user=request.user, analysis__isnull=False).order_by('-uploaded_at')
    data = []
    for resume in resumes:
        analysis = ResumeAnalysis.objects.filter(resume=resume).first()
        score_breakdown = analysis.score_breakdown if analysis else {}
        if analysis and not score_breakdown:
            score_breakdown = analyze_resume_heuristic(resume.extracted_text).get('score_breakdown') or {}
        data.append({
            'id': resume.id,
            'file_name': resume.file_name,
            'uploaded_at': resume.uploaded_at,
            'bullets': extract_resume_bullets(resume.extracted_text),
            'analysis': {
                'ats_score': analysis.ats_score if analysis else None,
                'score_breakdown': score_breakdown,
                'skills': analysis.skills if analysis else [],
                'missing_keywords': analysis.missing_keywords if analysis else [],
                'suggestions': analysis.suggestions if analysis else [],
                'strengths': analysis.strengths if analysis else [],
            },
        })
    return Response({'resumes': data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enhance_bullet_point_view(request):
    bullet_text = request.data.get('bullet', '').strip()
    target_role = request.data.get('target_role', '').strip()
    resume_id = request.data.get('resume_id')
    if not bullet_text:
        return Response({'error': 'Bullet point text is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not resume_id:
        return Response({'error': 'resume_id is required. Select an analyzed resume first.'}, status=status.HTTP_400_BAD_REQUEST)
    resume = Resume.objects.filter(id=resume_id, user=request.user).first()
    if not resume:
        return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
    analysis = ResumeAnalysis.objects.filter(resume=resume).first()
    if not analysis:
        return Response({'error': 'Please analyze this resume before enhancing a bullet.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        score_breakdown = analysis.score_breakdown or analyze_resume_heuristic(resume.extracted_text).get('score_breakdown') or {}
        result = enhance_bullet_point(
            bullet_text,
            target_role,
            ats_context={
                'ats_score': analysis.ats_score,
                'score_breakdown': score_breakdown,
                'skills': analysis.skills or [],
                'missing_keywords': analysis.missing_keywords or [],
                'suggestions': analysis.suggestions or [],
            }
        )
        result['resume_id'] = resume.id
        result['resume_file_name'] = resume.file_name
        result['analysis_context'] = {
            'ats_score': analysis.ats_score,
            'score_breakdown': score_breakdown,
            'suggestions': analysis.suggestions or [],
        }
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Failed to enhance bullet point.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_bullet_enhancement(request):
    resume_id = request.data.get('resume_id')
    original_bullet = request.data.get('original_bullet', '').strip()
    enhanced_bullet = request.data.get('enhanced_bullet', '').strip()
    style = request.data.get('style', 'Professional & Clear').strip()
    target_role = request.data.get('target_role', '').strip()
    if not resume_id or not original_bullet or not enhanced_bullet:
        return Response({'error': 'resume_id, original_bullet and enhanced_bullet are required.'}, status=status.HTTP_400_BAD_REQUEST)
    resume = Resume.objects.filter(id=resume_id, user=request.user).first()
    if not resume:
        return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
    saved = BulletEnhancement.objects.create(
        user=request.user,
        resume=resume,
        original_bullet=original_bullet,
        enhanced_bullet=enhanced_bullet,
        style=style or 'Professional & Clear',
        target_role=target_role,
    )
    return Response({
        'message': 'Bullet enhancement saved.',
        'enhancement': {
            'id': saved.id,
            'resume_id': resume.id,
            'original_bullet': saved.original_bullet,
            'enhanced_bullet': saved.enhanced_bullet,
            'style': saved.style,
            'target_role': saved.target_role,
            'created_at': saved.created_at,
        }
    }, status=status.HTTP_201_CREATED)

def replace_resume_bullet_text(source_text: str, original_bullet: str, enhanced_bullet: str) -> str | None:
    source_text = source_text or ""
    original_bullet = re.sub(r"\s+", " ", (original_bullet or "").strip())
    enhanced_bullet = (enhanced_bullet or "").strip()
    if not original_bullet or not enhanced_bullet:
        return None
    if original_bullet in source_text:
        return source_text.replace(original_bullet, enhanced_bullet, 1)
    parts = [part for part in re.split(r"\s+", original_bullet) if part]
    if not parts:
        return None
    flexible_pattern = r"\s+".join(re.escape(part) for part in parts)
    match = re.search(flexible_pattern, source_text)
    if match:
        return source_text[:match.start()] + enhanced_bullet + source_text[match.end():]
    bullet_line_pattern = re.compile(
        r"^(?P<prefix>\s*(?:[•●▪◦‣*\-]\s*|\d+[.)]\s*))(?P<body>.*)$"
    )
    rebuilt = []
    for line in source_text.splitlines():
        marker = bullet_line_pattern.match(line)
        if marker and re.sub(r"\s+", " ", marker.group("body").strip()) == original_bullet:
            rebuilt.append(marker.group("prefix") + enhanced_bullet)
        else:
            rebuilt.append(line)
    candidate = "\n".join(rebuilt)
    return candidate if candidate != source_text else None

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def preview_bullet_reanalysis(request):
    resume_id = request.data.get('resume_id')
    original_bullet = request.data.get('original_bullet', '').strip()
    enhanced_bullet = request.data.get('enhanced_bullet', '').strip()
    if not resume_id or not original_bullet or not enhanced_bullet:
        return Response({'error': 'resume_id, original_bullet and enhanced_bullet are required.'}, status=status.HTTP_400_BAD_REQUEST)
    resume = Resume.objects.filter(id=resume_id, user=request.user).first()
    if not resume:
        return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
    source_text = resume.extracted_text or ""
    draft_text = replace_resume_bullet_text(source_text, original_bullet, enhanced_bullet)
    if draft_text is None:
        return Response(
            {'error': 'The selected original bullet could not be found in the stored resume text.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        preview = analyze_standalone_resume(draft_text)
        current = ResumeAnalysis.objects.filter(resume=resume).first()
        current_breakdown = current.score_breakdown if current else {}
        preview_breakdown = preview.get('score_breakdown') or {}
        return Response({
            'before': {
                'ats_score': current.ats_score if current else None,
                'score_breakdown': current_breakdown,
            },
            'after': {
                'ats_score': int(preview.get('ats_score', 0)),
                'score_breakdown': preview_breakdown,
            },
            'message': 'Preview calculated from the enhanced bullet. Your original resume has not been changed.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Could not calculate ATS preview.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bullet_enhancement_history(request):
    rows = BulletEnhancement.objects.filter(user=request.user).select_related('resume').order_by('-created_at')[:50]
    return Response({
        'history': [
            {
                'id': row.id,
                'resume_id': row.resume_id,
                'resume_file_name': row.resume.file_name,
                'original_bullet': row.original_bullet,
                'enhanced_bullet': row.enhanced_bullet,
                'style': row.style,
                'target_role': row.target_role,
                'created_at': row.created_at,
            }
            for row in rows
        ]
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    if not name or not email or not password or not confirm_password:
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if password != confirm_password:
        return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email is already registered.'}, status=status.HTTP_400_BAD_REQUEST)
    first_name = name.split(' ')[0]
    last_name = ' '.join(name.split(' ')[1:]) if ' ' in name else ''
    User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    return Response({'message': 'User registered successfully.'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.check_password(password):
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    return Response({
        'message': 'Login successful.',
        'user': {
            'id': user.id,
            'email': user.email,
            'name': f"{user.first_name} {user.last_name}".strip()
        },
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    resume_file = request.FILES.get('resume')
    if not resume_file:
        return Response({'error': 'Resume file is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not resume_file.name.lower().endswith('.pdf'):
        return Response({'error': 'Only PDF files are allowed.'}, status=status.HTTP_400_BAD_REQUEST)
    max_size = 5 * 1024 * 1024
    if resume_file.size > max_size:
        return Response({'error': 'File size must be less than 5MB.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        reader = pypdf.PdfReader(resume_file)
        extracted_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
        extracted_text = extracted_text.strip()
        if not extracted_text:
            return Response({'error': 'Could not extract text from this PDF.'}, status=status.HTTP_400_BAD_REQUEST)
        resume_file.seek(0)
        resume = Resume.objects.create(
            user=request.user,
            resume_file=resume_file,
            file_name=resume_file.name,
            extracted_text=extracted_text
        )
        return Response({
            'message': 'Resume uploaded and text extracted successfully.',
            'resume': {
                'id': resume.id,
                'file_name': resume.file_name,
                'file_url': resume.resume_file.url,
                'text_length': len(extracted_text),
                'uploaded_at': resume.uploaded_at
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': 'Failed to process PDF.', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ats_match(request):
    resume_id = request.data.get('resume_id')
    job_description_id = request.data.get('job_description_id')
    if not resume_id or not job_description_id:
        return Response({'error': 'resume_id and job_description_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
    resume = Resume.objects.filter(id=resume_id, user=request.user).first()
    if not resume:
        return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
    job_description = JobDescription.objects.filter(id=job_description_id, user=request.user).first()
    if not job_description:
        return Response({'error': 'Job description not found.'}, status=status.HTTP_404_NOT_FOUND)
    if not resume.extracted_text:
        return Response({'error': 'Resume text has not been extracted yet.'}, status=status.HTTP_400_BAD_REQUEST)
    resume_text = resume.extracted_text
    jd_text = job_description.description
    try:
        ai_result = analyze_resume_with_gemini(resume_text, jd_text)
    except Exception as e:
        return Response({'error': 'Gemini analysis failed.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    analysis = ATSMatchAnalysis.objects.create(
        user=request.user,
        resume=resume,
        job_description=job_description,
        ats_score=ai_result.get('ats_score', 0),
        matched_keywords=ai_result.get('matched_keywords', []),
        missing_keywords=ai_result.get('missing_keywords', []),
        matching_skills=ai_result.get('matching_skills', []),
        recommendations=ai_result.get('recommendations', [])
    )
    return Response({
        'message': 'ATS analysis completed successfully.',
        'analysis': ATSMatchAnalysisSerializer(analysis).data
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    skills_list = [s.strip() for s in profile.skills.split(',') if s.strip()] if profile.skills else []
    return Response({
        'name': f"{user.first_name} {user.last_name}".strip(),
        'email': user.email,
        'phone': profile.phone,
        'location': profile.location,
        'preferred_role': profile.preferred_role,
        'experience': profile.experience,
        'expected_salary': profile.expected_salary,
        'preferred_location': profile.preferred_location,
        'skills': skills_list,
        'github': profile.github,
        'linkedin': profile.linkedin,
        'portfolio': profile.portfolio,
        'leetcode': profile.leetcode
    }, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_resume(request, resume_id):
    resume = Resume.objects.filter(id=resume_id, user=request.user).first()
    if not resume:
        return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
    if resume.resume_file:
        resume.resume_file.delete(save=False)
    resume.delete()
    return Response({'message': 'Resume deleted successfully.'}, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    data = request.data
    user = request.user
    name = data.get('name', '')
    if name:
        parts = name.split(' ')
        user.first_name = parts[0]
        user.last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''
        user.save()
    skills_input = data.get('skills', '')
    if isinstance(skills_input, list):
        skills_str = ', '.join(skills_input)
    else:
        skills_str = str(skills_input)
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.phone = data.get('phone', profile.phone)
    profile.location = data.get('location', profile.location)
    profile.preferred_role = data.get('preferred_role', profile.preferred_role)
    profile.experience = data.get('experience', profile.experience)
    profile.expected_salary = data.get('expected_salary', profile.expected_salary)
    profile.preferred_location = data.get('preferred_location', profile.preferred_location)
    profile.skills = skills_str
    profile.github = data.get('github', profile.github)
    profile.linkedin = data.get('linkedin', profile.linkedin)
    profile.portfolio = data.get('portfolio', profile.portfolio)
    profile.leetcode = data.get('leetcode', profile.leetcode)
    profile.save()
    skills_list = [s.strip() for s in profile.skills.split(',') if s.strip()] if profile.skills else []
    return Response({
        'message': 'Profile updated successfully.',
        'profile': {
            'name': f"{user.first_name} {user.last_name}".strip(),
            'email': user.email,
            'phone': profile.phone,
            'location': profile.location,
            'preferred_role': profile.preferred_role,
            'experience': profile.experience,
            'expected_salary': profile.expected_salary,
            'preferred_location': profile.preferred_location,
            'skills': skills_list,
            'github': profile.github,
            'linkedin': profile.linkedin,
            'portfolio': profile.portfolio,
            'leetcode': profile.leetcode
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_resume(request, resume_id):
    resume = Resume.objects.filter(id=resume_id, user=request.user).first()
    if not resume:
        return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
    if not resume.extracted_text:
        return Response({'error': 'Resume text has not been extracted.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        result = analyze_standalone_resume(resume.extracted_text)
        ats_score = int(result.get('ats_score', 0))
        ats_score = max(0, min(100, ats_score))
        skills = result.get('skills', [])
        missing_keywords = result.get('missing_keywords', [])
        strengths = result.get('strengths', [])
        suggestions = result.get('suggestions', [])
        analysis, created = ResumeAnalysis.objects.update_or_create(
            resume=resume,
            defaults={
                'ats_score': ats_score,
                'skills': skills,
                'missing_keywords': missing_keywords,
                'strengths': strengths,
                'suggestions': suggestions,
                'score_breakdown': result.get('score_breakdown') or {},
                'categorized_skills': result.get('categorized_skills') or {}
            }
        )
        return Response({
            'message': 'Resume analyzed successfully.',
            'analysis': {
                'resume_id': resume.id,
                'ats_score': analysis.ats_score,
                'skills': analysis.skills,
                'missing_keywords': analysis.missing_keywords,
                'strengths': analysis.strengths,
                'suggestions': analysis.suggestions,
                'score_breakdown': result.get('score_breakdown'),
                'categorized_skills': result.get('categorized_skills')
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Resume analysis failed.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history(request):
    resumes = Resume.objects.filter(user=request.user).order_by('-uploaded_at')
    history_data = []
    for resume in resumes:
        analysis = ResumeAnalysis.objects.filter(resume=resume).first()
        history_data.append({
            'resume_id': resume.id,
            'file_name': resume.file_name,
            'uploaded_at': resume.uploaded_at,
            'ats_score': analysis.ats_score if analysis else 0,
            'skills': analysis.skills if analysis else [],
            'missing_keywords': analysis.missing_keywords if analysis else [],
            'strengths': analysis.strengths if analysis else [],
            'suggestions': analysis.suggestions if analysis else [],
            'score_breakdown': analysis.score_breakdown if analysis else {},
            'categorized_skills': analysis.categorized_skills if analysis else {},
        })
    return Response({'count': len(history_data), 'history': history_data}, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def job_descriptions(request):
    if request.method == 'GET':
        jobs = JobDescription.objects.filter(user=request.user).order_by('-created_at')
        serializer = JobDescriptionSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == 'POST':
        serializer = JobDescriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def job_description_detail(request, job_id):
    job = JobDescription.objects.filter(id=job_id, user=request.user).first()
    if not job:
        return Response({'error': 'Job description not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = JobDescriptionSerializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == 'PUT':
        serializer = JobDescriptionSerializer(job, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'DELETE':
        job.delete()
        return Response({'message': 'Job description deleted successfully.'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ats_history(request):
    analyses = ATSMatchAnalysis.objects.filter(user=request.user).select_related('resume', 'job_description').order_by('-created_at')
    data = []
    for analysis in analyses:
        data.append({
            'id': analysis.id,
            'resume_id': analysis.resume.id,
            'resume_name': analysis.resume.file_name,
            'job_description_id': analysis.job_description.id,
            'job_title': analysis.job_description.job_title,
            'company': analysis.job_description.company,
            'ats_score': analysis.ats_score,
            'matched_keywords': analysis.matched_keywords,
            'missing_keywords': analysis.missing_keywords,
            'matching_skills': analysis.matching_skills,
            'recommendations': analysis.recommendations,
            'created_at': analysis.created_at,
        })
    return Response(data, status=status.HTTP_200_OK)