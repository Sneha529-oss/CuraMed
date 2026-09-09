import React, { useState, useEffect } from 'react';
import { 
  Database, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BarChart2, 
  Filter, 
  Download, 
  Layers, 
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { analyticsAPI } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Cleaning options
  const [cleanDeduplicate, setCleanDeduplicate] = useState(true);
  const [imputeStrategy, setImputeStrategy] = useState('median');
  const [cleaningInProgress, setCleaningInProgress] = useState(false);

  // Load sample dataset on initial view
  useEffect(() => {
    loadSampleCohort();
  }, []);

  const loadSampleCohort = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsAPI.getSampleAnalytics();
      setAnalyticsData(data);
      const firstNum = data.column_summaries.find(c => c.is_numeric && c.distribution_histogram);
      setSelectedColumn(firstNum?.column_name || null);
    } catch (err) {
      setError(err.message || 'Failed to load sample dataset.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid .CSV file.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUploadedFile(file);
      const data = await analyticsAPI.uploadDataset(file);
      setAnalyticsData(data);
      const firstNum = data.column_summaries.find(c => c.is_numeric && c.distribution_histogram);
      setSelectedColumn(firstNum?.column_name || null);
    } catch (err) {
      setError(err.message || 'Failed to analyze uploaded CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanAndDownload = async () => {
    let fileToClean = uploadedFile;
    
    // If user hasn't uploaded their own file, fetch sample CSV as a blob to clean
    if (!fileToClean) {
      try {
        const resp = await fetch('https://raw.githubusercontent.com/plotly/datasets/master/diabetes.csv');
        const blob = await resp.blob();
        fileToClean = new File([blob], 'diabetes_cohort.csv', { type: 'text/csv' });
      } catch (err) {
        alert('Could not fetch baseline dataset to clean.');
        return;
      }
    }

    try {
      setCleaningInProgress(true);
      const response = await analyticsAPI.cleanDataset(fileToClean, {
        remove_duplicates: cleanDeduplicate,
        impute_strategy: imputeStrategy
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cleaned_${fileToClean.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Cleaning error: ${err.message}`);
    } finally {
      setCleaningInProgress(false);
    }
  };

  const activeColumnSummary = analyticsData?.column_summaries.find(
    c => c.column_name === selectedColumn
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dataset Analytics & Cleaning Suite
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Automated missing value analysis, descriptive statistics, feature distribution histograms, and Pearson correlation matrices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadSampleCohort}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            <span>Reload Sample Cohort</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Upload Banner */}
      <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-teal-400 transition-all shadow-xs">
        <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 block">
              {uploadedFile ? uploadedFile.name : 'Upload Custom Clinical CSV Dataset'}
            </span>
            <span className="text-xs text-slate-400">
              Drag and drop or browse your local file system (.csv up to 25MB)
            </span>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <LoadingSpinner text="Computing Statistical Aggregations and Correlations..." />
      ) : analyticsData ? (
        <>
          {/* 5 Dataset Health Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Total Records"
              value={analyticsData.overview.total_rows.toLocaleString()}
              subtitle="Patient samples"
              icon={FileSpreadsheet}
              color="brand"
            />
            <MetricCard
              title="Biomarker Columns"
              value={analyticsData.overview.total_columns}
              subtitle="Observed features"
              icon={Layers}
              color="blue"
            />
            <MetricCard
              title="Missing Cells"
              value={`${analyticsData.overview.missing_cells_total}`}
              subtitle={`${analyticsData.overview.missing_cells_percentage}% total missing`}
              icon={AlertCircle}
              color={analyticsData.overview.missing_cells_total > 0 ? 'amber' : 'emerald'}
            />
            <MetricCard
              title="Duplicate Rows"
              value={analyticsData.overview.duplicate_rows_total}
              subtitle="Redundant entries"
              icon={Filter}
              color={analyticsData.overview.duplicate_rows_total > 0 ? 'rose' : 'emerald'}
            />
            <MetricCard
              title="Dataset Size"
              value={`${analyticsData.overview.memory_usage_kb} KB`}
              subtitle="In-memory footprint"
              icon={Database}
              color="slate"
            />
          </div>

          {/* Descriptive Statistics Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Biomarker Descriptive Statistics</h3>
                <p className="text-xs text-slate-500">Distribution metrics calculated across each clinical feature</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700">
                {analyticsData.overview.filename}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5 rounded-l-xl">Feature</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Count</th>
                    <th className="py-3 px-3">Missing %</th>
                    <th className="py-3 px-3">Mean</th>
                    <th className="py-3 px-3">Std Dev</th>
                    <th className="py-3 px-3">Min</th>
                    <th className="py-3 px-3">Median</th>
                    <th className="py-3 px-3 rounded-r-xl">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {analyticsData.column_summaries.map((col) => (
                    <tr key={col.column_name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        {col.column_name}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono">
                          {col.data_type}
                        </span>
                      </td>
                      <td className="py-3 px-3">{col.count}</td>
                      <td className="py-3 px-3">
                        <span className={col.missing_percentage > 0 ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                          {col.missing_percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{col.mean ?? '--'}</td>
                      <td className="py-3 px-3 text-slate-500">{col.std ?? '--'}</td>
                      <td className="py-3 px-3">{col.min ?? '--'}</td>
                      <td className="py-3 px-3 text-teal-700 font-bold">{col.median ?? '--'}</td>
                      <td className="py-3 px-3">{col.max ?? '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Feature Histogram Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Feature Distribution Histogram</h3>
                  <p className="text-xs text-slate-500">Select any numeric biomarker to inspect bin frequencies</p>
                </div>

                <select
                  value={selectedColumn || ''}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  {analyticsData.column_summaries
                    .filter(c => c.is_numeric && c.distribution_histogram)
                    .map(c => (
                      <option key={c.column_name} value={c.column_name}>
                        {c.column_name}
                      </option>
                    ))}
                </select>
              </div>

              {activeColumnSummary?.distribution_histogram ? (
                <div className="h-64 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeColumnSummary.distribution_histogram}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="bin" stroke="#94a3b8" fontSize={10} interval={0} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip 
                        formatter={(val) => [`${val} records`, 'Frequency']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      />
                      <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  Select a numeric column to view histogram.
                </div>
              )}
            </div>

            {/* Automated Data Cleaning Toolbox */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Automated Data Cleaning Toolkit</h3>
                  <p className="text-xs text-slate-500">Apply standard medical preprocessing and download cleaned CSV</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Deduplication check */}
                <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cleanDeduplicate}
                    onChange={(e) => setCleanDeduplicate(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Deduplicate Identical Rows</span>
                    <span className="text-[11px] text-slate-500">Removes repeated clinical records to prevent training leakage</span>
                  </div>
                </label>

                {/* Imputation Strategy */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <span className="font-bold text-slate-900 block">Missing Value Imputation Strategy:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['median', 'mean', 'drop'].map((strat) => (
                      <button
                        key={strat}
                        type="button"
                        onClick={() => setImputeStrategy(strat)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-colors ${
                          imputeStrategy === strat
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {strat}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    *Median strategy is strongly recommended for physiological vitals to prevent outlier distortion.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCleanAndDownload}
                disabled={cleaningInProgress}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{cleaningInProgress ? 'Processing & Imputing Dataset...' : 'Clean & Download Processed CSV'}</span>
              </button>
            </div>
          </div>

          {/* Pearson Correlation Heatmap Table */}
          {analyticsData.correlations && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pearson Correlation Matrix</h3>
                <p className="text-xs text-slate-500">Linear inter-dependence between recorded clinical features (-1.0 to +1.0)</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-center text-xs">
                  <thead>
                    <tr>
                      <th className="py-2.5 px-3 text-left font-bold text-slate-600 bg-slate-50 rounded-l-xl">Feature</th>
                      {analyticsData.correlations.numeric_columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-2 font-bold text-slate-700 bg-slate-50 text-[11px]">
                          {col.length > 8 ? `${col.slice(0, 7)}.` : col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {analyticsData.correlations.matrix.map((row, rIdx) => {
                      const rowName = analyticsData.correlations.numeric_columns[rIdx];
                      return (
                        <tr key={rIdx}>
                          <td className="py-2.5 px-3 text-left font-sans font-bold text-slate-900 bg-slate-50/50">
                            {rowName}
                          </td>
                          {row.map((val, cIdx) => {
                            let cellBg = 'bg-white text-slate-700';
                            if (val > 0.5) cellBg = 'bg-teal-500 text-white font-bold';
                            else if (val > 0.3) cellBg = 'bg-teal-100 text-teal-900 font-bold';
                            else if (val > 0.1) cellBg = 'bg-teal-50 text-teal-800';
                            else if (val < -0.3) cellBg = 'bg-rose-100 text-rose-900 font-bold';
                            
                            return (
                              <td key={cIdx} className={`py-2 px-2 transition-colors ${cellBg}`}>
                                {val.toFixed(2)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
