from contextlib import asynccontextmanager

import nltk
import spacy
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import close_mongo_connection, connect_to_mongo
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.routes import admin, analysis, auth, dashboard, job_description, resume


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}...")
    await connect_to_mongo()
    try:
        spacy.load("en_core_web_sm")
    except OSError:
        spacy.cli.download("en_core_web_sm")
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        nltk.download("punkt", quiet=True)
    try:
        nltk.data.find("stopwords")
    except LookupError:
        nltk.download("stopwords", quiet=True)
    print("NLP models loaded successfully")
    yield
    await close_mongo_connection()
    print("Application shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered resume analysis and optimization platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimiterMiddleware)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(job_description.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)
app.include_router(admin.router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
