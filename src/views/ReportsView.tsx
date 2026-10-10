/**
 * Reports View
 * Generates an executive terrain twin assessment report with printable view,
 * browser print-to-PDF trigger, and CSV data export.
 */

import React, { useState } from 'react';
import { EARTH_ANALOG_CANDIDATES } from '../data/earthAnalogs';
import { PLANETARY_REFERENCES } from '../data/planetaryReferences';
import { MISSION_ACTIVITY_WEIGHTS, calculateSiteSimilarity } from '../services/similarityEngine';
import { FileText, Printer, Download, Check, Sparkles } from 'lucide-react';

interface ReportsViewProps {
  shortlist: string[];
  onNavigate: (route: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ shortlist, onNavigate }) => {
  const [selectedEarthId, setSelectedEarthId] = useState<string>(
    shortlist[0] || 'atacama-yungay'
  );
  const [selectedRefId, setSelectedRefId] = useState<string>('mars-jezero-crater');

  const site =
    EARTH_ANALOG_CANDIDATES.find((s) => s.id === selectedEarthId) ||
    EARTH_ANALOG_CANDIDATES[0];
  const reference =
    PLANETARY_REFERENCES.find((r) => r.id === selectedRefId) ||
    PLANETARY_REFERENCES[0];

  const similarity = calculateSiteSimilarity(
    site,
    reference,
    MISSION_ACTIVITY_WEIGHTS['rover-traverse']
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'Site ID',
      'Site Name',
      'Country',
      'Target Body',
      'Reference Site',
      'Similarity Score',
      'Relief (m)',
      'Slope Mean (deg)',
      'Roughness (m RMS)',
      'Boulder Density (/km2)',
      'Confidence Tier',
    ];

    const row = [
      site.id,
      `"${site.name}"`,
      `"${site.country}"`,
      reference.body,
      `"${reference.name}"`,
      similarity.overallScore.toFixed(1),
      site.metrics.elevationReliefM,
      site.metrics.slopeMeanDeg,
      site.metrics.roughnessRmsM,
      site.metrics.boulderCraterDensityPerKm2,
      `"${site.evidencePassport.confidenceTier}"`,
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `xora-${site.id}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Executive Evaluation Report
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exportable scientific dossier ready for PDF printing or CSV data pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-900 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print to PDF</span>
          </button>
        </div>
      </div>

      {/* Selectors in non-print mode */}
      <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-[#0E1523] border border-slate-800 print:hidden text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono uppercase">Select Candidate:</span>
          <select
            value={site.id}
            onChange={(e) => setSelectedEarthId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white rounded px-2.5 py-1"
          >
            {EARTH_ANALOG_CANDIDATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.country})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono uppercase">Evaluate Against:</span>
          <select
            value={reference.id}
            onChange={(e) => setSelectedRefId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-cyan-300 rounded px-2.5 py-1"
          >
            {PLANETARY_REFERENCES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.body})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-[#0B0F19] text-[#F2F5FA] border border-slate-800 rounded-xl p-8 sm:p-10 space-y-8 print:border-none print:p-0 print:bg-white print:text-black">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              XORA · Planetary Proving Ground Evaluation Report
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              {site.name} vs {reference.name}
            </h2>
            <div className="text-xs text-slate-400 font-mono mt-1">
              Coordinates: {site.coordinates.lat.toFixed(4)}°N, {site.coordinates.lng.toFixed(4)}°E · {site.country}
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-2xl font-bold text-cyan-300">
              {similarity.overallScore.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 uppercase">
              Twin Similarity Score
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase text-slate-400">Executive Summary</h3>
          <p className="text-xs leading-relaxed text-slate-300">
            {site.name} was evaluated against {reference.name} ({reference.body === 'moon' ? 'Moon' : 'Mars'}) across 6 quantitative terrain dimensions. The site achieves an overall score of {similarity.overallScore.toFixed(1)}% under rover traverse weighting with {similarity.dataCoveragePct}% verified data coverage.
          </p>
        </div>

        {/* Dimensional Breakdown Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase text-slate-400">Quantitative Feature Ledger</h3>
          <table className="w-full text-xs text-left border border-slate-800">
            <thead className="bg-slate-900 text-slate-400 font-mono">
              <tr>
                <th className="p-2">Terrain Dimension</th>
                <th className="p-2">Earth Candidate</th>
                <th className="p-2">Planetary Reference</th>
                <th className="p-2">Similarity (sᵢ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {Object.entries(similarity.featureScores).map(([k, f]) => (
                <tr key={k}>
                  <td className="p-2 font-medium capitalize text-white">{k}</td>
                  <td className="p-2 font-mono">{f.earthValue}</td>
                  <td className="p-2 font-mono">{f.refValue}</td>
                  <td className="p-2 font-mono text-cyan-400 font-semibold">
                    {(f.similarity * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Evidence Passport Box */}
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
          <div className="font-semibold text-white">Evidence Passport & Provenance</div>
          <div className="text-slate-400 font-mono text-[11px] space-y-1">
            <div>Confidence Tier: <span className="text-cyan-300">{site.evidencePassport.confidenceTier}</span></div>
            <div>Dataset Sources: {site.evidencePassport.datasetSources.join(', ')}</div>
            <div>Resolution: {site.evidencePassport.resolutionMeters}m · Footprint: 25 km × 25 km</div>
          </div>
        </div>

        {/* Handicap Summary */}
        <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/40 space-y-2 text-xs">
          <div className="font-semibold text-amber-400">The Handicap Ledger (Mandatory Limitations)</div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Gravity divergence ({site.country} 9.81 m/s² vs {reference.body === 'moon' ? '1.62 m/s²' : '3.71 m/s²'}), atmospheric air presence, and surface moisture mean wheel sinkage and soil mechanics require gravity-offloading rigs. Geomorphology and obstacle sensor detection are fully valid.
          </p>
        </div>
      </div>
    </div>
  );
};
