import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  BarChart3, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  HeartPulse, 
  Cpu, 
  Database, 
  Sliders,
  AlertCircle,
  FileCheck2,
  Stethoscope
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskGauge } from '../components/common/RiskGauge';

export const LandingPage = () => {
  // Mini interactive simulator for the landing hero
  const [demoGlucose, setDemoGlucose] = useState(135);
  const [demoBmi, setDemoBmi] = useState(28.5);
  const [demoAge, setDemoAge] = useState(42);

  // Approximate live demo score calculation
  const demoRiskScore = Math.min(
    Math.max(
      Math.round(((demoGlucose - 70) / 130) * 45 + ((demoBmi - 18) / 30) * 35 + ((demoAge - 20) / 60) * 20),
      5
    ),
    95
  );

  const demoRiskLevel = demoRiskScore > 65 ? 'High' : demoRiskScore > 35 ? 'Moderate' : 'Low';

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Next-Gen Machine Learning & Health Analytics</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Smart Disease Risk Prediction & <span className="text-teal-600">Clinical Analytics</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                CuraMed empowers healthcare practitioners and researchers with deterministic machine learning risk models, automated clinical dataset exploration, post-inference AI explanations, and downloadable clinical PDF reports.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/predict"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl shadow-soft hover:shadow-card transition-all"
                >
                  <HeartPulse className="w-5 h-5" />
                  <span>Start Risk Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/analytics"
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 shadow-soft transition-all"
                >
                  <Database className="w-4 h-4 text-teal-600" />
                  <span>Explore Dataset Analytics</span>
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-slate-600 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Real Public Datasets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Random Forest Pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Instant PDF Reports</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Live Interactive Simulator Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Interactive Clinical Simulator</h3>
                      <p className="text-[11px] text-slate-400">Live test model risk factors</p>
                    </div>
                  </div>
                  <RiskBadge level={demoRiskLevel} size="sm" />
                </div>

                <div className="my-4 flex justify-center">
                  <RiskGauge probability={demoRiskScore} riskLevel={demoRiskLevel} size={180} />
                </div>

                {/* Sliders */}
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Glucose (mg/dL)</span>
                      <span className="text-teal-600 font-bold">{demoGlucose} mg/dL</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="220"
                      value={demoGlucose}
                      onChange={(e) => setDemoGlucose(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Body Mass Index (BMI)</span>
                      <span className="text-teal-600 font-bold">{demoBmi} kg/m²</span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="45"
                      step="0.5"
                      value={demoBmi}
                      onChange={(e) => setDemoBmi(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Patient Age</span>
                      <span className="text-teal-600 font-bold">{demoAge} yrs</span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="85"
                      value={demoAge}
                      onChange={(e) => setDemoAge(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>
                </div>

                <Link
                  to="/predict"
                  className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <span>Open Full 8-Parameter Disease Predictor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Core Capabilities</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Precision & Explainability
          </h3>
          <p className="text-slate-500 text-sm mt-2">
            A comprehensive clinical workflow bridging statistical machine learning with actionable insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mb-4">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">ML Disease Prediction</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trained on canonical clinical datasets with missing-value imputation and feature scaling. Evaluates 8 key biomarkers for diabetes risk.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Model Benchmarking</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transparent evaluation across Random Forest, Logistic Regression, Decision Tree, and KNN with ROC-AUC and confusion matrices.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Dataset Analytics</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload custom clinical CSVs to instantly calculate missing values, duplicates, statistical metrics, distribution histograms, and correlation matrices.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">ReportLab PDF Export</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate formatted medical assessment summaries with biomarker tables, factor attribution ranking, AI education, and disclaimers.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works 3-Step Section */}
      <section className="bg-slate-100/70 border-y border-slate-200/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Clinical Workflow</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">How CuraMed Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft relative">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Input Clinical Biomarkers</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide patient vitals including Plasma Glucose, Diastolic BP, BMI, Insulin levels, Age, and Family Pedigree score.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft relative">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">ML Pipeline Inference</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The serialized Scikit-learn preprocessor & Random Forest model compute the exact probability score and factor importance deviation.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft relative">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">AI Explanation & PDF</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gemini AI generates plain-English educational guidance, and ReportLab compiles a downloadable clinical report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-3xl p-8 sm:p-12 text-white shadow-elevated flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Explore Predictive Healthcare Analytics?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Launch a live diabetes risk evaluation or load the cohort dataset to inspect interactive distributions and correlation matrices.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/predict"
              className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow"
            >
              Run Prediction Now
            </Link>
            <Link
              to="/models"
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all border border-white/20"
            >
              View Model Metrics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
