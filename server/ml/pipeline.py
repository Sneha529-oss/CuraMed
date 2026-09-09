import os
import json
import numpy as np
import pandas as pd
import joblib
from typing import Dict, Any, List, Optional

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "trained_models"))
PIPELINE_PATH = os.path.join(MODEL_DIR, "diabetes_pipeline.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "model_metrics.json")

# Canonical order of features
FEATURE_NAMES = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age"
]

FEATURE_LABELS = {
    "Pregnancies": "Pregnancies",
    "Glucose": "Plasma Glucose Concentration (mg/dL)",
    "BloodPressure": "Diastolic Blood Pressure (mm Hg)",
    "SkinThickness": "Triceps Skinfold Thickness (mm)",
    "Insulin": "2-Hour Serum Insulin (mu U/ml)",
    "BMI": "Body Mass Index (kg/m²)",
    "DiabetesPedigreeFunction": "Diabetes Pedigree Function (Genetic Score)",
    "Age": "Age (Years)"
}

class DiabetesPredictionPipeline:
    def __init__(self):
        self.pipeline = None
        self.metrics = None
        self.feature_importances = {}
        self.feature_stats = {}
        self.model_name = "Random Forest Classifier"
        self._load()

    def _load(self):
        if os.path.exists(PIPELINE_PATH):
            try:
                self.pipeline = joblib.load(PIPELINE_PATH)
                print(f"[ML Engine] Loaded pipeline from {PIPELINE_PATH}")
            except Exception as e:
                print(f"[ML Engine] Error loading pipeline: {e}")

        if os.path.exists(METRICS_PATH):
            try:
                with open(METRICS_PATH, "r") as f:
                    self.metrics = json.load(f)
                    self.feature_importances = self.metrics.get("feature_importances", {})
                    self.feature_stats = self.metrics.get("feature_stats", {})
                    self.model_name = self.metrics.get("best_model", "Random Forest Classifier")
                print(f"[ML Engine] Loaded metrics from {METRICS_PATH}")
            except Exception as e:
                print(f"[ML Engine] Error loading metrics: {e}")

    def is_ready(self) -> bool:
        return self.pipeline is not None

    def get_metrics(self) -> Dict[str, Any]:
        if self.metrics:
            return self.metrics
        return {"status": "Model not yet trained or loaded"}

    def predict(self, input_data: Dict[str, float]) -> Dict[str, Any]:
        if not self.is_ready():
            # If not loaded, attempt to reload
            self._load()
            if not self.is_ready():
                raise RuntimeError("ML Pipeline is not loaded. Please ensure the model is trained.")

        # Build single-row DataFrame in exact feature order
        row = {f: [float(input_data[f])] for f in FEATURE_NAMES}
        df_input = pd.DataFrame(row)

        # 1. Model inference
        prediction_class = int(self.pipeline.predict(df_input)[0])
        
        if hasattr(self.pipeline, "predict_proba"):
            probabilities = self.pipeline.predict_proba(df_input)[0]
            prob_positive = float(probabilities[1])
            prob_negative = float(probabilities[0])
        else:
            prob_positive = float(prediction_class)
            prob_negative = float(1 - prediction_class)

        # 2. Risk level classification
        if prob_positive < 0.35:
            risk_level = "Low"
            risk_color = "#059669" # emerald
            risk_summary = "Clinical parameters suggest low immediate probability of diabetes risk."
        elif prob_positive < 0.65:
            risk_level = "Moderate"
            risk_color = "#d97706" # amber
            risk_summary = "Intermediate risk profile. Preventative lifestyle adjustments and routine screening recommended."
        else:
            risk_level = "High"
            risk_color = "#e11d48" # rose
            risk_summary = "Elevated indicators detected. Formal clinical diagnostic assessment and follow-up strongly advised."

        # 3. Factor impact analysis
        factor_contributions = []
        total_relative_impact = 0.0

        for f_name in FEATURE_NAMES:
            val = float(input_data[f_name])
            stats = self.feature_stats.get(f_name, {})
            mean_val = stats.get("mean", 100.0)
            q75_val = stats.get("q75", 120.0)
            global_importance = self.feature_importances.get(f_name, 0.125)

            # Deviation from standard population mean
            std_val = stats.get("std", 1.0) or 1.0
            z_score = (val - mean_val) / std_val
            
            # Clinical elevation multiplier (higher values in glucose/BMI/age increase diabetes risk)
            risk_direction = "Elevated" if z_score > 0.5 else ("Below Average" if z_score < -0.5 else "Typical")
            
            # Impact magnitude is proportional to global model importance and local deviation
            impact_magnitude = abs(z_score) * global_importance
            total_relative_impact += impact_magnitude

            factor_contributions.append({
                "feature": f_name,
                "label": FEATURE_LABELS.get(f_name, f_name),
                "patient_value": val,
                "population_mean": round(mean_val, 2),
                "population_median": round(stats.get("median", mean_val), 2),
                "global_importance": round(global_importance * 100, 1),
                "status": risk_direction,
                "z_score": round(z_score, 2),
                "_raw_impact": impact_magnitude
            })

        # Normalize relative contribution percentages
        if total_relative_impact > 0:
            for item in factor_contributions:
                item["relative_contribution_pct"] = round((item["_raw_impact"] / total_relative_impact) * 100, 1)
                del item["_raw_impact"]
        else:
            for item in factor_contributions:
                item["relative_contribution_pct"] = round(100.0 / len(FEATURE_NAMES), 1)
                del item["_raw_impact"]

        # Sort factors by impact descending
        factor_contributions.sort(key=lambda x: x["relative_contribution_pct"], reverse=True)

        return {
            "prediction": prediction_class,
            "prediction_label": "High Risk / Positive Indicators" if prediction_class == 1 else "Low Risk / Negative Indicators",
            "probability": round(prob_positive, 4),
            "probability_percentage": round(prob_positive * 100, 1),
            "confidence_score": round(max(prob_positive, prob_negative) * 100, 1),
            "risk_level": risk_level,
            "risk_color": risk_color,
            "risk_summary": risk_summary,
            "model_used": self.model_name,
            "top_contributing_factors": factor_contributions[:4],
            "all_factor_analysis": factor_contributions,
            "disclaimer": "Educational and research risk assessment tool only. Not a clinical medical diagnosis."
        }

# Global singleton instance
prediction_engine = DiabetesPredictionPipeline()
