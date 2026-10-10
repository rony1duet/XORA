/**
 * Mission Rehearsal Cards Component
 * Catalogs concrete space mission rehearsals supported by the site,
 * tagged with empirical validity ('supported by data' vs 'inferred').
 */

import React from 'react';
import { MissionRehearsalCard } from '../types/analog';
import { Target, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

interface MissionRehearsalCardsProps {
  cards: MissionRehearsalCard[];
}

export const MissionRehearsalCards: React.FC<MissionRehearsalCardsProps> = ({ cards }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Mission Rehearsal Operations</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {cards.length} protocols evaluated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {cards.map((card, i) => {
          const isSupported = card.status === 'supported by data';

          return (
            <div
              key={i}
              className="bg-[#0E1523] border border-slate-800 rounded-lg p-4 space-y-3 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Header tag */}
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-mono uppercase text-slate-400">
                    {card.activity.replace(/-/g, ' ')}
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                      isSupported
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                    }`}
                  >
                    {isSupported ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <HelpCircle className="w-3 h-3" />
                    )}
                    <span>{card.status}</span>
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-semibold text-white">{card.title}</h4>

                {/* Physical Reasoning */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {card.reasoning}
                </p>
              </div>

              {/* Recommended Field Protocol */}
              <div className="pt-3 border-t border-slate-800/80 text-xs space-y-1">
                <div className="text-[11px] font-mono text-cyan-400 font-medium flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  <span>Field Execution Protocol</span>
                </div>
                <div className="text-slate-400 leading-normal pl-4">
                  {card.recommendedProtocol}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
