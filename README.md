# 🩺 CuraMed — Smart Healthcare Analytics & Disease Risk Prediction Platform

<p align="center">

**An intelligent healthcare analytics platform that combines Machine Learning, data analytics, and educational AI to support disease-risk assessment.**

</p>

<p align="center">

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react\&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi\&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python\&logoColor=white)
![Scikit Learn](https://img.shields.io/badge/ML-Scikit--learn-F7931E?logo=scikit-learn\&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4?logo=tailwindcss\&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</p>

---

## 📌 Overview

**CuraMed** is a full-stack healthcare analytics and disease-risk prediction platform designed to demonstrate how modern web technologies, machine learning, data analytics, and generative AI can work together in a single healthcare-oriented application.

The platform currently focuses on **diabetes risk prediction** using the **Pima Indians Diabetes Dataset** and a trained Scikit-learn machine learning pipeline.

CuraMed allows users to:

* Create an account and securely authenticate
* Enter clinical parameters for diabetes risk assessment
* Receive an ML-based prediction and probability score
* Understand important factors influencing the prediction
* View previous prediction history
* Analyze uploaded CSV datasets
* Perform basic data cleaning and statistical analysis
* Generate PDF assessment reports
* Receive simplified educational explanations through Gemini
* Compare the performance of multiple ML models

> **Important:** CuraMed is an educational and portfolio project. Its predictions are not medical diagnoses and should not be used as a substitute for professional medical advice.

---

# ✨ Key Features

## 1. Secure Authentication

CuraMed includes a complete authentication system using:

* User registration
* Secure password hashing with bcrypt
* JWT-based authentication
* Login/logout functionality
* Protected API routes
* Authenticated user sessions

---

## 2. Diabetes Risk Prediction

The core feature of CuraMed is an ML-powered diabetes risk assessment workflow.

Users provide clinical parameters including:

| Feature                    | Description                  |
| -------------------------- | ---------------------------- |
| Pregnancies                | Number of pregnancies        |
| Glucose                    | Plasma glucose concentration |
| Blood Pressure             | Diastolic blood pressure     |
| Skin Thickness             | Triceps skinfold thickness   |
| Insulin                    | 2-hour serum insulin         |
| BMI                        | Body Mass Index              |
| Diabetes Pedigree Function | Diabetes heredity score      |
| Age                        | Age in years                 |

The system processes the inputs through a previously trained machine learning pipeline.

The prediction workflow provides:

* Prediction result
* Probability score
* Risk classification
* Model used
* Important feature factors
* Educational explanation
* Healthcare disclaimer

The Pima dataset contains 768 observations with eight input variables and a binary outcome, making it a commonly used classification dataset for diabetes prediction. ([GitHub][2])

---

## 3. Machine Learning Pipeline

CuraMed does not train a model every time a user requests a prediction.

Instead, the ML workflow follows:

```text
Raw Dataset
     ↓
Data Validation
     ↓
Missing / Invalid Value Handling
     ↓
Duplicate Handling
     ↓
Feature Preparation
     ↓
Train / Test Split
     ↓
Model Training
     ↓
Model Comparison
     ↓
Best Model Selection
     ↓
Preprocessing + Model Pipeline
     ↓
Joblib Serialization
     ↓
Production Inference
```

### Models Evaluated

The project compares:

* Logistic Regression
* Decision Tree
* Random Forest
* K-Nearest Neighbors (KNN)

### Evaluation Metrics

Models are evaluated using:

* Accuracy
* Precision
* Recall
* F1-Score
* ROC-AUC
* Confusion Matrix

The best-performing model is selected for the final prediction pipeline.

**Random Forest is used when it provides appropriate performance based on the evaluation results.**

---

## 4. Dataset Analytics

CuraMed also provides a general-purpose CSV analytics workflow.

Users can upload a CSV file and inspect:

### Dataset Overview

* Number of rows
* Number of columns
* Data types
* Missing values
* Duplicate records

### Statistical Analysis

For numerical columns:

* Mean
* Median
* Standard deviation
* Minimum
* Maximum
* Quartiles

### Categorical Analysis

* Category frequencies
* Distribution analysis

### Correlation Analysis

The application can calculate numerical feature correlations and visualize relationships between variables.

### Basic Data Cleaning

The analytics engine can perform operations such as:

* Missing-value handling
* Duplicate removal
* Basic dataset validation

---

## 5. Educational AI Explanations

CuraMed optionally integrates **Google Gemini** to generate simple educational explanations after the ML prediction.

The architecture intentionally separates machine learning inference from generative AI.

```text
User Input
    ↓
ML Pipeline
    ↓
Prediction + Probability
    ↓
Feature Factors
    ↓
Gemini Educational Explanation
```

### Important Design Principle

Gemini **does not make the prediction**.

It cannot:

* Change the prediction
* Override the model
* Determine the risk score
* Replace the ML pipeline

Gemini only explains the already-generated result in simpler educational language.

If the Gemini API is unavailable or no API key is configured, CuraMed continues functioning using a structured fallback explanation.

---

## 6. PDF Reports

Users can generate downloadable PDF reports containing information such as:

* Assessment details
* Prediction result
* Probability
* Risk level
* Important factors
* Educational explanation
* Healthcare disclaimer

PDF generation is handled by **ReportLab** on the backend.

---

## 7. Prediction History

Authenticated users can access their previous assessments.

The history system supports:

* Prediction storage
* Search
* Filtering
* Sorting
* Pagination
* Detailed prediction inspection
* PDF report generation

---

## 8. Dashboard

The CuraMed dashboard provides an overview of the user's prediction activity.

It includes:

* Prediction statistics
* Recent assessments
* Risk distribution
* Quick actions
* Interactive charts
* Recent activity

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────────┐
                         │   React + Vite Frontend  │
                         │      Tailwind CSS        │
                         └────────────┬─────────────┘
                                      │
                                REST API + JWT
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │     FastAPI Backend      │
                         │        Python            │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼────────────────────────┐
              │                       │                        │
              ▼                       ▼                        ▼
      ┌───────────────┐      ┌─────────────────┐      ┌─────────────────┐
      │ ML Inference  │      │ Data Analytics  │      │ PDF Generation  │
      │ Scikit-learn  │      │ Pandas / NumPy  │      │    ReportLab    │
      └───────┬───────┘      └─────────────────┘      └─────────────────┘
              │
              ▼
      ┌───────────────────┐
      │ Joblib ML Pipeline│
      │   Random Forest   │
      └───────────────────┘

              │
              ▼
      ┌───────────────────┐
      │ MongoDB Atlas     │
      │      PyMongo      │
      └───────────────────┘

              │
              ▼
      ┌───────────────────┐
      │ Optional Gemini   │
      │ Educational AI    │
      └───────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology   | Purpose                |
| ------------ | ---------------------- |
| React        | UI development         |
| Vite         | Frontend build tooling |
| Tailwind CSS | Styling                |
| React Router | Application routing    |
| Axios        | API communication      |
| Recharts     | Data visualization     |
| Lucide React | UI icons               |

## Backend

| Technology | Purpose                    |
| ---------- | -------------------------- |
| Python     | Backend and ML development |
| FastAPI    | REST API                   |
| Pydantic   | Request/data validation    |
| Uvicorn    | ASGI server                |
| PyMongo    | MongoDB integration        |

## Machine Learning

| Technology   | Purpose                     |
| ------------ | --------------------------- |
| Pandas       | Data processing             |
| NumPy        | Numerical computation       |
| Scikit-learn | ML models and preprocessing |
| Joblib       | Model serialization         |

## AI

| Technology    | Purpose                  |
| ------------- | ------------------------ |
| Google Gemini | Educational explanations |

## Reporting

| Technology | Purpose               |
| ---------- | --------------------- |
| ReportLab  | PDF report generation |

## Database

| Technology    | Purpose                     |
| ------------- | --------------------------- |
| MongoDB Atlas | Persistent application data |

## Authentication

| Technology | Purpose               |
| ---------- | --------------------- |
| JWT        | Authentication tokens |
| bcrypt     | Password hashing      |

---

# 📁 Project Structure

```text
CuraMed/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   ├── database/
│   └── utils/
│
├── datasets/
│   └── diabetes dataset
│
├── trained_models/
│   ├── diabetes_pipeline.joblib
│   └── model_metrics.json
│
├── notebooks/
│   └── ML experimentation and evaluation
│
├── tests/
│   ├── test_auth.py
│   ├── test_prediction.py
│   ├── test_analytics.py
│   └── test_reports.py
│
├── .env.example
├── .gitignore
├── README.md
└── requirements.txt
```

> The exact internal structure may evolve as the application is developed.

---

## 🔌 API Architecture

CuraMed exposes REST APIs through FastAPI.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Prediction

```text
POST /api/predict/diabetes
GET  /api/predict/models-info
```

### Prediction History

```text
GET    /api/predictions
GET    /api/predictions/{prediction_id}
DELETE /api/predictions/{prediction_id}
```

### Analytics

```text
POST /api/analytics/upload
POST /api/analytics/clean
```

### Reports

```text
GET /api/reports/pdf/{prediction_id}
```

---

## Prediction Workflow

The complete prediction process is:

```text
User
 │
 │ Clinical Parameters
 ▼
React Frontend
 │
 │ POST /api/predict/diabetes
 ▼
FastAPI
 │
 ▼
Pydantic Validation
 │
 ▼
Preprocessing Pipeline
 │
 ▼
Scikit-learn Model
 │
 ▼
Prediction + Probability
 │
 ├───────────────┐
 ▼               ▼
Risk Level     Feature Factors
 │               │
 └───────┬───────┘
         ▼
   Gemini Service
         │
         ▼
Educational Explanation
         │
         ▼
    MongoDB Storage
         │
         ▼
      Frontend
```

---

##💻 Machine Learning Methodology

The ML pipeline follows a reproducible training workflow.

### 1. Dataset Preparation

The project uses the Pima Indians Diabetes dataset for the diabetes classification workflow.

The dataset contains:

* 768 records
* 8 clinical input features
* 1 binary target variable

### 2. Data Cleaning

The preprocessing workflow handles:

* Missing values
* Invalid biological zero values where appropriate
* Duplicate records
* Feature preparation

### 3. Train/Test Split

The dataset is divided into training and testing subsets using a stratified split.

### 4. Model Training

Four classification algorithms are evaluated:

```text
Logistic Regression
Decision Tree
Random Forest
KNN
```

### 5. Model Evaluation

Each model is evaluated using multiple metrics rather than relying only on accuracy.

```text
Accuracy
Precision
Recall
F1-Score
ROC-AUC
```

### 6. Model Serialization

The selected preprocessing and model pipeline is saved using Joblib:

```text
trained_models/diabetes_pipeline.joblib
```

Model comparison information is stored in:

```text
trained_models/model_metrics.json
```

This allows the backend to load the trained pipeline during application startup instead of retraining the model for every prediction.

---

## 🗄️ Database Architecture

CuraMed is designed to use **MongoDB Atlas** for persistent application data.

The database can store information such as:

```text
Users
Predictions
Prediction metadata
Assessment results
```

The MongoDB connection is configured using an environment variable:

```env
MONGODB_URI=your_mongodb_connection_string
```

For local development/testing, the backend can use its configured local fallback when MongoDB Atlas credentials are unavailable.

---

## 🔐 Security

Security considerations implemented in the project include:

* Password hashing using bcrypt
* JWT authentication
* Protected routes
* Environment variables for secrets
* Input validation
* Uploaded CSV validation
* API authentication
* No hardcoded API keys
* No committed `.env` files
* `.gitignore` protection for sensitive/local files

Before publishing the repository, ensure that secrets are never committed. GitHub recommends using security features such as secret scanning, push protection, Dependabot alerts, and code scanning where appropriate. ([GitHub Docs][1])

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Python 3.x
* Git
* MongoDB Atlas account *(optional for local fallback development)*

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CuraMed.git
cd CuraMed
```

---

### 🐍 2. Backend Setup

Navigate to the project root:

```powershell
cd CuraMed
```

Create a Python virtual environment:

```powershell
py -3 -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
py -3 -m pip install -r requirements.txt
```

---

### 3. Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### Important

Never commit:

```text
.env
```

to GitHub.

Only commit:

```text
.env.example
```

with placeholder values.

---

### 4. Start the Backend

From the CuraMed root directory:

```powershell
py -3 -m uvicorn server.main:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

### 5. Frontend Setup

Open a **second terminal**.

Navigate to:

```powershell
cd CuraMed\client
```

Install dependencies:

```powershell
npm install
```

Start Vite:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

### Local Development Architecture

During development, the application runs as two services:

```text
┌──────────────────────────────┐
│ React + Vite                 │
│ localhost:5173               │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│ FastAPI                      │
│ 127.0.0.1:8000               │
└──────────────┬───────────────┘
               │
       ┌───────┴─────────┐
       ▼                 ▼
 MongoDB             ML Pipeline
 Atlas               Scikit-learn
```

---

### Testing

The project is designed to include automated testing for critical backend functionality.

Example:

```powershell
pytest
```

Testing areas include:

### Authentication

* Registration
* Login
* JWT validation
* Protected routes

### Machine Learning

* Valid prediction requests
* Invalid input handling
* Pipeline loading
* Prediction generation

### Analytics

* CSV validation
* Missing-value calculations
* Duplicate detection
* Statistical calculations
* Correlation analysis

### Reports

* PDF generation
* PDF response validity

---

## 📸 Screenshots

> Add screenshots of the actual application here once the final UI is ready.

### Landing Page

```text
docs/screenshots/landing.png
```

### Dashboard

```text
docs/screenshots/dashboard.png
```

### Diabetes Prediction

```text
docs/screenshots/prediction.png
```

### Dataset Analytics

```text
docs/screenshots/analytics.png
```

### Prediction History

```text
docs/screenshots/history.png
```

### Model Comparison

```text
docs/screenshots/models.png
```

You can display them using:

```markdown
![CuraMed Dashboard](docs/screenshots/dashboard.png)
```

GitHub supports relative image paths in README files, so keeping screenshots inside the repository is a clean approach. ([GitHub Docs][3])

---

## 📊 Model Performance

Model performance is evaluated using multiple classification metrics.

| Model               | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| ------------------- | -------: | --------: | -----: | -------: | ------: |
| Logistic Regression |        — |         — |      — |        — |       — |
| Decision Tree       |        — |         — |      — |        — |       — |
| Random Forest       |        — |         — |      — |        — |       — |
| KNN                 |        — |         — |      — |        — |       — |

> **Note:** Replace the placeholders with the actual values generated by `model_metrics.json`. Do not manually enter or estimate model performance.

---

### Why Multiple Models?

Instead of assuming that one algorithm is automatically the best, CuraMed evaluates multiple approaches.

This makes the ML pipeline more transparent and allows the final model to be selected based on measurable performance.

For a healthcare-oriented classification problem, metrics such as **recall, precision, F1-score, and ROC-AUC** can provide additional insight beyond accuracy alone.

---

### 🧠 Why Separate ML and Gemini?

One of the main architectural decisions in CuraMed is the strict separation between **prediction** and **explanation**.

### Machine Learning

Responsible for:

```text
Prediction
Probability
Risk classification
Feature importance
```

### Gemini

Responsible for:

```text
Educational explanation
Result summarization
Simplifying technical information
```

Therefore:

```text
ML → Determines result
AI → Explains result
```

This prevents the generative AI component from becoming the source of the medical prediction.

---

## UI/UX Design

CuraMed follows a modern healthcare startup design philosophy.

### Design Principles

* Clean interface
* Professional typography
* Responsive layouts
* Healthcare-inspired visual language
* Rounded cards
* Clear information hierarchy
* Accessible data visualization
* Subtle animations
* Consistent spacing
* Minimal visual clutter

The goal is for CuraMed to feel like a **real healthcare technology product**, rather than a traditional academic CRUD application.

---

## Deployment

The planned production architecture is:

```text
                   Internet
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        Vercel              Render
        Frontend             Backend
        React/Vite           FastAPI
             │                   │
             │                   │
             └─────────┬─────────┘
                       │
                       ▼
                  MongoDB Atlas
```

### Frontend

Planned deployment:

**Vercel**

### Backend

Planned deployment:

**Render**

### Database

**MongoDB Atlas**

---

## ⚠️ Limitations

CuraMed is an educational and portfolio project and has several important limitations.

### Dataset Limitations

The diabetes prediction model is trained using the Pima Indians Diabetes dataset, which is a relatively small and historically established dataset.

It should not be interpreted as a clinically validated model for general patient populations.

### Model Limitations

Machine learning predictions depend on:

* Dataset quality
* Feature selection
* Training methodology
* Population characteristics
* Data distribution

Model performance on a test dataset does not guarantee real-world clinical performance.

### AI Limitations

Gemini-generated explanations may contain inaccuracies or oversimplifications.

The AI component is therefore treated only as an **educational explanation layer**.

### Clinical Limitations

CuraMed has not been clinically validated, approved as a medical device, or evaluated for real-world diagnosis.

---

## Future Improvements

Potential future development includes:

* Additional disease prediction models
* Cardiovascular risk prediction
* Hypertension risk assessment
* Explainable AI using SHAP
* Advanced model monitoring
* Model versioning
* Better dataset bias analysis
* External healthcare dataset validation
* Role-based access control
* Doctor/healthcare professional dashboard
* Advanced analytics
* Docker containerization
* CI/CD pipelines
* Automated ML retraining pipelines
* Cloud-based model serving
* Improved accessibility
* Comprehensive API documentation

---

## 🛡️ Healthcare Disclaimer

> **CuraMed is an educational software project and is not a medical diagnostic system.**
>
> Predictions, risk scores, charts, AI-generated explanations, and reports provided by CuraMed are intended solely for educational and demonstration purposes.
>
> The system should not be used to diagnose, treat, prevent, or make medical decisions regarding any disease or health condition.
>
> Always consult a qualified healthcare professional for medical advice, diagnosis, and treatment.

---

## 📚 Dataset

The diabetes prediction workflow uses the **Pima Indians Diabetes Dataset**.

The dataset is widely used for binary diabetes classification research and contains 768 observations with eight clinical input features and one target variable. ([GitHub][2])

For your final repository, I recommend linking to the authoritative dataset source rather than only linking to another GitHub copy.

**Dataset:** Pima Indians Diabetes Dataset

**Source:** UCI Machine Learning Repository

[UCI Machine Learning Repository — Pima Indians Diabetes Dataset](https://archive.ics.uci.edu/dataset/529/pima%2Bindians%2Bdiabetes?utm_source=chatgpt.com)

---

## 📖 Learning Objectives

This project was developed to explore the integration of:

* Full-stack web development
* REST API architecture
* Machine learning
* Data preprocessing
* Model comparison
* Model serialization
* Database management
* Authentication
* Data analytics
* Generative AI
* PDF generation
* Cloud deployment
* Software testing

The project also demonstrates how deterministic ML systems and generative AI systems can be separated into clearly defined responsibilities.

---

## Project Information

**Project:** CuraMed — Smart Healthcare Analytics & Disease Risk Prediction Platform

**Type:** 3rd-Year SIP / Academic + Portfolio Project

**Domain:** Healthcare Technology / Machine Learning / Data Analytics

**Primary Workflow:** Diabetes Risk Prediction

**Architecture:** Full Stack + Machine Learning + Optional Generative AI

---

## Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

```bash
git clone https://github.com/YOUR_USERNAME/CuraMed.git
cd CuraMed
```

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Make your changes, test them, and submit a pull request.

---

## 📄 License

This project is intended primarily for educational and portfolio purposes.

If you choose to publish it under MIT, add the corresponding `LICENSE` file to the repository and keep this section consistent with that license.

---

## ⭐ Acknowledgements

* **Scikit-learn** — Machine learning framework
* **FastAPI** — Backend API framework
* **React** — Frontend framework
* **Vite** — Frontend development tooling
* **Tailwind CSS** — UI styling
* **Pandas & NumPy** — Data processing
* **MongoDB** — Database
* **ReportLab** — PDF generation
* **Google Gemini** — Educational AI explanations
* **UCI Machine Learning Repository** — Dataset source

---

<p align="center">

### 🩺 CuraMed

**Turning healthcare data into understandable insights — responsibly.**

</p>

---

