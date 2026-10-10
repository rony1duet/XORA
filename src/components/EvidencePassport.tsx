/**
 * Evidence Passport Component
 * Displays transparent dataset provenance, resolution, acquisition periods,
 * confidence tier rating, and known sensor or environmental gaps.
 */

import React from 'react';
import { EvidencePassport as EvidencePassportType, MetricProvenance } from '../types/analog';
import { FileBadge, ShieldCheck, AlertCircle, Database, Calendar, Maximize2 } from 'lucide-react';

interface EvidencePassportProps {
  passport: EvidencePassportType;
  provenances?: Record<string, MetricProvenance>;
}

export const EvidencePassport: React.FC<EvidencePassportProps> = ({ passport, provenances }) => {
  return (
    <div className="bg-[#0E1523] border border-slate-800 rounded-lg p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <FileBadge className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white tracking-tight">Evidence Passport</h3>
        </div>

        {/* Confidence Tier */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-cyan-800/60 text-xs font-mono text-cyan-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>{passport.confidenceTier}</span>
        </div>
      </div>

      {/* Grid of Key Provenance Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-cyan-400" />
            <span>Resolution</span>
          </div>
          <div className="font-mono font-semibold text-white text-sm">
            {passport.resolutionMeters} meters / px
          </div>
        </div>

        <div className="p-3 rounded bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>Acquisition</span>
          </div>
          <div className="font-mono font-semibold text-white text-sm">
            {passport.acquisitionPeriod}
          </div>
        </div>

        <div className="p-3 rounded bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>Data Coverage</span>
          </div>
          <div className="font-mono font-semibold text-emerald-400 text-sm">
            {passport.coveragePct.toFixed(1)}% valid
          </div>
        </div>

        <div className="p-3 rounded bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-cyan-400" />
            <span>Analysis Window</span>
          </div>
          <div className="font-mono font-semibold text-white text-sm">
            {passport.analysisWindowKm} × {passport.analysisWindowKm} km
          </div>
        </div>
      </div>

      {/* Dataset Sources */}
      <div className="space-y-1.5 text-xs">
        <div className="font-mono text-slate-400 uppercase text-[11px]">Primary Satellite & Field Sources</div>
        <div className="flex flex-wrap gap-1.5">
          {passport.datasetSources.map((source, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
            >
              {source}
            </span>
          ))}
        </div>
      </div>

      {/* Provenance Tag Key (No pill boxes, clean text) */}
      {provenances && (
        <div className="pt-2 border-t border-slate-800/60 space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase">Metric Derivation Ledger</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(provenances).map(([metricKey, prov]) => (
              <div
                key={metricKey}
                className="p-2 rounded bg-slate-900/40 border border-slate-800 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="font-medium text-slate-200 capitalize">
                    {metricKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                    {prov.source}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    prov.type === 'measured'
                      ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50'
                      : prov.type === 'literature'
                      ? 'text-amber-400 bg-amber-950/40 border border-amber-800/50'
                      : 'text-purple-400 bg-purple-950/40 border border-purple-800/50'
                  }`}
                >
                  {prov.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Known Limitations and Gaps */}
      {passport.knownGaps.length > 0 && (
        <div className="p-3 rounded bg-amber-950/20 border border-amber-900/30 text-xs space-y-1">
          <div className="font-semibold text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Documented Sensor Gaps & Environmental Limitations</span>
          </div>
          <ul className="list-disc list-inside text-slate-300 space-y-0.5">
            {passport.knownGaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
