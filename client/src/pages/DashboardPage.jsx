import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  HeartPulse, 
  Database, 
  Cpu, 
  History, 
  FileText, 
  ArrowUpRight, 
  PlusCircle, 
  AlertCircle,
  TrendingUp,
  Download,
  Calendar,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { predictAPI, reportAPI } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, historyData] = await Promise.all([
          predictAPI.getStatsSummary(),
          predictAPI.getHistory({ limit: 6 })
        ]);
        setStats(statsData);
        setRecentPredictions(historyData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDownloadPdf = async (id, name) => {
    try {
      setDownloadingId(id);
      await reportAPI.downloadPdf(id, name);
    } catch (err) {
      alert(`Failed to download report: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Healthcare Intelligence Dashboard..." />;
  }

  const pieData = [
    { name: 'Low Risk', value: stats?.low_risk_count || 0, color: '#059669' },
    { name: 'Moderate Risk', value: stats?.moderate_risk_count || 0, color: '#d97706' },
    { name: 'High Risk', value: stats?.high_risk_count || 0, color: '#e11d48' },
  ].filter(item => item.value > 0);

  // If no assessments yet, show placeholder slice
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'Awaiting Assessments', value: 1, color: '#cbd5e1' }
  ];

  const trendData = (stats?.recent_trend || []).map((item, idx) => ({
    name: item.patient_name || `Patient #${idx + 1}`,
    probability: item.probability,
    risk: item.risk_level,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Clinical Health Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time disease probability monitoring, risk distribution, and patient activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-soft hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Risk Assessment</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Assessments"
          value={stats?.total_assessments || 0}
          subtitle="Processed through ML pipeline"
          icon={Activity}
          color="brand"
        />
        <MetricCard
          title="High Risk Profile"
          value={stats?.high_risk_count || 0}
          subtitle="Probability >= 65%"
          icon={AlertCircle}
          color="rose"
        />
        <MetricCard
          title="Moderate Risk Profile"
          value={stats?.moderate_risk_count || 0}
          subtitle="Probability 35% - 64%"
          icon={TrendingUp}
          color="amber"
        />
        <MetricCard
          title="Low Risk Profile"
          value={stats?.low_risk_count || 0}
          subtitle="Probability < 35%"
          icon={HeartPulse}
          color="emerald"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cohort Risk Distribution</h3>
              <p className="text-xs text-slate-500">Categorical breakdown of risk tiers</p>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name) => [`${val} Patient(s)`, name]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Probability Trend Area Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Assessment Trend</h3>
              <p className="text-xs text-slate-500">Predicted diabetes risk probability (%) over recent entries</p>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                  <Tooltip 
                    formatter={(val) => [`${val}%`, 'Risk Probability']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="probability" 
                    stroke="#0d9488" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#probGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Activity className="w-8 h-8 mb-2 text-slate-300" />
                <span>No assessments recorded yet. Run a prediction to see trend lines.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/predict"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft hover:shadow-card hover:border-teal-300 transition-all flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Run Disease Predictor</h4>
            <p className="text-xs text-slate-500 mt-1">Input 8 biomarkers for instant ML risk probability.</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
        </Link>

        <Link
          to="/analytics"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft hover:shadow-card hover:border-teal-300 transition-all flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Dataset Analytics Suite</h4>
            <p className="text-xs text-slate-500 mt-1">Upload CSV, inspect distributions & clean data.</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
        </Link>

        <Link
          to="/models"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft hover:shadow-card hover:border-teal-300 transition-all flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">ML Model Benchmarks</h4>
            <p className="text-xs text-slate-500 mt-1">Compare Random Forest, Tree, KNN & Logistic.</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>
      </div>

      {/* Recent Patient Assessments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Patient Assessments</h3>
            <p className="text-xs text-slate-500">Latest evaluations processed by the ML engine</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPredictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Patient / ID</th>
                  <th className="py-3 px-4">Glucose</th>
                  <th className="py-3 px-4">BMI</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Risk Probability</th>
                  <th className="py-3 px-4">Risk Tier</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentPredictions.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{record.patient_name || 'Anonymous'}</div>
                      <span className="text-[10px] text-slate-400 font-normal">#{record.id.slice(0, 8)}</span>
                    </td>
                    <td className="py-3.5 px-4">{record.glucose} mg/dL</td>
                    <td className="py-3.5 px-4">{record.bmi} kg/m²</td>
                    <td className="py-3.5 px-4">{record.age} yrs</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {record.probability_percentage}%
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={record.risk_level} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownloadPdf(record.id, record.patient_name)}
                        disabled={downloadingId === record.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingId === record.id ? 'Generating...' : 'PDF'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No assessments recorded yet"
            description="Run your first diabetes risk assessment to populate dashboard analytics."
            actionLabel="Run First Prediction"
            onAction={() => window.location.href = '/predict'}
          />
        )}
      </div>
    </div>
  );
};
