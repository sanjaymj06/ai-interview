# API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Obtain tokens via the `/api/auth/login` or `/api/auth/register` endpoints.

---

## Authentication APIs

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "email": "...", "full_name": "...", "role": "user" },
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

### POST `/api/auth/login`
Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { "id": "...", "email": "...", "full_name": "..." },
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

### POST `/api/auth/forgot-password`
Request a password reset token.

**Request Body:** `{ "email": "user@example.com" }`

### POST `/api/auth/reset-password`
Reset password with token.

**Request Body:** `{ "token": "...", "new_password": "newPass123" }`

### GET `/api/auth/me` 🔒
Get current user profile.

### PUT `/api/auth/profile` 🔒
Update profile. Body: `{ "full_name": "...", "avatar_url": "..." }`

### POST `/api/auth/refresh`
Refresh access token. Body: `{ "refresh_token": "..." }`

---

## Resume APIs

### POST `/api/resume/upload` 🔒
Upload a resume (PDF or DOCX).

**Request:** `multipart/form-data` with `file` field.

### GET `/api/resume/list` 🔒
List user's resumes. Query params: `skip`, `limit`.

### GET `/api/resume/{resume_id}` 🔒
Get resume details.

### DELETE `/api/resume/{resume_id}` 🔒
Delete a resume.

### GET `/api/resume/{resume_id}/parsed` 🔒
Get parsed resume data.

---

## Job Description APIs

### POST `/api/job-description` 🔒
Create a job description.

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "raw_text": "Full job description text...",
  "location": "San Francisco, CA"
}
```

### GET `/api/job-description/list` 🔒
List user's job descriptions. Query params: `skip`, `limit`.

### GET `/api/job-description/{jd_id}` 🔒
Get job description details.

### DELETE `/api/job-description/{jd_id}` 🔒
Delete a job description.

---

## Analysis APIs

### POST `/api/analysis/run` 🔒
Run resume analysis against a job description.

**Request Body:**
```json
{
  "resume_id": "...",
  "job_description_id": "..."
}
```

**Response (201):**
```json
{
  "message": "Analysis completed successfully",
  "analysis": {
    "id": "...",
    "ats_score": 78.5,
    "score_breakdown": {
      "keyword_match": 82.0,
      "skill_match": 75.0,
      "experience_match": 80.0,
      "education_match": 90.0,
      "project_match": 70.0,
      "certification_match": 65.0
    },
    "missing_skills": ["kubernetes", "terraform"],
    "strengths": ["Strong keyword alignment"],
    "weaknesses": ["Missing key skills"],
    "suggestions": [...]
  }
}
```

### GET `/api/analysis/history` 🔒
Get analysis history. Query params: `skip`, `limit`.

### GET `/api/analysis/{analysis_id}` 🔒
Get analysis details.

### GET `/api/analysis/{analysis_id}/report` 🔒
Get detailed report with chart data.

### GET `/api/analysis/{analysis_id}/export` 🔒
Export analysis as PDF file.

---

## Dashboard APIs

### GET `/api/dashboard/stats` 🔒
Get dashboard statistics.

### GET `/api/dashboard/charts` 🔒
Get chart data (skill distribution, score breakdown, trends).

### GET `/api/dashboard/recent` 🔒
Get 10 most recent analyses.

---

## Admin APIs 🔒🔒

All admin endpoints require `admin` role.

### GET `/api/admin/users`
List all users. Query: `skip`, `limit`, `search`.

### PUT `/api/admin/users/{user_id}`
Update user. Query: `role`, `is_active`.

### DELETE `/api/admin/users/{user_id}`
Delete (soft) a user.

### GET `/api/admin/analytics`
System analytics dashboard data.

### GET `/api/admin/logs`
System activity logs. Query: `skip`, `limit`.

### GET `/api/admin/export-reports`
Export all reports.

---

## Health Check

### GET `/api/health`
No authentication required.

**Response:**
```json
{
  "status": "healthy",
  "app": "AI Resume Analyzer",
  "version": "1.0.0"
}
```

---

## Rate Limiting

- **Limit:** 60 requests per minute per IP
- **Headers:**
  - `X-RateLimit-Limit`: Max requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp
  - `Retry-After`: Seconds to wait (on 429)

## Error Responses

```json
{
  "detail": "Error message here"
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Invalid Token |
| 403 | Forbidden / Insufficient Permissions |
| 404 | Resource Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
