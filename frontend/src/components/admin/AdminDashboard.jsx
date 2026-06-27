import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching system metrics:", err));
  }, []);

  if (loading) return <div className="text-slate-500 animate-pulse">Loading engine metrics...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-800">System Telemetry</h3>
      
      {/* Metrics Card Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Templates</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.totalForms}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.totalSubmissions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Target Accuracy</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{metrics.extractionSuccessRate}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processed Runs</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{metrics.totalLogs}</p>
        </div>
      </div>
    </div>
  );
}