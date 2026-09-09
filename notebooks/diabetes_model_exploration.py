"""
CuraMed - Machine Learning Exploration & Benchmarking Script
Dataset: Pima Indians Diabetes Dataset (UCI / NIDDK)
Models: Logistic Regression, Decision Tree, Random Forest, K-Nearest Neighbors
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    accuracy_score,
    f1_score
)

def run_exploration():
    dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets", "diabetes.csv"))
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}. Please run server/ml/train.py first.")
        return

    df = pd.read_csv(dataset_path)
    print("==================================================")
    print("           CuraMed ML Data Exploration            ")
    print("==================================================")
    print(f"Total Cohort Samples: {df.shape[0]}")
    print(f"Features: {list(df.columns)}")
    print("\nTarget Distribution:")
    print(df['Outcome'].value_counts(normalize=True))

    # Physiological zero replacement
    zero_cols = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
    df_clean = df.copy()
    for col in zero_cols:
        df_clean[col] = df_clean[col].replace(0, np.nan)

    X = df_clean.drop(columns=["Outcome"])
    y = df_clean["Outcome"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=4, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=250, max_depth=6, random_state=42),
        "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=9)
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print("\n==================================================")
    print("               Model Evaluation Results           ")
    print("==================================================")

    for name, clf in models.items():
        pipe = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("classifier", clf)
        ])

        cv_scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="roc_auc")
        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)
        y_proba = pipe.predict_proba(X_test)[:, 1] if hasattr(pipe, "predict_proba") else y_pred

        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_proba)

        print(f"\n--- {name} ---")
        print(f"Accuracy: {acc*100:.2f}% | F1-Score: {f1*100:.2f}% | ROC-AUC: {auc*100:.2f}%")
        print(f"5-Fold CV ROC-AUC: {np.mean(cv_scores)*100:.2f}% (±{np.std(cv_scores)*100:.2f}%)")
        print("Confusion Matrix:")
        print(confusion_matrix(y_test, y_pred))

if __name__ == "__main__":
    run_exploration()
