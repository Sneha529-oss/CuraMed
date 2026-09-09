import React, { useState } from 'react';
import { 
  HeartPulse, 
  Sparkles, 
  Download, 
  RotateCcw, 
  AlertTriangle, 
  Activity, 
  Info, 
  Stethoscope
} from 'lucide-react';
import { predictAPI, reportAPI } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskGauge } from '../components/common/RiskGauge';

const PRESETS = {
  healthy: {
    label: 'Healthy Baseline Profile',
    desc: 'Normal biomarkers, low risk parameters',
    values: {
      patient_name: 'Elena Rostova',
      pregnancies: 1,
      glucose: 92,
      blood_pressure: 72,
      skin_thickness: 18,
      insulin: 55,
      bmi: 22.4,
      diabetes_pedigree_function: 0.24,
      age: 28,
      patient_notes: 'Annual routine wellness examination.'
    }
  },
  borderline: {
    label: 'Borderline Profile',
    desc: 'Mild elevation in BMI & glucose',
    values: {
      patient_name: 'Marcus Vance',
      pregnancies: 0,
      glucose: 138,
      blood_pressure: 82,
      skin_thickness: 28,
      insulin: 115,
      bmi: 28.9,
      diabetes_pedigree_function: 0.54,
      age: 45,
      patient_notes: 'Moderate metabolic screening checkup.'
    }
  },
  elevated: {
    label: 'Elevated Risk Profile',
    desc: 'Significant glucose elevation & high BMI',
    values: {
      patient_name: 'Arthur Pendelton',
      pregnancies: 4,
      glucose: 178,
      blood_pressure: 88,
      skin_thickness: 35,
      insulin: 210,
      bmi: 37.8,
      diabetes_pedigree_function: 0.89,
      age: 54,
      patient_notes: 'Follow-up for metabolic assessment.'
    }
  }
};

