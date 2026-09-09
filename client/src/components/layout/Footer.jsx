import React from 'react';
import { Activity, ShieldCheck, HeartPulse, FileText, Code2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900">
                Cura<span className="text-teal-600">Med</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Smart Healthcare Analytics & Disease Risk Prediction Platform. Built for clinical decision support, academic data exploration, and explainable ML.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Full-Stack SIP Portfolio Project</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/predict" className="hover:text-teal-600 transition-colors">
                  Diabetes Risk Inference
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-teal-600 transition-colors">
                  Dataset Explorer & Cleaning
                </Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-teal-600 transition-colors">
                  ML Model Benchmarks & ROC
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-teal-600 transition-colors">
                  Patient Assessment Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical ML Tech */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Algorithms & Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Random Forest Classifier
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Logistic Regression & Decision Trees
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Post-Inference Gemini Educational AI
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                ReportLab Automated PDF Engine
              </li>
            </ul>
          </div>

          {/* Research & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Research & Compliance
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Trained on canonical biomedical datasets with stratified 5-fold cross-validation and feature scaling.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Source Code Repository</span>
              </a>
            </div>
          </div>
        </div>

        {/* Prominent Medical Disclaimer Banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 mb-6 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">HEALTHCARE & REGULATORY NOTICE: </span>
            <span>
              CuraMed is designed exclusively for educational, academic demonstration, and research exploration purposes. The statistical probability calculations generated by machine learning models and AI services do not constitute formal medical diagnosis, prognosis, or clinical treatment directives. Always consult a certified healthcare professional.
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} CuraMed Health Analytics. Academic Portfolio & 3rd-Year SIP Project.</p>
          <p className="flex items-center gap-1 font-medium text-slate-500">
            Powered by FastAPI • React • Scikit-Learn • MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};
