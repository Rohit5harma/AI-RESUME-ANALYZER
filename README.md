🤖 AI Resume Analyzer

An AI-powered full-stack Resume Analyzer that helps users analyze and improve their resumes using ATS scoring, skill detection, keyword analysis, Job Description matching, and AI-powered suggestions.

Built with React, Django REST Framework, PostgreSQL, and Google Gemini AI.

🚀 Features
📄 Resume Analysis — PDF upload, text extraction, ATS score, strengths and improvements
🛠️ Skill Detection — Automatically detects technical and professional skills
🔑 Missing Keywords — Identifies important missing keywords and skills
🎯 Job Description Matching — Compares resume with a target Job Description
✨ AI Suggestions — Provides resume improvement recommendations
✍️ Bullet Enhancer — Generates improved and impactful resume bullet points
🔐 JWT Authentication — Secure registration and login
📊 Dashboard — View resume analysis and history
👤 Profile — Manage professional information
🧠 How It Works
text
Upload Resume
      │
      ▼
PDF Text Extraction
      │
      ▼
Resume Analysis
      │
 ┌────┼────┐
 ▼    ▼    ▼
ATS  Skills Keywords
 │    │      │
 └────┼──────┘
      ▼
AI Suggestions
      │
      ▼
Resume Improvement

Resume + Job Description
          │
          ▼
    Skill Comparison
       ┌──┴──┐
       ▼     ▼
    Matched Missing
     Skills Keywords
       └──┬──┘
          ▼
   Recommendations
🤖 AI Integration

Google Gemini AI is used for:

Resume analysis
Resume improvement suggestions
Bullet point enhancement
Multiple bullet variations
Job Description recommendations
🛠️ Tech Stack
Category	Technologies
Frontend	React, JavaScript, Vite, HTML, CSS, Tailwind CSS
Backend	Python, Django, Django REST Framework
AI	Google Gemini API
Database	PostgreSQL, SQLite
Authentication	JWT
Tools	Git, GitHub, VS Code
⚙️ Installation
Backend
bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
Frontend
bash
cd frontend
npm install
npm run dev
🔐 Environment Variables

Create a .env file in the backend:

SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_url
🧪 Testing

Run backend tests:

bash
python manage.py test
👨‍💻 Author

Rohit Sharma

GitHub: Rohit5harma
Email: kaushikrohit@gmail.com
LinkedIn: rohit-sharma-7ab028312
📸 Screenshots
Dashboard
Resume Analysis
ATS Score
Job Description Matcher
Bullet Enhancer
Profile
🚀 Future Improvements
Resume Builder
Cover Letter Generator
Job Recommendations
Advanced ATS optimization
Detailed resume analytics