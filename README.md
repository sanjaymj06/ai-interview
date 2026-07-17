# AI Resume Analyzer

[![CI](https://github.com/your-username/ai-resume-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/ai-resume-analyzer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An enterprise-grade AI-powered resume analysis platform that helps job seekers optimize their resumes against job descriptions using NLP, machine learning, and semantic analysis.

## Features

### Authentication & User Management
- Secure registration with strong password validation (uppercase, lowercase, digit, special character)
- JWT-based authentication with access and refresh token rotation
- Forgot password and reset password flows
- Profile management with avatar upload
- Role-based access control (User / Admin)
- Account status management (active, inactive, suspended)

### Resume Management
- Upload resumes in PDF and DOCX formats (up to 10 MB)
- Drag-and-drop file upload with progress feedback
- Automatic text extraction using PyMuPDF and pdfplumber
- NLP-powered parsing of structured resume sections: name, email, phone, summary, skills, experience, education, projects, certifications, and languages
- Resume versioning and history
- View detailed parsed resume data

### Job Descriptions
- Create and manage job descriptions with structured metadata
- Automatic extraction of required skills, preferred skills, experience requirements, and education level
- Track salary range, employment type, and location
- Full-text search across all job description fields

### AI-Powered Analysis
- Semantic matching between resumes and job descriptions using sentence-transformers
- Multi-dimensional scoring: ATS compatibility, keyword match, skill match, experience match, education match, project match, certification match
- Identification of matched skills, missing skills, and extra skills
- Strength and weakness analysis
- Prioritized improvement suggestions with category tags (skills, experience, education, formatting, keywords)

### Resume Optimizer
- AI-generated recommendations to improve resume content
- Actionable suggestions tailored to specific job descriptions
- Keyword optimization for ATS systems

### Job Matching
- Compare resumes against multiple job descriptions
- Skill gap analysis across job postings
- Match score ranking

### Analytics Dashboard
- Overview statistics: total resumes, analyses, average scores
- Visual charts for score trends and distributions (Chart.js)
- Recent activity feed

### Admin Panel
- User management (list, update roles/status, delete)
- Platform analytics and usage metrics
- Activity and audit logs
- Export reports in CSV format

### UI/UX
- Responsive design with Tailwind CSS
- Dark and light theme support (system preference detection)
- Animated page transitions with Framer Motion
- Toast notifications for user feedback
- Skeleton loading states
- Modal dialogs
- Drag-and-drop upload component
- Protected routes with admin-only guards

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, React Router 6, Tailwind CSS 3, Framer Motion, Chart.js, Axios, React Hook Form |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2, Motor (async MongoDB driver) |
| **AI / ML** | spaCy, sentence-transformers, scikit-learn, NLTK, HuggingFace Transformers, PyTorch |
| **PDF Processing** | PyMuPDF, pdfplumber, python-docx, WeasyPrint, ReportLab |
| **Database** | MongoDB 7 (via Motor async driver) |
| **Authentication** | python-jose (JWT), passlib + bcrypt |
| **Deployment** | Docker, Nginx (reverse proxy + static serving), Docker Compose |
| **CI/CD** | GitHub Actions |

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Docker & Docker Compose (optional, recommended)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer

# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env and set a strong SECRET_KEY and MONGODB_URI
# For Docker Compose, the default MONGODB_URL is already configured

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and a strong JWT_SECRET_KEY

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if needed (default VITE_API_URL=/api works with the Nginx proxy)

# Start the dev server
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | Database name | `resume_analyzer` |
| `JWT_SECRET_KEY` | Secret key for signing JWTs | (must be set) |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL in minutes | `30` |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL in days | `7` |
| `UPLOAD_FOLDER` | Directory for uploaded files | `./uploads` |
| `MAX_FILE_SIZE_MB` | Maximum upload file size in MB | `10` |
| `ALLOWED_FILE_TYPES` | Comma-separated allowed extensions | `pdf,docx` |
| `CORS_ORIGINS` | JSON array of allowed origins | `["http://localhost:3000","http://localhost:5173"]` |
| `RATE_LIMIT_PER_MINUTE` | Max requests per minute per IP | `60` |
| `HF_TOKEN` | HuggingFace API token (optional) | `None` |
| `APP_NAME` | Application display name | `AI Resume Analyzer` |
| `APP_VERSION` | Application version | `1.0.0` |
| `DEBUG` | Enable debug mode | `false` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `/api` |
| `VITE_APP_NAME` | Application display name | `AI Resume Analyzer` |
| `VITE_DEFAULT_THEME` | Default color theme | `system` |

## Project Structure

```
ai-resume-analyzer/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # Pydantic settings configuration
│   │   ├── database.py            # MongoDB connection and collection access
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py            # JWT authentication dependencies
│   │   │   └── rate_limiter.py    # Request rate limiting middleware
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py            # User, Token, and auth request models
│   │   │   ├── resume.py          # Resume and parsed section models
│   │   │   ├── job_description.py # Job description and extracted data models
│   │   │   ├── analysis.py        # Analysis request/response models
│   │   │   └── report.py          # PDF report models
│   │   ├── routes/                # API route handlers
│   │   ├── services/
│   │   │   ├── resume_parser.py   # Resume text extraction and parsing
│   │   │   ├── nlp_processor.py   # NLP pipeline (spaCy, tokenization)
│   │   │   ├── ats_scorer.py      # Applicant Tracking System scoring
│   │   │   ├── job_matcher.py     # Resume-to-job semantic matching
│   │   │   ├── resume_optimizer.py# AI-powered resume optimization
│   │   │   └── ai_suggester.py    # Improvement suggestion generation
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── constants.py       # Application constants
│   │       ├── helpers.py         # JWT encode/decode, utility functions
│   │       └── validators.py      # Input validation helpers
│   ├── docker/                    # Backend Dockerfile (if separate)
│   ├── uploads/                   # Uploaded resume storage (gitignored)
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js           # Axios instance with interceptors
│   │   │   ├── auth.js            # Authentication API calls
│   │   │   ├── resume.js          # Resume CRUD API calls
│   │   │   ├── analysis.js        # Analysis API calls
│   │   │   ├── jobDescription.js  # Job description API calls
│   │   │   ├── dashboard.js       # Dashboard stats API calls
│   │   │   └── admin.js           # Admin panel API calls
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   ├── Footer.jsx         # Page footer
│   │   │   ├── Sidebar.jsx        # Dashboard sidebar
│   │   │   ├── ProtectedRoute.jsx # Auth and admin route guards
│   │   │   ├── Toast.jsx          # Toast notification system
│   │   │   ├── Modal.jsx          # Modal dialog component
│   │   │   ├── LoadingSpinner.jsx # Loading indicator
│   │   │   ├── Skeleton.jsx       # Skeleton loading placeholders
│   │   │   └── DragDropUpload.jsx # Drag-and-drop file upload
│   │   ├── context/               # React context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration page
│   │   │   ├── ForgotPassword.jsx # Forgot password page
│   │   │   ├── ResetPassword.jsx  # Reset password page
│   │   │   ├── Dashboard.jsx      # User dashboard
│   │   │   ├── Profile.jsx        # User profile management
│   │   │   ├── ResumeUpload.jsx   # Resume upload page
│   │   │   ├── ResumeDetail.jsx   # Resume detail view
│   │   │   ├── Analysis.jsx       # Run new analysis
│   │   │   ├── AnalysisHistory.jsx# Analysis history list
│   │   │   ├── AnalysisDetail.jsx # Analysis result detail
│   │   │   ├── ResumeOptimizer.jsx# Resume optimization page
│   │   │   ├── JobMatch.jsx       # Job matching page
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx  # Admin overview
│   │   │       ├── AdminUsers.jsx      # User management
│   │   │       ├── AdminAnalytics.jsx  # Platform analytics
│   │   │       └── AdminLogs.jsx       # Activity logs
│   │   ├── utils/                 # Utility functions
│   │   ├── App.jsx                # Root component with routes
│   │   ├── main.jsx               # Application entry point
│   │   └── index.css              # Global styles
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── database/
│   ├── schema.js                  # MongoDB schema documentation
│   └── seed.js                    # Database seeding script
├── docker/
│   ├── Dockerfile.backend         # Multi-stage Python backend image
│   ├── Dockerfile.frontend        # Multi-stage Node + Nginx image
│   └── nginx.conf                 # Nginx reverse proxy config
├── docker-compose.yml             # Production Docker Compose
├── docker-compose.dev.yml         # Development Docker Compose
├── .dockerignore
├── .gitignore
├── Makefile                       # Development automation commands
├── README.md
├── DEPLOYMENT.md
├── API_DOCUMENTATION.md
├── CONTRIBUTING.md
└── LICENSE
```

## API Reference

All endpoints are prefixed with `/api`. Authentication requires a `Bearer` token in the `Authorization` header.

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Log in and receive tokens |
| `POST` | `/auth/logout` | Invalidate tokens |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/forgot-password` | Request password reset email |
| `POST` | `/auth/reset-password` | Reset password with token |
| `GET` | `/auth/profile` | Get current user profile |
| `PUT` | `/auth/profile` | Update profile |
| `PUT` | `/auth/change-password` | Change password |
| `POST` | `/auth/avatar` | Upload profile avatar |

### Resumes (`/api/resumes`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/resumes/upload` | Upload a new resume |
| `GET` | `/resumes` | List user's resumes |
| `GET` | `/resumes/:id` | Get resume details |
| `PUT` | `/resumes/:id` | Update resume metadata |
| `DELETE` | `/resumes/:id` | Delete a resume |
| `GET` | `/resumes/:id/parsed` | Get parsed resume data |

### Job Descriptions (`/api/job-descriptions`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/job-descriptions` | Create a job description |
| `GET` | `/job-descriptions` | List user's job descriptions |
| `GET` | `/job-descriptions/:id` | Get job description details |
| `PUT` | `/job-descriptions/:id` | Update a job description |
| `DELETE` | `/job-descriptions/:id` | Delete a job description |

### Analyses (`/api/analyses`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyses/run` | Run a resume-job analysis |
| `GET` | `/analyses` | List analysis history |
| `GET` | `/analyses/:id` | Get analysis details |
| `DELETE` | `/analyses/:id` | Delete an analysis |
| `GET` | `/analyses/:id/export` | Export analysis as PDF |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | Get user statistics |
| `GET` | `/dashboard/charts` | Get chart data |
| `GET` | `/dashboard/recent` | Get recent activity |

### Admin (`/api/admin`) — Admin role required
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/users` | List all users |
| `PUT` | `/admin/users/:id` | Update user role/status |
| `DELETE` | `/admin/users/:id` | Delete a user |
| `GET` | `/admin/analytics` | Platform analytics |
| `GET` | `/admin/logs` | Activity logs |
| `GET` | `/admin/export` | Export reports as CSV |

For detailed request/response schemas, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Database Schema

MongoDB collections with application-level validation via Pydantic models:

| Collection | Description |
|---|---|
| **users** | User accounts with email, hashed password, role (user/admin), status, and timestamps. Indexed on `email` (unique). |
| **resumes** | Uploaded resumes with file metadata, full extracted text, and structured parsed data (skills, experience, education, projects, certifications, languages). Indexed on `user_id`. |
| **job_descriptions** | Job postings with raw text and automatically extracted requirements (required/preferred skills, experience years, education level). Indexed on `user_id`. |
| **analyses** | Analysis results linking a resume to a job description. Contains multi-dimensional scores (ATS, keyword, skill, experience, education, project, certification), matched/missing/extra skills, strengths, weaknesses, and prioritized suggestions. Indexed on `user_id` and `resume_id`. |
| **reports** | Generated PDF reports from analyses with file path, size, and generation status. |

For the full schema documentation, see `database/schema.js`.

## Testing

```bash
# Run backend tests
cd backend
pytest

# Run frontend linting
cd frontend
npm run lint
```

## Deployment

This project supports deployment via Docker, Render, Railway, and any platform that supports Docker or static file hosting.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting a pull request.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
