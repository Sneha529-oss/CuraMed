# CuraMed — Smart Healthcare Analytics & Disease Risk Prediction Platform

> **Academic SIP Project & Full-Stack Medical Intelligence Platform**  
> *Production-quality platform bridging deterministic Machine Learning classifiers, clinical dataset exploration, post-inference educational AI explanations, and automated ReportLab PDF health reports.*

---

## Demo
View Live : https://curamed-nine.vercel.app/

## 🌟 Key Capabilities

1. **Deterministic ML Disease Risk Prediction**:
   - Evaluates 8 key physiological biomarkers (Plasma Glucose, BMI, Age, Diastolic BP, Insulin, Skinfold Thickness, Pregnancies, Pedigree Function) on the canonical **Pima Indians Diabetes Dataset**.
   - Computes continuous probability risk scores and classifies patients into clinical tiers: **Low Risk (<35%)**, **Moderate Risk (35–64%)**, and **High Risk (≥65%)**.
   - Extracts exact **Biomarker Factor Contributions** indicating which parameters deviate most from healthy baselines.

2. **Rigorous Machine Learning Benchmarking**:
   - Trains and benchmarks 4 algorithms: **Random Forest Classifier** (Selected Pipeline), **Logistic Regression**, **Decision Tree**, and **K-Nearest Neighbors (KNN)**.
   - Evaluates performance via Accuracy, Precision, Recall, F1-Score, ROC-AUC, and 5-Fold Stratified Cross-Validation.
   - Saves end-to-end serialized pipelines with `Joblib` (Imputer + Scaler + Estimator) — zero retraining on individual inferences.

3. **Post-Inference Educational AI Summaries (Gemini API)**:
   - Educational AI synthesized strictly *after* deterministic ML computation.
   - Fully resilient: If the Gemini API key is omitted or offline, the platform provides comprehensive rule-based clinical guidance.
   - Strictly enforces non-diagnostic educational guardrails.

4. **Clinical Dataset Analytics & Automated Cleaning Suite**:
   - Drag-and-drop CSV explorer calculating missing values, duplicates, memory size, and 7-bin histogram distributions.
   - Pearson correlation heat matrix.
   - 1-Click Automated Data Cleaning (median/mean imputation, deduplication, and downloadable cleaned CSV).

5. **Downloadable ReportLab PDF Clinical Summaries**:
   - Instant generation of branded, formatted PDF medical reports containing patient vitals, risk gauges, factor impact ranking tables, educational guidance, and legal disclaimers.

6. **Secure Full-Stack Authentication & History Tracking**:
   - Native `bcrypt` password hashing + JWT access token security.
   - MongoDB Atlas persistence with seamless local in-memory fallback for local development.

---

## 🏗️ Architecture & Technology Stack

```
CuraMed/
├── client/                     # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Layout (Navbar, Footer), Common (RiskGauge, RiskBadge, MetricCard)
│   │   ├── context/            # AuthContext (Persistent JWT session management)
│   │   ├── pages/              # Landing, Dashboard, Predict, Analytics, Models, History, Auth
│   │   └── services/           # Axios API Client & Endpoints
│   ├── vercel.json             # Vercel SPA Routing Configuration
│   └── package.json
├── server/                     # FastAPI Python Backend
│   ├── core/                   # Security (bcrypt, JWT) & Settings (Pydantic)
│   ├── db/                     # MongoDB Atlas Manager with in-memory fallback
│   ├── ml/                     # Dataset Downloader, Trainer, Pipeline Inference Engine
│   ├── routes/                 # Auth, Prediction, Analytics, PDF Report Routes
│   ├── services/               # Gemini AI Explainer & ReportLab PDF Generator
│   ├── tests/                  # Automated pytest test suites
│   ├── main.py                 # FastAPI Application Entrypoint
│   └── requirements.txt
├── datasets/                   # Canonical Pima Indians Diabetes Dataset
├── trained_models/             # Serialized .joblib pipeline & model_metrics.json
├── notebooks/                  # Standalone data science exploration script
├── .env.example
├── render.yaml                 # Render Backend Blueprint
└── README.md
```

### Technology Matrix

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS v4, React Router v6, Axios, Recharts, Lucide Icons |
| **Backend API** | Python 3.12+, FastAPI, Uvicorn, Pydantic v2 |
| **Machine Learning** | Scikit-learn, Pandas, NumPy, Joblib |
| **Database** | MongoDB Atlas / PyMongo (with Local Memory Fallback) |
| **Reports & AI** | ReportLab PDF Engine, Google GenAI (Gemini 2.5 Flash) |
| **Authentication** | JWT (Python-Jose) + bcrypt |

---

