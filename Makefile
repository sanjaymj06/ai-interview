.PHONY: install install-backend install-frontend dev dev-backend dev-frontend \
       build build-frontend docker-up docker-down docker-dev test test-backend \
       test-frontend lint lint-backend lint-frontend seed clean

install-backend:
	cd backend && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

install: install-backend install-frontend

dev-backend:
	cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

build-frontend:
	cd frontend && npm run build

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down

docker-dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

test-backend:
	cd backend && python -m pytest -v

test-frontend:
	cd frontend && npm test -- --run

test: test-backend test-frontend

lint-backend:
	cd backend && python -m flake8 app/ --max-line-length=100 --ignore=E501,W503

lint-frontend:
	cd frontend && npm run lint

lint: lint-backend lint-frontend

seed:
	cd database && node seed.js

clean:
	cd backend && find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
	cd backend && find . -type f -name "*.pyc" -delete 2>/dev/null; true
	cd frontend && rm -rf dist node_modules/.cache 2>/dev/null; true
