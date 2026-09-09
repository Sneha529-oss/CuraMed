import os
import sys
import json
import numpy as np
import pandas as pd
import joblib

sys.path.insert(0, os.path.dirname(__file__))

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve
)

from download_dataset import DATASET_PATH

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "trained_models"))
PIPELINE_PATH = os.path.join(MODEL_DIR, "diabetes_pipeline.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "model_metrics.json")

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

ZERO_AS_MISSING_COLS = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]

def train_and_evaluate_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Could not load dataset at {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded dataset with shape: {df.shape}", flush=True)

    # 1. Clean biological zeros
    df_clean = df.copy()
    for col in ZERO_AS_MISSING_COLS:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].replace(0, np.nan)

    X = df_clean[FEATURE_NAMES]
    y = df_clean["Outcome"]

    # Calculate baseline population statistics
    feature_stats = {}
    for col in FEATURE_NAMES:
        feature_stats[col] = {
            "mean": float(X[col].mean(skipna=True)),
            "median": float(X[col].median(skipna=True)),
            "std": float(X[col].std(skipna=True)),
            "min": float(X[col].min(skipna=True)),
            "max": float(X[col].max(skipna=True)),
            "q25": float(X[col].quantile(0.25)),
            "q75": float(X[col].quantile(0.75))
        }

    # 2. Train-test split (stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 3. Models with clinical hyperparameter tuning
    models = {
        "Logistic Regression": LogisticRegression(
            C=0.8,
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=4,
            min_samples_split=6,
            min_samples_leaf=3,
            class_weight="balanced",
            random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=250,
            max_depth=6,
            min_samples_split=4,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42
        ),
        "K-Nearest Neighbors": KNeighborsClassifier(
            n_neighbors=9,
            weights="distance"
        )
    }

    results = {}
    best_model_name = "Random Forest"
    best_composite_score = -1.0
    fitted_pipelines = {}

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for name, model in models.items():
        pipe = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("classifier", model)
        ])

        # Cross validation scores
        cv_f1 = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="f1")
        cv_auc = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="roc_auc")
        
        # Fit model
        pipe.fit(X_train, y_train)
        fitted_pipelines[name] = pipe

        # Test set predictions
        y_pred = pipe.predict(X_test)
        if hasattr(pipe, "predict_proba"):
            y_proba = pipe.predict_proba(X_test)[:, 1]
        else:
            y_proba = pipe.decision_function(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        auc = float(roc_auc_score(y_test, y_proba))
        cm = confusion_matrix(y_test, y_pred).tolist()

        fpr, tpr, _ = roc_curve(y_test, y_proba)
        roc_points = [
            {"fpr": round(float(f), 3), "tpr": round(float(t), 3)}
            for f, t in zip(fpr, tpr)
        ]

        results[name] = {
            "name": name,
            "accuracy": round(acc * 100, 2),
            "precision": round(prec * 100, 2),
            "recall": round(rec * 100, 2),
            "f1_score": round(f1 * 100, 2),
            "roc_auc": round(auc * 100, 2),
            "cv_f1_mean": round(float(np.mean(cv_f1)) * 100, 2),
            "cv_auc_mean": round(float(np.mean(cv_auc)) * 100, 2),
            "confusion_matrix": cm,
            "roc_points": roc_points[:20]
        }

        print(f"[{name}] Acc: {acc*100:.2f}% | F1: {f1*100:.2f}% | ROC-AUC: {auc*100:.2f}% | Recall: {rec*100:.2f}%", flush=True)

        # Composite score weighting AUC (0.45), F1 (0.35), and Acc (0.20)
        composite = (auc * 0.45) + (f1 * 0.35) + (acc * 0.20)
        if composite > best_composite_score:
            best_composite_score = composite
            best_model_name = name

    print(f"\n---> Selected Best Model: {best_model_name}", flush=True)

    best_pipeline = fitted_pipelines[best_model_name]

    # Extract feature importance
    feature_importances = {}
    classifier = best_pipeline.named_steps["classifier"]
    if hasattr(classifier, "feature_importances_"):
        raw_importances = classifier.feature_importances_
        for f_name, imp in zip(FEATURE_NAMES, raw_importances):
            feature_importances[f_name] = round(float(imp), 4)
    elif hasattr(classifier, "coef_"):
        raw_importances = np.abs(classifier.coef_[0])
        norm_imp = raw_importances / np.sum(raw_importances)
        for f_name, imp in zip(FEATURE_NAMES, norm_imp):
            feature_importances[f_name] = round(float(imp), 4)

    # Save pipeline
    joblib.dump(best_pipeline, PIPELINE_PATH)
    print(f"Saved best pipeline to: {PIPELINE_PATH}", flush=True)

    metadata = {
        "best_model": best_model_name,
        "features": FEATURE_NAMES,
        "feature_importances": feature_importances,
        "feature_stats": feature_stats,
        "models_comparison": results,
        "dataset_info": {
            "total_samples": int(len(df)),
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "positive_cases": int(y.sum()),
            "negative_cases": int(len(y) - y.sum())
        }
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metrics to: {METRICS_PATH}", flush=True)

    return metadata

if __name__ == "__main__":
    train_and_evaluate_models()
