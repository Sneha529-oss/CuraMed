import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Award, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Info, 
  Sparkles,
  GitCompare,
  Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { predictAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ModelsPage = () => {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const data = await predictAPI.getModelsInfo();
        setModelData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch model comparison metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading Machine Learning Benchmarks..." />;
  }

  if (error || !modelData?.models_comparison) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        <p>Could not load model benchmarks. Ensure the ML pipeline is trained.</p>
      </div>
    );
  }

  const comparison = modelData.models_comparison;
  const bestModelName = modelData.best_model || 'Random Forest';

  // Prepare chart comparison data
  const chartData = Object.values(comparison).map((m) => ({
    name: m.name,
    Accuracy: m.accuracy,
    Precision: m.precision,
    Recall: m.recall,
    'F1 Score': m.f1_score,
    'ROC AUC': m.roc_auc,
  }));

  // Prepare feature importance chart data
  const featureImpData = Object.entries(modelData.feature_importances || {})
    .map(([key, val]) => ({
      feature: key,
      importance: Number((val * 100).toFixed(1)),
    }))
    .sort((a, b) => b.importance - a.importance);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Machine Learning Model Benchmarks
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Empirical evaluation of 4 classification algorithms trained with 5-fold cross validation.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold shadow-xs">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Active Pipeline: {bestModelName}</span>
        </div>
      </div>

      {/* Side-by-Side Model Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Comparative Performance Metrics</h3>
            <p className="text-xs text-slate-500">Evaluated on independent 20% stratified test cohort</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Dataset: Pima Indians Diabetes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">Algorithm</th>
                <th className="py-3.5 px-4">Accuracy</th>
                <th className="py-3.5 px-4">Precision</th>
                <th className="py-3.5 px-4">Recall</th>
                <th className="py-3.5 px-4">F1 Score</th>
                <th className="py-3.5 px-4">ROC-AUC</th>
                <th className="py-3.5 px-4">5-Fold CV (F1)</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {Object.values(comparison).map((model) => {
                const isBest = model.name === bestModelName;
                return (
                  <tr
                    key={model.name}
                    className={`transition-colors ${isBest ? 'bg-teal-50/50 hover:bg-teal-50' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      {isBest && <Award className="w-4 h-4 text-teal-600" />}
                      <span>{model.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{model.accuracy}%</td>
                    <td className="py-3.5 px-4">{model.precision}%</td>
                    <td className="py-3.5 px-4">{model.recall}%</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{model.f1_score}%</td>
                    <td className="py-3.5 px-4 font-bold text-teal-700">{model.roc_auc}%</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {model.cv_f1_mean}% ± {model.cv_f1_std}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isBest ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Selected
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Metric Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Multi-Metric Model Comparison</h3>
              <p className="text-xs text-slate-500">Accuracy, F1 Score, and ROC-AUC across models</p>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[40, 100]} unit="%" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Accuracy" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1 Score" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROC AUC" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Feature Importance Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Global Feature Importance</h3>
              <p className="text-xs text-slate-500">Gini-impurity contribution in Random Forest</p>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureImpData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} unit="%" />
                <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={10} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'Relative Importance']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#0f766e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confusion Matrices Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Confusion Matrices (Test Cohort)</h3>
          <p className="text-xs text-slate-500">True Negatives, False Positives, False Negatives, True Positives</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(comparison).map((model) => {
            const cm = model.confusion_matrix || [[0, 0], [0, 0]];
            const tn = cm[0][0];
            const fp = cm[0][1];
            const fn = cm[1][0];
            const tp = cm[1][1];

            return (
              <div
                key={model.name}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2"
              >
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <span>{model.name}</span>
                  <span className="text-teal-700 text-[11px]">{model.accuracy}% Acc</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-center text-xs pt-1">
                  <div className="p-2 bg-emerald-100/70 text-emerald-900 rounded-lg">
                    <span className="text-[10px] text-emerald-700 block uppercase">True Neg (TN)</span>
                    <span className="font-bold text-sm">{tn}</span>
                  </div>
                  <div className="p-2 bg-rose-100/70 text-rose-900 rounded-lg">
                    <span className="text-[10px] text-rose-700 block uppercase">False Pos (FP)</span>
                    <span className="font-bold text-sm">{fp}</span>
                  </div>
                  <div className="p-2 bg-rose-100/70 text-rose-900 rounded-lg">
                    <span className="text-[10px] text-rose-700 block uppercase">False Neg (FN)</span>
                    <span className="font-bold text-sm">{fn}</span>
                  </div>
                  <div className="p-2 bg-emerald-100/70 text-emerald-900 rounded-lg">
                    <span className="text-[10px] text-emerald-700 block uppercase">True Pos (TP)</span>
                    <span className="font-bold text-sm">{tp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
