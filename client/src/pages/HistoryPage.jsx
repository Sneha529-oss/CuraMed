import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  ArrowUpDown, 
  CheckCircle2, 
  X,
  FileText,
  HeartPulse
} from 'lucide-react';
import { predictAPI, reportAPI } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const HistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {
        sort_order: sortOrder,
        limit: 100,
      };
      if (search.trim()) params.search = search.trim();
      if (riskFilter !== 'All') params.risk_level = riskFilter;

      const data = await predictAPI.getHistory(params);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [riskFilter, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleViewDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const detail = await predictAPI.getPredictionDetail(id);
      setSelectedRecord(detail);
    } catch (err) {
      alert(`Could not load record details: ${err.message}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment record?')) return;
    try {
      await predictAPI.deletePrediction(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    } catch (err) {
      alert(`Failed to delete record: ${err.message}`);
    }
  };

  const handleDownloadPdf = async (id, name) => {
    try {
      setDownloadingId(id);
      await reportAPI.downloadPdf(id, name || 'Patient');
    } catch (err) {
      alert(`Failed to generate PDF: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
              <HistoryIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Patient Assessment Records
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, inspect, and export previous clinical risk evaluations.
          </p>
        </div>

        <button
          onClick={() => window.location.href = '/predict'}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
        >
          <HeartPulse className="w-4 h-4" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name or ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-teal-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Filter Buttons & Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            {['All', 'Low', 'Moderate', 'High'].map((tier) => (
              <button
                key={tier}
                onClick={() => setRiskFilter(tier)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  riskFilter === tier
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching clinical assessment records..." />
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Patient / Assessment</th>
                  <th className="py-3.5 px-4">Glucose</th>
                  <th className="py-3.5 px-4">BMI</th>
                  <th className="py-3.5 px-4">Age</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Risk Tier</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {records.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.patient_name || 'Anonymous'}</div>
                      <span className="text-[10px] text-slate-400 font-mono">#{item.id.slice(0, 8)}</span>
                    </td>
                    <td className="py-3.5 px-4">{item.glucose} mg/dL</td>
                    <td className="py-3.5 px-4">{item.bmi} kg/m²</td>
                    <td className="py-3.5 px-4">{item.age} yrs</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.probability_percentage}%
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={item.risk_level} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : '--'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-teal-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(item.id, item.patient_name)}
                        disabled={downloadingId === item.id}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-teal-700 transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No records found"
            description={search ? `No assessments match "${search}".` : "Execute a risk evaluation to record patient history."}
            actionLabel="Run Risk Assessment"
            onAction={() => window.location.href = '/predict'}
          />
        )}
      </div>

      {/* Modal View for Detailed Record */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elevated border border-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedRecord.patient_name || 'Anonymous Patient'} Assessment Detail
                </h3>
                <p className="text-xs text-slate-400 font-mono">ID: {selectedRecord.id}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Risk Banner in Modal */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-medium">Assessed Probability</span>
                <div className="text-2xl font-extrabold text-slate-900">
                  {selectedRecord.probability_percentage}%
                </div>
              </div>
              <RiskBadge level={selectedRecord.risk_level} size="lg" />
            </div>

            {/* Biomarkers Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Recorded Clinical Biomarkers
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(selectedRecord.input_parameters || {}).map(([k, v]) => (
                  <div key={k} className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">{k}</span>
                    <span className="font-bold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Educational AI Explanation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Educational AI Summary
              </h4>
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedRecord.educational_explanation}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadPdf(selectedRecord.id, selectedRecord.patient_name)}
                disabled={downloadingId === selectedRecord.id}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingId === selectedRecord.id ? 'Generating...' : 'Download PDF Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
