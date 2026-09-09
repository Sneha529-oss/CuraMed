import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, Query
import pymongo
from core.security import get_optional_current_user
from db.mongodb import db_manager
from ml.pipeline import prediction_engine
from services.gemini_service import gemini_service
from schemas.prediction import (
    DiabetesPredictionInput,
    PredictionResponse,
    PredictionListItem
)

router = APIRouter(tags=["Predictions"])

@router.post("/predict/diabetes", response_model=PredictionResponse)
async def predict_diabetes(
    input_data: DiabetesPredictionInput,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    try:
        # Convert Pydantic model to ML feature dictionary
        feature_dict = input_data.to_model_dict()
        
        # 1. Deterministic ML inference
        raw_result = prediction_engine.predict(feature_dict)
        
        # 2. Educational AI explanation
        explanation = gemini_service.generate_explanation(
            risk_level=raw_result["risk_level"],
            probability_percentage=raw_result["probability_percentage"],
            model_used=raw_result["model_used"],
            input_data=feature_dict,
            top_factors=raw_result["top_contributing_factors"]
        )

        prediction_id = str(uuid.uuid4())
        now_str = datetime.now(timezone.utc).isoformat()
        user_id = current_user.get("sub") if current_user else "anonymous"

        # 3. Store record in database
        record_doc = {
            "_id": prediction_id,
            "id": prediction_id,
            "user_id": user_id,
            "patient_name": input_data.patient_name.strip() if (input_data.patient_name and input_data.patient_name.strip()) else "",
            "patient_notes": input_data.patient_notes,
            "input_parameters": feature_dict,
            "prediction": raw_result["prediction"],
            "prediction_label": raw_result["prediction_label"],
            "probability": raw_result["probability"],
            "probability_percentage": raw_result["probability_percentage"],
            "confidence_score": raw_result["confidence_score"],
            "risk_level": raw_result["risk_level"],
            "risk_color": raw_result["risk_color"],
            "risk_summary": raw_result["risk_summary"],
            "model_used": raw_result["model_used"],
            "top_contributing_factors": raw_result["top_contributing_factors"],
            "all_factor_analysis": raw_result["all_factor_analysis"],
            "educational_explanation": explanation,
            "disclaimer": raw_result["disclaimer"],
            "created_at": now_str
        }

        db_manager.predictions.insert_one(record_doc)

        return PredictionResponse(**record_doc)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction pipeline error: {str(e)}"
        )

@router.get("/predict/models-info")
async def get_models_info():
    """Returns benchmark comparison data for all evaluated models."""
    return prediction_engine.get_metrics()

@router.get("/predictions/stats/summary")
async def get_stats_summary(current_user: Optional[dict] = Depends(get_optional_current_user)):
    query: Dict[str, Any] = {}
    if current_user:
        query["user_id"] = current_user.get("sub")

    records = db_manager.predictions.find(query=query)
    total = len(records)
    
    high_count = sum(1 for r in records if r.get("risk_level") == "High")
    med_count = sum(1 for r in records if r.get("risk_level") == "Moderate")
    low_count = sum(1 for r in records if r.get("risk_level") == "Low")

    recent_trend = [
        {
            "id": r.get("id", "")[:8],
            "patient_name": r.get("patient_name", "Anonymous"),
            "probability": r.get("probability_percentage", 0.0),
            "risk_level": r.get("risk_level", "Low"),
            "created_at": r.get("created_at", "")
        }
        for r in sorted(records, key=lambda x: x.get("created_at", ""), reverse=True)[:10]
    ]

    return {
        "total_assessments": total,
        "high_risk_count": high_count,
        "moderate_risk_count": med_count,
        "low_risk_count": low_count,
        "recent_trend": recent_trend
    }

@router.get("/predictions", response_model=List[PredictionListItem])
@router.get("/predictions/", response_model=List[PredictionListItem])
async def list_predictions(
    search: Optional[str] = Query(None, description="Search by patient name"),
    risk_level: Optional[str] = Query(None, description="Filter by Low, Moderate, High"),
    sort_order: str = Query("desc", enum=["asc", "desc"]),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    query: Dict[str, Any] = {}
    if current_user:
        query["user_id"] = current_user.get("sub")

    if risk_level and risk_level.lower() != "all":
        query["risk_level"] = risk_level.capitalize()

    if search:
        query["patient_name"] = {"$regex": search}

    sort_direction = pymongo.DESCENDING if sort_order == "desc" else pymongo.ASCENDING
    records = db_manager.predictions.find(
        query=query,
        sort=[("created_at", sort_direction)],
        skip=skip,
        limit=limit
    )

    results = []
    for r in records:
        inputs = r.get("input_parameters", {})
        results.append(PredictionListItem(
            id=str(r.get("id") or r.get("_id")),
            patient_name=r.get("patient_name"),
            risk_level=r.get("risk_level", "Low"),
            risk_color=r.get("risk_color", "#059669"),
            probability_percentage=r.get("probability_percentage", 0.0),
            model_used=r.get("model_used", "Random Forest"),
            glucose=float(inputs.get("Glucose", 0.0)),
            bmi=float(inputs.get("BMI", 0.0)),
            age=int(inputs.get("Age", 0)),
            created_at=r.get("created_at", "")
        ))
    return results

@router.get("/predictions/{prediction_id}", response_model=PredictionResponse)
async def get_prediction_detail(prediction_id: str):
    doc = db_manager.predictions.find_one({"_id": prediction_id})
    if not doc:
        doc = db_manager.predictions.find_one({"id": prediction_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction assessment not found.")
    return PredictionResponse(**doc)

@router.delete("/predictions/{prediction_id}")
async def delete_prediction(prediction_id: str):
    res = db_manager.predictions.delete_one({"_id": prediction_id})
    if res.deleted_count == 0:
        db_manager.predictions.delete_one({"id": prediction_id})
    return {"message": "Prediction record deleted successfully", "id": prediction_id}
