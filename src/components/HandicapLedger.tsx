/**
 * The Handicap Ledger Component
 * Itemizes fundamental planetary physics divergences between Earth and the target body,
 * citing peer-reviewed sources and detailing valid vs invalid mission testing scopes.
 */

import React, { useState } from 'react';
import { HandicapItem, CelestialBody } from '../types/analog';
import { ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface HandicapLedgerProps {
  body: CelestialBody;
  referenceName: string;
  items: HandicapItem[];
  compact?: boolean;
}

export const HandicapLedger: React.FC<HandicapLedgerProps> = ({
  body,
  referenceName,
  items,
  compact = false,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(compact ? null : 0);

  const bodyLabel = body === 'moon' ? 'Moon' : 'Mars';
  const bodyColor = body === 'moon' ? 'text-cyan-400' : 'text-amber-400';

  return (
    <div className="bg-[#0E1523] border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-base font-semibold text-white tracking-tight">
              The Handicap Ledger
            </h3>
          </div>
          <div className="text-xs text-slate-400">
            Physical divergence from {referenceName} ({bodyLabel})
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          Earth can mimic geomorphology and slope kinematics, but cannot replicate fundamental space environments.
          Every terrestrial rehearsal must respect these operational boundaries.
        </p>
      </div>

      {/* Ledger Items */}
      <div className="divide-y divide-slate-800/80">
        {items.map((item, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div key={item.factor} className="p-4 sm:p-5 hover:bg-slate-800/20 transition-colors">
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="cursor-pointer flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <span>{item.factor}</span>
                    <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                      {item.divergence}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Earth: <span className="text-slate-300 font-semibold">{item.earthValue}</span> vs{' '}
                    {bodyLabel}: <span className={`${bodyColor} font-semibold`}>{item.planetaryValue}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label={isExpanded ? 'Collapse factor details' : 'Expand factor details'}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Collapsible / Expanded Deep Dive */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Valid scope */}
                  <div className="space-y-1.5 p-3 rounded bg-emerald-950/20 border border-emerald-900/40">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Valid Test Activities On Earth</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{item.validTestingScope}</p>
                  </div>

                  {/* Invalid scope / Compensation required */}
                  <div className="space-y-1.5 p-3 rounded bg-rose-950/20 border border-rose-900/40">
                    <div className="font-semibold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Invalid Testing Scope (Requires Offloading/Vacuum)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{item.invalidTestingScope}</p>
                  </div>

                  {/* Citation */}
                  <div className="md:col-span-2 text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-1">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Citation: {item.citation}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
