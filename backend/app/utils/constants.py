from typing import Dict, List

# Skill Categories
SKILL_CATEGORIES: Dict[str, List[str]] = {
    "programming": [
        "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
        "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "sql", "perl",
    ],
    "web_frameworks": [
        "fastapi", "django", "flask", "express", "spring", "rails", "laravel",
        "react", "vue", "angular", "svelte", "nextjs", "nuxt", "nodejs",
    ],
    "data_science": [
        "machine learning", "deep learning", "nlp", "computer vision",
        "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
        "data analysis", "data visualization", "statistics", "spark",
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
        "ci/cd", "ansible", "prometheus", "grafana", "linux", "nginx",
    ],
    "databases": [
        "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "cassandra",
        "dynamodb", "firebase", "supabase", "neo4j",
    ],
    "soft_skills": [
        "leadership", "communication", "teamwork", "problem-solving",
        "critical thinking", "time management", "adaptability", "creativity",
    ],
    "design": [
        "figma", "sketch", "adobe xd", "photoshop", "illustrator", "ui/ux",
        "css", "sass", "tailwind", "bootstrap",
    ],
    "tools": [
        "git", "jira", "confluence", "slack", "notion", "vscode",
        "postman", "swagger", "graphql", "rest", "grpc",
    ],
}

# Education Levels
EDUCATION_LEVELS: List[str] = [
    "high school",
    "associate",
    "bachelor",
    "master",
    "phd",
    "doctorate",
    "diploma",
    "certificate",
]

# Experience Levels
EXPERIENCE_LEVELS: List[str] = [
    "entry level",
    "junior",
    "mid level",
    "senior",
    "lead",
    "principal",
    "staff",
    "director",
    "vp",
    "c-level",
]

# File Types
ALLOWED_FILE_EXTENSIONS: Dict[str, str] = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

# Error Messages
ERROR_MESSAGES: Dict[str, str] = {
    "USER_NOT_FOUND": "User not found",
    "EMAIL_EXISTS": "Email already registered",
    "INVALID_CREDENTIALS": "Invalid email or password",
    "UNAUTHORIZED": "Unauthorized access",
    "FORBIDDEN": "Access forbidden",
    "TOKEN_EXPIRED": "Token has expired",
    "TOKEN_INVALID": "Invalid token",
    "FILE_TOO_LARGE": "File size exceeds maximum limit",
    "INVALID_FILE_TYPE": "File type not allowed",
    "RESUME_NOT_FOUND": "Resume not found",
    "JD_NOT_FOUND": "Job description not found",
    "ANALYSIS_NOT_FOUND": "Analysis not found",
    "REPORT_NOT_FOUND": "Report not found",
    "DATABASE_ERROR": "Database operation failed",
    "PARSING_ERROR": "Failed to parse document",
    "PROCESSING_ERROR": "Processing failed",
    "VALIDATION_ERROR": "Validation error",
}

# Success Messages
SUCCESS_MESSAGES: Dict[str, str] = {
    "USER_CREATED": "User registered successfully",
    "LOGIN_SUCCESS": "Login successful",
    "PASSWORD_RESET": "Password reset successful",
    "PASSWORD_RESET_EMAIL": "Password reset email sent",
    "PROFILE_UPDATED": "Profile updated successfully",
    "RESUME_UPLOADED": "Resume uploaded successfully",
    "RESUME_DELETED": "Resume deleted successfully",
    "JD_CREATED": "Job description created successfully",
    "JD_DELETED": "Job description deleted successfully",
    "ANALYSIS_COMPLETE": "Analysis completed successfully",
    "REPORT_GENERATED": "Report generated successfully",
}

# Scoring Weights
SCORING_WEIGHTS: Dict[str, float] = {
    "keyword_match": 0.25,
    "skill_match": 0.30,
    "experience_match": 0.15,
    "education_match": 0.10,
    "project_match": 0.10,
    "certification_match": 0.10,
}

# Regex Patterns
REGEX_PATTERNS: Dict[str, str] = {
    "email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    "phone": r"(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}",
    "linkedin": r"(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+/?",
    "github": r"(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+/?",
    "url": r"https?://(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)",
}

# Section Headers for Resume Parsing
RESUME_SECTIONS: Dict[str, List[str]] = {
    "summary": ["summary", "objective", "profile", "about me", "professional summary", "career objective"],
    "experience": ["experience", "work experience", "employment history", "professional experience", "work history"],
    "education": ["education", "academic background", "qualifications", "educational background"],
    "skills": ["skills", "technical skills", "competencies", "technologies", "proficiencies"],
    "projects": ["projects", "personal projects", "portfolio", "key projects"],
    "certifications": ["certifications", "licenses", "credentials", "certificates"],
    "languages": ["languages", "language skills", "foreign languages"],
}
