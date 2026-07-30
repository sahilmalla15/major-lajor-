# 🎨 AtelierAI — AI-Powered Art Learning Platform

An intelligent web application that helps aspiring artists learn drawing fundamentals through personalized learning paths, AI-powered mentorship, interactive demonstrations, and sketch evaluation.

Built for the Major Project at **Tribhuvan University, Institute of Engineering — National College of Engineering**.

## ✨ Features

### 🧠 AI Art Mentor (RAG-Powered)
- Ask drawing-related questions and get context-aware answers
- Retrieval-Augmented Generation (RAG) pipeline retrieves relevant educational content
- Powered by **Gemini API** (with built-in fallback responses when API is unavailable)

### 📚 Personalized Learning Roadmaps
- Skill assessment-based roadmap generation
- Structured progression through drawing fundamentals
- Track completed lessons and modules

### ✏️ Interactive Drawing Lab
- **Watch & Learn**: Step-by-step animated drawing demonstrations on canvas
- **Try It Yourself**: Free-draw canvas with pen, eraser, color, and brush tools
- **Submit & Evaluate**: Upload or camera-capture your drawing for AI evaluation

### 🖼️ AI Sketch Evaluation
- Upload photos of your drawings or capture via camera
- Gemini Vision API analyzes proportions, perspective, shading, and line quality
- Get scores (0-100), strengths, and improvement suggestions

### 📊 Progress Tracking & Analytics
- Visual progress charts (Chart.js)
- Activity timeline and achievement badges
- Learning streak tracking

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python Django 6.0, Django REST Framework |
| **Auth** | JWT (djangorestframework-simplejwt) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Charts** | Chart.js |
| **Icons** | Font Awesome 6 |
| **AI** | Google Gemini API (generativeai SDK) |
| **Database** | SQLite (development) / PostgreSQL-ready |
| **Canvas** | HTML5 Canvas API (animation + drawing) |

## 🗂️ Project Structure

```
E:\major\
├── backend/                    # Django REST Framework backend
│   ├── atelierai/              # Project settings & URLs
│   ├── accounts/               # User auth (register/login/profile)
│   ├── knowledge_base/         # Art resource management
│   ├── learning/               # Modules, lessons, exercises, animations
│   │   └── management/commands/# seed_data.py
│   ├── mentor/                 # AI Mentor chat + sketch evaluation
│   │   └── services.py         # RAG pipeline + Gemini integration
│   ├── progress/               # Stats, activity logs, achievements
│   ├── media/                  # User-uploaded files
│   └── requirements.txt
├── frontend/                   # Static frontend
│   ├── index.html              # Landing page
│   ├── pages/                  # 10 HTML pages
│   ├── css/style.css           # Complete theme (700+ lines)
│   ├── js/                     # JavaScript modules
│   │   ├── api.js              # API client
│   │   ├── auth.js             # Auth helpers
│   │   ├── main.js             # UI utilities
│   │   ├── canvas-draw.js      # Drawing animation engine
│   │   ├── camera.js           # Camera capture module
│   │   └── pages/              # 10 page-specific JS files
│   └── assets/
├── .env                        # Environment variables
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js (optional, for serving frontend)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Environment Variables
Create `.env` in the project root (already created for you):
```
SECRET_KEY=your-django-secret-key
GEMINI_API_KEY=your-gemini-api-key   # Optional - fallback responses work without it
DEBUG=True
```

### Database Setup
```bash
cd backend
python manage.py migrate
python manage.py seed_data    # Creates sample data (6 modules, 18 lessons, 36 exercises)
```

### Running the Backend
```bash
cd backend
python manage.py runserver 8000
```

### Running the Frontend
Open the HTML files directly in a browser, or serve them:
```bash
cd frontend
python -m http.server 5500
```
Then visit `http://localhost:5500/pages/login.html`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Register new user |
| `/api/auth/login/` | POST | Login, returns JWT tokens |
| `/api/auth/profile/` | GET/PUT | Get/update user profile |
| `/api/auth/token/refresh/` | POST | Refresh JWT token |
| `/api/learning/modules/` | GET | List all learning modules |
| `/api/learning/exercises/` | GET | List exercises (filterable) |
| `/api/learning/roadmap/` | GET | Get user's roadmap |
| `/api/mentor/sessions/` | GET/POST | List/create chat sessions |
| `/api/mentor/sessions/:id/chat/` | POST | Send message to AI Mentor |
| `/api/mentor/evaluate-sketch/` | POST | Upload drawing for AI evaluation |
| `/api/progress/dashboard/` | GET | Get aggregated dashboard data |

## 🧪 Sample Drawing Animations
1. **Box in 2-Point Perspective** — 8 steps (horizon → vanishing points → edges → shading)
2. **Shading a Sphere** — 6 steps (circle → light source → core shadow → blend)
3. **Drawing a Table with Shading** — 10 steps (tabletop → legs → perspective → hatch)
4. **Cylinder Construction** — 7 steps (axis → top/bottom ellipses → contours)
5. **Figure Gesture Drawing** — 5 steps (action line → head → torso → limbs)

## 📋 Build Phases
- **Phase 1**: Django project setup, models, migrations
- **Phase 2**: Frontend HTML/CSS/JS framework
- **Phase 3**: Core learning features (dashboard, roadmap, exercises)
- **Phase 4**: AI Mentor with RAG pipeline
- **Phase 5**: Interactive Drawing Lab with canvas animation
- **Phase 6**: AI Sketch Evaluation with Gemini Vision
- **Phase 7**: Progress charts, achievements, polish

## 👥 Team
- Abaddha Bhandari (NCE079BCT003)
- Sahil Bam Malla (NCE079BCT030)
- Subigya Ghimire (NCE079BCT038)
- Sujalpa Chapagain (NCE079BCT041)

---

**Tribhuvan University | Institute of Engineering | National College of Engineering**
**June 2026**