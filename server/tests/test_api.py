import os
import sys
import io
import pytest
from fastapi.testclient import TestClient

# Ensure server module is in sys.path
SERVER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "Random Forest" in data["model_name"]

def test_auth_flow():
    # 1. Register
    email = f"test_doctor_{os.urandom(4).hex()}@curamed.io"
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Dr. Sarah Mitchell",
        "organization": "Metabolic Research Clinic"
    })
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    token = reg_data["access_token"]
    assert reg_data["user"]["email"] == email

    # 2. Duplicate registration check
    dup_res = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Duplicate User"
    })
    assert dup_res.status_code == 400

    # 3. Login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["user"]["full_name"] == "Dr. Sarah Mitchell"

    # 4. Authenticated Me endpoint
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

def test_diabetes_prediction_and_report():
    # High risk case
    high_risk_input = {
        "pregnancies": 6,
        "glucose": 180.0,
        "blood_pressure": 90.0,
        "skin_thickness": 35.0,
        "insulin": 210.0,
        "bmi": 38.5,
        "diabetes_pedigree_function": 0.85,
        "age": 52,
        "patient_name": "Test Patient High Risk",
        "patient_notes": "Follow-up screening test"
    }

    pred_res = client.post("/api/predict/diabetes", json=high_risk_input)
    assert pred_res.status_code == 200
    data = pred_res.json()
    assert data["prediction"] in (0, 1)
    assert "risk_level" in data
    assert "probability_percentage" in data
    assert len(data["top_contributing_factors"]) > 0
    assert "educational_explanation" in data
    assert "disclaimer" in data
    
    pred_id = data["id"]

    # Test PDF Report Generation
    pdf_res = client.get(f"/api/reports/pdf/{pred_id}")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

    # Test History List
    history_res = client.get("/api/predictions")
    assert history_res.status_code == 200
    items = history_res.json()
    assert any(item["id"] == pred_id for item in items)

def test_models_info():
    res = client.get("/api/predict/models-info")
    assert res.status_code == 200
    data = res.json()
    assert "models_comparison" in data
    assert "Random Forest" in data["models_comparison"]
    assert "Logistic Regression" in data["models_comparison"]
    assert "Decision Tree" in data["models_comparison"]
    assert "K-Nearest Neighbors" in data["models_comparison"]

def test_analytics_sample_and_upload():
    # 1. Sample dataset analytics
    sample_res = client.get("/api/analytics/sample-data")
    assert sample_res.status_code == 200
    sample_data = sample_res.json()
    assert sample_data["overview"]["total_rows"] == 768
    assert len(sample_data["column_summaries"]) == 9
    assert sample_data["correlations"] is not None

    # 2. Upload custom CSV
    csv_content = b"age,glucose,cholesterol\n25,90,180\n30,110,200\n45,150,240\n60,180,260\n"
    upload_res = client.post(
        "/api/analytics/upload",
        files={"file": ("custom_patient_cohort.csv", io.BytesIO(csv_content), "text/csv")}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["overview"]["total_rows"] == 4
    assert upload_data["overview"]["total_columns"] == 3
