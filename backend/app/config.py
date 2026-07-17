import os
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "resume_analyzer"

    # JWT
    JWT_SECRET_KEY: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Upload
    UPLOAD_FOLDER: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: str = "pdf,docx"

    # CORS
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:5173"]'

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # HuggingFace
    HF_TOKEN: Optional[str] = None

    # Application
    APP_NAME: str = "AI Resume Analyzer"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    @property
    def cors_origins_list(self) -> List[str]:
        import json
        try:
            return json.loads(self.CORS_ORIGINS)
        except (json.JSONDecodeError, TypeError):
            return ["http://localhost:3000", "http://localhost:5173"]

    @property
    def allowed_file_types_list(self) -> List[str]:
        return [ext.strip().lower() for ext in self.ALLOWED_FILE_TYPES.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


settings = Settings()

os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
