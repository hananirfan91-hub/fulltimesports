import React, { useEffect, useState } from 'react';
import { DollarSign, BarChart3, TrendingUp, Eye, MousePointer, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchClickioReport, ClickioReportRow } from '../lib/clickioApi';

export default function ClickioAdWidget() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ClickioReportRow[]>([]);
  const [summary, setSummary] = useState({ totalViews: 0, totalClicks: 0, avgCtr: 0, avgEcpm: 0, totalEarnings: 0 });
  const [isSimulated, setIsSimulated] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadReport = async () => {
    setLoading(true);
    const res = await fetchClickioReport();
    setReportData(res.data);
    setSummary(res.summary);
    setIsSimulated(!!res.isSimulated);
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Clickio Publisher Ad Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Report ID: 185 • Token: 165995_4094...
            </span>
          </div>
          <h3 className="font-display font-extrabold text-xl text-slate-900 mt-1 uppercase">
            CLICKIO UNIVERSAL AD REVENUE & ANALYTICS
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ad format metrics, eCPM, impressions, CTR, and revenue breakdown.
          </p>
        </div>

        <button
          onClick={loadReport}
          disabled={loading}
          className="bg-blue-900 hover:bg-blue-800 text-white font-mono font-bold text-xs uppercase px-4 py-2 rounded-xl flex items-center space-x-2 transition cursor-pointer shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Fetching Report...' : 'Refresh Clickio Data'}</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-mono font-bold uppercase">
            <span>Total Earnings</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-display text-emerald-950 mt-1">
            ${summary.totalEarnings.toFixed(2)}
          </div>
          <p className="text-[10px] text-emerald-700 font-mono mt-1">Partner Net Revenue</p>
        </div>

        <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl">
          <div className="flex items-center justify-between text-blue-800 text-xs font-mono font-bold uppercase">
            <span>Avg eCPM</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-display text-blue-950 mt-1">
            ${summary.avgEcpm.toFixed(2)}
          </div>
          <p className="text-[10px] text-blue-700 font-mono mt-1">Effective Cost Per Mille</p>
        </div>

        <div className="bg-purple-50/80 border border-purple-200 p-4 rounded-xl">
          <div className="flex items-center justify-between text-purple-800 text-xs font-mono font-bold uppercase">
            <span>Total Ad Views</span>
            <Eye className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black font-display text-purple-950 mt-1">
            {summary.totalViews.toLocaleString()}
          </div>
          <p className="text-[10px] text-purple-700 font-mono mt-1">Verified Impressions</p>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl">
          <div className="flex items-center justify-between text-amber-800 text-xs font-mono font-bold uppercase">
            <span>Ad Clicks / CTR</span>
            <MousePointer className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-display text-amber-950 mt-1">
            {summary.totalClicks.toLocaleString()} <span className="text-xs font-mono font-bold text-amber-700">({summary.avgCtr}%)</span>
          </div>
          <p className="text-[10px] text-amber-700 font-mono mt-1">Click-Through Rate</p>
        </div>
      </div>

      {/* Ad Format Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-slate-600 text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200 text-left">
              <th className="py-3 px-4">Ad Format</th>
              <th className="py-3 px-4">Impressions</th>
              <th className="py-3 px-4">Clicks</th>
              <th className="py-3 px-4">CTR</th>
              <th className="py-3 px-4">eCPM</th>
              <th className="py-3 px-4">Viewability</th>
              <th className="py-3 px-4 text-right">Partner Gain</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {reportData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-900">{row.ad_format}</td>
                <td className="py-3 px-4 font-mono">{Number(row.view_count || 0).toLocaleString()}</td>
                <td className="py-3 px-4 font-mono">{Number(row.clicks || 0).toLocaleString()}</td>
                <td className="py-3 px-4 font-mono text-blue-600 font-bold">{row.view_ctr}%</td>
                <td className="py-3 px-4 font-mono text-slate-900 font-bold">${Number(row.ecpm || 0).toFixed(2)}</td>
                <td className="py-3 px-4 font-mono">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    {row.viewability}%
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                  ${Number(row.partner_gain || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t pt-3">
        <div className="flex items-center space-x-1">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>Clickio Universal Platform API Connected</span>
        </div>
        <div>
          Last synced: {lastUpdated || 'Just now'}
        </div>
      </div>
    </div>
  );
}
