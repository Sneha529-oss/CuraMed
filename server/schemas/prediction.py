from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DiabetesPredictionInput(BaseModel):
    pregnancies: int = Field(0, ge=0, le=25, description="Number of pregnancies")
    glucose: float = Field(120.0, ge=30.0, le=350.0, description="Plasma glucose concentration (mg/dL)")
    blood_pressure: float = Field(70.0, ge=30.0, le=220.0, description="Diastolic blood pressure (mm Hg)")
    skin_thickness: float = Field(20.0, ge=0.0, le=110.0, description="Triceps skinfold thickness (mm)")
    insulin: float = Field(79.0, ge=0.0, le=900.0, description="2-Hour serum insulin (mu U/ml)")
    bmi: float = Field(25.0, ge=10.0, le=75.0, description="Body Mass Index (kg/m²)")
    diabetes_pedigree_function: float = Field(0.47, ge=0.01, le=3.0, description="Diabetes pedigree function genetic score")
    age: int = Field(33, ge=1, le=120, description="Age in years")
    patient_name: Optional[str] = Field(None, max_length=100, description="Optional patient name for report generation")
    patient_notes: Optional[str] = Field(None, max_length=500, description="Optional clinical notes")

    def to_model_dict(self) -> Dict[str, float]:
        return {
            "Pregnancies": float(self.pregnancies),
            "Glucose": float(self.glucose),
            "BloodPressure": float(self.blood_pressure),
            "SkinThickness": float(self.skin_thickness),
            "Insulin": float(self.insulin),
            "BMI": float(self.bmi),
            "DiabetesPedigreeFunction": float(self.diabetes_pedigree_function),
            "Age": float(self.age)
        }

class FactorContribution(BaseModel):
    feature: str
    label: str
    patient_value: float
    population_mean: float
    population_median: float
    global_importance: float
    status: str
    z_score: float
    relative_contribution_pct: float

class PredictionResponse(BaseModel):
    id: str
    patient_name: Optional[str] = None
    patient_notes: Optional[str] = None
    input_parameters: Dict[str, Any]
    prediction: int
    prediction_label: str
    probability: float
    probability_percentage: float
    confidence_score: float
    risk_level: str
    risk_color: str
    risk_summary: str
    model_used: str
    top_contributing_factors: List[FactorContribution]
    all_factor_analysis: List[FactorContribution]
    educational_explanation: str
    disclaimer: str
    created_at: str

class PredictionListItem(BaseModel):
    id: str
    patient_name: Optional[str] = None
    risk_level: str
    risk_color: str
    probability_percentage: float
    model_used: str
    glucose: float
    bmi: float
    age: int
    created_at: str
