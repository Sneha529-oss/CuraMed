import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from core.config import settings
from db.mongodb import db_manager
from ml.pipeline import prediction_engine
from routes.auth_routes import router as auth_router
from routes.prediction_routes import router as prediction_router
from routes.analytics_routes import router as analytics_router
from routes.report_routes import router as report_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("==================================================")
    print("  Initializing CuraMed Backend Engine...")
    print("==================================================")
    db_manager.connect()
    if not prediction_engine.is_ready():
        print("[Startup] Triggering ML pipeline training check...")
        try:
            from ml.train import train_and_evaluate_models
            train_and_evaluate_models()
            prediction_engine._load()
        except Exception as e:
            print(f"[Startup Warning] Could not auto-train pipeline: {e}")
    else:
        print(f"[Startup] ML Pipeline Active: {prediction_engine.model_name}")

    yield

    print("[Shutdown] CuraMed backend shutdown complete.")

app = FastAPI(
    title="CuraMed Healthcare Platform API",
    description="Production-grade API for Disease Risk Prediction, Dataset Analytics, and Clinical Reports.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(prediction_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(report_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CuraMed API",
        "version": "1.0.0",
        "model_loaded": prediction_engine.is_ready(),
        "model_name": prediction_engine.model_name,
        "database_mode": "MongoDB Atlas" if db_manager.is_atlas else "Reliable Local Storage"
    }

@app.get("/")
async def root():
    return {
        "platform": "CuraMed — Smart Healthcare Analytics & Disease Risk Prediction Platform",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    reload_flag = os.environ.get("ENV", "development").lower() == "development"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_flag)