const ClinicalInput = ({
  id,
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = "1",
  inputMode = "numeric",
  normalRange
}) => {
  const numVal = value === '' ? NaN : Number(value);
  const isOutOfRange = !isNaN(numVal) && (numVal < min || numVal > max);

  return (
    <div className="bg-slate-50/80 hover:bg-slate-50 transition-colors p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-2.5 shadow-xs">
      <div className="flex justify-between items-baseline gap-2">
        <label htmlFor={id} className="block text-sm sm:text-base font-bold text-slate-800 tracking-tight">
          {label}
        </label>
        {isOutOfRange && (
          <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Out of range ({min}–{max})
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          id={id}
          name={id}
          type="number"
          min={min}
          max={max}
          step={step}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={`w-full h-11 sm:h-12 px-3.5 py-2.5 bg-white border ${
            isOutOfRange 
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' 
              : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/20'
          } rounded-xl text-base sm:text-lg font-bold text-slate-900 shadow-inner focus:outline-none focus:ring-3 transition-all ${
            unit ? 'pr-20' : 'pr-3.5'
          }`}
        />
        {unit && (
          <div className="absolute right-2.5 pointer-events-none text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            {unit}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 font-medium pt-0.5">
        <span className="flex items-center gap-1 text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
          <Info className="w-3 h-3 text-teal-600 flex-shrink-0" />
          {normalRange}
        </span>
        <span className="text-slate-400 text-[11px]">
          Range: {min}–{max}
        </span>
      </div>
    </div>
  );
};

export const PredictPage = () => {
  const [formData, setFormData] = useState(PRESETS.borderline.values);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState('factors');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePresetSelect = (presetKey) => {
    setFormData(PRESETS[presetKey].values);
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setFormData(PRESETS.healthy.values);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        pregnancies: Number(formData.pregnancies),
        glucose: Number(formData.glucose),
        blood_pressure: Number(formData.blood_pressure),
        skin_thickness: Number(formData.skin_thickness),
        insulin: Number(formData.insulin),
        bmi: Number(formData.bmi),
        diabetes_pedigree_function: Number(formData.diabetes_pedigree_function),
        age: Number(formData.age),
        patient_name: formData.patient_name || '',
        patient_notes: formData.patient_notes || ''
      };

      const response = await predictAPI.predictDiabetes(payload);
      setResult(response);
      setActiveTab('factors');
    } catch (err) {
      setError(err.message || 'Failed to process prediction.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result?.id) return;
    try {
      setDownloadingPdf(true);
      await reportAPI.downloadPdf(result.id, result.patient_name || 'Patient');
    } catch (err) {
      alert(`Could not download PDF: ${err.message}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 shadow-xs">
              <HeartPulse className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Diabetes Disease Risk Prediction
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Deterministic Random Forest classification model with feature importance attribution and educational AI summaries.
          </p>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 lg:pt-0">
          <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Quick Presets:</span>
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(PRESETS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePresetSelect(key)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-400 text-xs sm:text-sm font-semibold text-slate-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Form Container (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>Patient Vitals & Clinical Biomarkers</span>
              </h2>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Patient Name & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="patient_name" className="block text-sm sm:text-base font-bold text-slate-800">
                  Patient Name or ID <span className="text-xs font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  id="patient_name"
                  name="patient_name"
                  type="text"
                  value={formData.patient_name}
                  onChange={(e) => handleInputChange('patient_name', e.target.value)}
                  placeholder="e.g. John Doe / Patient #402"
                  className="w-full h-11 sm:h-12 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20 shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="patient_notes" className="block text-sm sm:text-base font-bold text-slate-800">
                  Clinical Notes <span className="text-xs font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  id="patient_notes"
                  name="patient_notes"
                  type="text"
                  value={formData.patient_notes}
                  onChange={(e) => handleInputChange('patient_notes', e.target.value)}
                  placeholder="e.g. Routine screening assessment"
                  className="w-full h-11 sm:h-12 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20 shadow-xs transition-all"
                />
              </div>
            </div>

            {/* 8 Biomarkers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              {/* Plasma Glucose */}
              <ClinicalInput
                id="glucose"
                label="Plasma Glucose"
                value={formData.glucose}
                onChange={handleInputChange}
                unit="mg/dL"
                min={40}
                max={300}
                step="1"
                inputMode="numeric"
                normalRange="Normal: 70–125 mg/dL"
              />

              {/* Body Mass Index (BMI) */}
              <ClinicalInput
                id="bmi"
                label="Body Mass Index (BMI)"
                value={formData.bmi}
                onChange={handleInputChange}
                unit="kg/m²"
                min={12}
                max={65}
                step="0.1"
                inputMode="decimal"
                normalRange="Normal: 18.5–24.9 kg/m²"
              />

              {/* Age */}
              <ClinicalInput
                id="age"
                label="Age"
                value={formData.age}
                onChange={handleInputChange}
                unit="years"
                min={18}
                max={100}
                step="1"
                inputMode="numeric"
                normalRange="Normal adult range: 18–100 yrs"
              />

              {/* Diastolic Blood Pressure */}
              <ClinicalInput
                id="blood_pressure"
                label="Diastolic Blood Pressure"
                value={formData.blood_pressure}
                onChange={handleInputChange}
                unit="mm Hg"
                min={40}
                max={180}
                step="1"
                inputMode="numeric"
                normalRange="Normal: 60–80 mm Hg"
              />

              {/* 2-Hour Serum Insulin */}
              <ClinicalInput
                id="insulin"
                label="2-Hour Serum Insulin"
                value={formData.insulin}
                onChange={handleInputChange}
                unit="μU/mL"
                min={0}
                max={600}
                step="1"
                inputMode="numeric"
                normalRange="Normal: 15–160 μU/mL"
              />

              {/* Diabetes Pedigree Function */}
              <ClinicalInput
                id="diabetes_pedigree_function"
                label="Diabetes Pedigree (Genetics)"
                value={formData.diabetes_pedigree_function}
                onChange={handleInputChange}
                unit=""
                min={0.05}
                max={2.5}
                step="0.01"
                inputMode="decimal"
                normalRange="Standard: 0.10–0.90"
              />

              {/* Triceps Skinfold */}
              <ClinicalInput
                id="skin_thickness"
                label="Triceps Skinfold"
                value={formData.skin_thickness}
                onChange={handleInputChange}
                unit="mm"
                min={0}
                max={80}
                step="1"
                inputMode="numeric"
                normalRange="Normal: 10–40 mm"
              />

              {/* Pregnancies */}
              <ClinicalInput
                id="pregnancies"
                label="Pregnancies"
                value={formData.pregnancies}
                onChange={handleInputChange}
                unit="count"
                min={0}
                max={17}
                step="1"
                inputMode="numeric"
                normalRange="Standard range: 0–17"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 px-6 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm sm:text-base font-bold rounded-2xl shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing ML Inference & AI Summary...</span>
                </>
              ) : (
                <>
                  <HeartPulse className="w-5 h-5" />
                  <span>Execute Risk Assessment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Container (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-card space-y-5 animate-in fade-in zoom-in-95">
              {/* Header Status */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Clinical Assessment Result</h3>
                  <p className="text-xs text-slate-500">Model: {result.model_used}</p>
                </div>
                <RiskBadge level={result.risk_level} size="md" />
              </div>

              {/* Gauge */}
              <div className="py-1">
                <RiskGauge 
                  probability={result.probability_percentage} 
                  riskLevel={result.risk_level} 
                  size={190} 
                />
              </div>

              {/* Summary message */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-0.5">Clinical Evaluation:</span>
                {result.risk_summary}
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-100 text-xs sm:text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('factors')}
                  className={`pb-2.5 px-3.5 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'factors'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Key Factors
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('explanation')}
                  className={`pb-2.5 px-3.5 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'explanation'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  AI Explanation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('parameters')}
                  className={`pb-2.5 px-3.5 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'parameters'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Biomarkers
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-3">
                {activeTab === 'factors' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Biomarkers ranked by relative contribution toward predicted risk:
                    </p>
                    {result.top_contributing_factors.map((factor, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700">
                          <span>{factor.label || factor.feature} ({factor.patient_value})</span>
                          <span className="text-teal-700 font-bold">{factor.relative_contribution_pct}% impact</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              factor.status === 'Elevated' ? 'bg-rose-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${Math.max(factor.relative_contribution_pct, 5)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Status: {factor.status}</span>
                          <span>Cohort Mean: {factor.population_mean}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'explanation' && (
                  <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-60 overflow-y-auto space-y-1.5">
                    <div className="flex items-center gap-1.5 text-teal-800 font-bold mb-0.5">
                      <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>Educational Clinical Synthesis</span>
                    </div>
                    <div className="whitespace-pre-line text-slate-600">
                      {result.educational_explanation}
                    </div>
                  </div>
                )}

                {activeTab === 'parameters' && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.all_factor_analysis.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm">
                        <span className="text-slate-700 font-medium">{f.label || f.feature}</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{f.patient_value}</span>
                          <span className="text-[11px] text-slate-400 block">Baseline: {f.population_mean}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Download Report Button */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-soft disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingPdf ? 'Generating ReportLab PDF...' : 'Download Clinical PDF Assessment'}</span>
              </button>

              {/* Disclaimer */}
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                {result.disclaimer}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-7 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center shadow-xs">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Awaiting Patient Assessment</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Enter clinical parameters on the left and click "Execute Risk Assessment" to generate ML probability and factor impact scores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
