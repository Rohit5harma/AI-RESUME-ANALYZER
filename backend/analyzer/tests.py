import json
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import Resume, JobDescription, ResumeAnalysis, BulletEnhancement
from .views import extract_resume_bullets, replace_resume_bullet_text
from .gemini_service import (
    analyze_resume_heuristic,
    analyze_ats_match_heuristic,
    enhance_bullet_point,
)




class BulletExtractionTests(TestCase):
    def test_extracts_project_bullets_without_space_after_marker_and_ignores_certifications(self):
        resume_text = """
        TECHNICAL SKILLS
        Python, Django, React

        PROJECTS
        AI Resume Analyzer ReactJS, Python, Django
        •Developed an AI-powered Resume Analyzer with a Django backend and React frontend,
        implementing resume upload and ATS scoring.
        •Implemented AI-driven resume evaluation and skill-gap analysis.

        Rosterly Python, Django, MySQL, Source Code
        • A RESTful API for managing student records, built with Django and MySQL.
        • Organized routers, services, and schemas.

        EDUCATION
        Bachelor of Engineering

        ACHIEVEMENTS AND CERTIFICATIONS
        • The Python Language - Coursera
        • ReactJS for beginners - Udemy
        """
        bullets = extract_resume_bullets(resume_text)

        self.assertEqual(len(bullets), 4)
        self.assertTrue(any("Developed an AI-powered Resume Analyzer" in b for b in bullets))
        self.assertTrue(any("A RESTful API for managing student records" in b for b in bullets))
        self.assertFalse(any("Coursera" in b or "Udemy" in b for b in bullets))

    def test_extracts_unmarked_action_bullets_from_internship(self):
        resume_text = """
        INTERNSHIP
        AI/ML Virtual Intern, IBM
        Completed IBM watsonx Generative AI training, developing hands-on expertise in prompt engineering.
        04/2025 - 06/2025

        PROJECTS
        CloudMind | Python, FastAPI, Docker
        •Engineered a FastAPI core API with JWT authentication and role-based access control.
        2026
        """
        bullets = extract_resume_bullets(resume_text)

        self.assertEqual(len(bullets), 2)
        self.assertTrue(bullets[0].startswith("Completed IBM watsonx"))
        self.assertTrue(bullets[1].startswith("Engineered a FastAPI"))

    def test_preview_replacement_handles_wrapped_bullet(self):
        source = "PROJECTS\n• Developed a Django API with\n  CRUD operations for students.\n"
        original = "Developed a Django API with CRUD operations for students."
        replacement = "Developed a Django REST API for student management."
        draft = replace_resume_bullet_text(source, original, replacement)

        self.assertIsNotNone(draft)
        self.assertIn("Developed a Django REST API for student management.", draft)
        self.assertNotIn("CRUD operations for students.", draft)


class HeuristicAnalyzerUnitTests(TestCase):
    def test_resume_heuristic_analysis(self):
        sample_resume = """
        John Doe
        Software Engineer
        Experience:
        - Developed backend services using Python, Django, and PostgreSQL.
        - Built interactive frontend dashboards with React and JavaScript.
        - Implemented CI/CD pipelines using Docker and GitHub Actions, improving build speed by 40%.
        Skills:
        Python, Django, React, JavaScript, PostgreSQL, Docker, Git, REST API
        Education:
        B.S. in Computer Science
        """
        result = analyze_resume_heuristic(sample_resume)
        self.assertIn('ats_score', result)
        self.assertGreaterEqual(result['ats_score'], 50)
        self.assertTrue(len(result['skills']) > 0)
        self.assertIn('Python', result['skills'])
        self.assertIn('Django', result['skills'])
        self.assertIn('React', result['skills'])
        self.assertTrue(len(result['strengths']) > 0)

    def test_ats_match_heuristic(self):
        sample_resume = "Python, Django, PostgreSQL, Docker, AWS"
        sample_jd = "Looking for a Senior Python Developer with Django, Docker, and Kubernetes experience."
        result = analyze_ats_match_heuristic(sample_resume, sample_jd)
        self.assertIn('ats_score', result)
        self.assertIn('Python', result['matched_keywords'])
        self.assertIn('Django', result['matched_keywords'])
        self.assertIn('Kubernetes', result['missing_keywords'])

    def test_bullet_point_enhancer(self):
        weak_bullet = "worked on backend apis with django"
        result = enhance_bullet_point(weak_bullet, "Backend Engineer")
        self.assertEqual(result['original'], weak_bullet)
        self.assertEqual(len(result['suggestions']), 3)
        self.assertTrue(any("Django" in s['text'] or "django" in s['text'] for s in result['suggestions']))
        self.assertFalse(any("35%" in s['text'] or "25,000" in s['text'] or "90%" in s['text'] for s in result['suggestions']))


class APIIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_login_flow(self):
        # 1. Register
        reg_response = self.client.post(
            '/api/register/',
            {
                'name': 'Test User',
                'email': 'tester@example.com',
                'password': 'password123',
                'confirm_password': 'password123'
            },
            format='json'
        )
        self.assertEqual(reg_response.status_code, status.HTTP_201_CREATED)

        # 2. Login
        login_response = self.client.post(
            '/api/login/',
            {
                'email': 'tester@example.com',
                'password': 'password123'
            },
            format='json'
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', login_response.data)
        token = login_response.data['tokens']['access']

        # 3. Authenticated resume analysis + integrated bullet enhancer
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        user = User.objects.get(email='tester@example.com')
        resume = Resume.objects.create(
            user=user,
            file_name='resume.pdf',
            extracted_text='Experienced Python and React developer with 3 years building web apps.'
        )

        analyze_response = self.client.post(f'/api/analyze/{resume.id}/')
        self.assertEqual(analyze_response.status_code, status.HTTP_200_OK)
        self.assertIn('analysis', analyze_response.data)
        self.assertGreater(analyze_response.data['analysis']['ats_score'], 0)

        # Bullet enhancer should require authentication and resume context
        bullet_response = self.client.post(
            '/api/enhance-bullet/',
            {
                'resume_id': resume.id,
                'bullet': 'Experienced Python and React developer with 3 years building web apps.',
                'target_role': 'Backend Engineer'
            },
            format='json'
        )
        self.assertEqual(bullet_response.status_code, status.HTTP_200_OK)
        self.assertIn('suggestions', bullet_response.data)
        self.assertEqual(len(bullet_response.data['suggestions']), 3)

        save_response = self.client.post(
            '/api/bullet-enhancer/save/',
            {
                'resume_id': resume.id,
                'original_bullet': 'Experienced Python and React developer with 3 years building web apps.',
                'enhanced_bullet': bullet_response.data['suggestions'][0]['text'],
                'style': bullet_response.data['suggestions'][0]['style'],
                'target_role': 'Backend Engineer'
            },
            format='json'
        )
        self.assertEqual(save_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BulletEnhancement.objects.filter(resume=resume).count(), 1)
