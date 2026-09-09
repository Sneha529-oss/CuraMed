import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CuraMed Healthcare Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "curamed-super-secret-production-quality-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # MongoDB Atlas connection string
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "curamed_db")
    
    # Google Gemini API key
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
