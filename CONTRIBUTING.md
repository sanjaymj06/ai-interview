# Contributing to AI Resume Analyzer

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Docker)
- Git

### Setup Steps

1. Fork and clone the repository:
```bash
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

3. Set up the frontend:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints for all functions
- Maximum line length: 100 characters
- Use `snake_case` for functions and variables
- Use `PascalCase` for classes
- Add docstrings to public functions

### JavaScript/React (Frontend)
- Use ESLint and Prettier (config included)
- Use `camelCase` for variables and functions
- Use `PascalCase` for components
- Prefer functional components with hooks
- Use Tailwind CSS for styling

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/resume-optimizer` |
| Bug Fix | `fix/description` | `fix/login-validation` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Docs | `docs/description` | `docs/api-update` |
| Refactor | `refactor/description` | `refactor/auth-middleware` |

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Write or update tests
4. Run linters and tests:
```bash
# Backend
cd backend && flake8 app/ && pytest

# Frontend
cd frontend && npm run lint && npm test
```
5. Commit with a descriptive message
6. Push and create a PR
7. Request review from maintainers

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Examples:**
```
feat(analysis): add certification matching algorithm
fix(auth): resolve token refresh race condition
docs(api): update analysis endpoint documentation
```

## Testing

- Write unit tests for new services and utilities
- Write integration tests for new API endpoints
- Aim for >80% code coverage on new code
- Run the full test suite before submitting PRs

## Code Review

- All PRs require at least one review
- Address review comments promptly
- Keep PRs focused and small (<500 lines preferred)

## Questions?

Open a GitHub issue for questions or discussions.
