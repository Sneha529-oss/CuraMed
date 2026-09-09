import os
import sys
import httpx
import pandas as pd

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "datasets"))
DATASET_PATH = os.path.join(DATASET_DIR, "diabetes.csv")

PRIMARY_URL = "https://raw.githubusercontent.com/plotly/datasets/master/diabetes.csv"
BACKUP_URL = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv"

def download_and_verify():
    os.makedirs(DATASET_DIR, exist_ok=True)
    
    if os.path.exists(DATASET_PATH) and os.path.getsize(DATASET_PATH) > 1000:
        print(f"Dataset already exists at {DATASET_PATH}")
        df = pd.read_csv(DATASET_PATH)
        print(f"Verified dataset shape: {df.shape}")
        return True

    print(f"Downloading dataset from {PRIMARY_URL}...")
    try:
        with httpx.Client(timeout=15.0, follow_redirects=True) as client:
            resp = client.get(PRIMARY_URL)
            if resp.status_code == 200:
                with open(DATASET_PATH, "wb") as f:
                    f.write(resp.content)
                df = pd.read_csv(DATASET_PATH)
                print(f"Downloaded successfully! Shape: {df.shape}, Columns: {list(df.columns)}")
                return True
    except Exception as e:
        print(f"Primary URL failed ({e}), trying backup...")

    try:
        with httpx.Client(timeout=15.0, follow_redirects=True) as client:
            resp = client.get(BACKUP_URL)
            if resp.status_code == 200:
                import io
                headers = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome"]
                df = pd.read_csv(io.StringIO(resp.text), names=headers)
                df.to_csv(DATASET_PATH, index=False)
                print(f"Backup downloaded successfully! Shape: {df.shape}")
                return True
    except Exception as e2:
        print(f"Backup URL failed ({e2})")

    return False

if __name__ == "__main__":
    download_and_verify()