## 📊 Machine Learning Methodology & Benchmark Results

### 1. Preprocessing Pipeline
- **Biological Zero Handling**: Zero values in physiological measurements (`Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`) represent missing clinical records and are imputed using **Median Imputation** to prevent outlier skew.
- **Scaling**: Standardized Z-score normalization (`StandardScaler`) ensures distance-sensitive models (KNN, Logistic Regression) perform optimally.
- **Stratified Split**: 80/20 train/test split preserving target class ratio.

### 2. Model Comparison (Test Cohort)

| Model | Accuracy | F1-Score | ROC-AUC | Recall | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest Classifier** | **75.32%** | **67.24%** | **82.11%** | **72.22%** | **Selected Production Pipeline** |
| **Logistic Regression** | 73.38% | 64.96% | 81.24% | 70.37% | Benchmark |
| **Decision Tree** | 70.78% | 66.67% | 78.43% | 83.33% | Benchmark |
| **K-Nearest Neighbors (KNN)** | 74.03% | 62.26% | 79.69% | 61.11% | Benchmark |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18+ (v22 recommended)
- **Python**: v3.11+ (v3.12 or v3.13)

### 1. Clone & Configure Environment
```bash
git clone https://github.com/your-username/CuraMed.git
cd CuraMed
cp .env.example .env
```

### 2. Backend Setup & Model Training
```bash
# In the project root:
py -3 -m venv .venv
# On Windows: .\.venv\Scripts\activate | On Linux/macOS: source .venv/bin/activate

pip install -r server/requirements.txt

# Train models and export joblib pipeline:
py -3 server/ml/train.py

# Start FastAPI backend:
py -3 -m uvicorn server.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend Web Application available at: `http://localhost:5173`

---

## 🌐 Production Deployment Guide

Follow this guide to deploy CuraMed to production using **Render** for the Python FastAPI backend and **Vercel** for the React frontend.

### Step 1: Push Project to GitHub
1. Initialize Git and commit all project files:
   ```bash
   git init
   git add .
   git commit -m "Initial production release of CuraMed platform"
   ```
2. Push your repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/your-username/CuraMed.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Database Setup (MongoDB Atlas)
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 Cluster.
3. Under **Database Access**, create a user (e.g. `curamed_admin`) and secure password.
4. Under **Network Access**, add `0.0.0.0/0` to allow connections from Render.
5. Copy your connection string:
   `mongodb+srv://curamed_admin:<password>@cluster.mongodb.net/curamed_db?retryWrites=true&w=majority`

---

### Step 3: Deploy Backend on Render
1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your `CuraMed` GitHub repository.
4. Configure service parameters:
   - **Name**: `curamed-api`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to your users (e.g. Oregon)
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     pip install -r server/requirements.txt && python server/ml/train.py
     ```
   - **Start Command**:
     ```bash
     uvicorn server.main:app --host 0.0.0.0 --port $PORT
     ```
5. Configure **Environment Variables** in Render:
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `SECRET_KEY`: *Random 32-character secret key for JWT signing*
   - `GEMINI_API_KEY`: *(Optional) Your Google Gemini API Key*
   - `ENV`: `production`
6. Deploy the web service. Render will train the ML pipeline during build and expose your backend URL (e.g., `https://curamed-api.onrender.com`).

---

### Step 4: Deploy Frontend on Vercel
1. Sign in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your `CuraMed` GitHub repository.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`
5. Environment Variables:
   - `VITE_API_BASE_URL`: `https://curamed-api.onrender.com/api` (replace with your actual Render URL).
6. Click **Deploy**. Vercel will build the React SPA and provide a live production URL (e.g., `https://curamed-platform.vercel.app`).

---

## 🧪 Automated Testing

Execute the automated test suite covering authentication, predictions, PDF streams, and dataset uploads:
```bash
py -3 -m pytest server/tests/test_api.py -v
```

---

## 🔒 Security & Privacy Practices

- **Zero Secret Exposure**: All keys and credentials configured via environment variables.
- **Password Security**: Salted hashes generated via `bcrypt` with 12 rounds.
- **Stateless Authentication**: Cryptographically signed JWT tokens with 7-day expiration.
- **Fail-Safe Offline Mode**: Graceful degradation to local memory storage when cloud databases are unreachable.

---

## ⚠️ Healthcare & Regulatory Disclaimer

> **IMPORTANT**: CuraMed is engineered strictly for **educational, academic research, and clinical decision-support demonstration purposes**. The probabilistic calculations generated by machine learning models and AI services do **NOT** constitute formal medical diagnosis, prognosis, treatment plans, or therapeutic directives. Always seek the advice of a board-certified physician or qualified healthcare provider with any questions regarding medical conditions.
