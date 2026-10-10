/**
 * XORA Compare View
 * Split-World Scrubber comparing Earth and planetary reference,
 * accompanied by multi-dimensional similarity breakdowns and the Handicap Ledger.
 */

import React, { useState, useMemo } from 'react';
import { PLANETARY_REFERENCES } from '../data/planetaryReferences';
import { EARTH_ANALOG_CANDIDATES } from '../data/earthAnalogs';
import { MISSION_ACTIVITY_WEIGHTS, calculateSiteSimilarity } from '../services/similarityEngine';
import { SplitWorldScrubber } from '../components/SplitWorldScrubber';
import { HandicapLedger } from '../components/HandicapLedger';
import { SimilarityFingerprint } from '../components/SimilarityFingerprint';
import { MissionActivity } from '../types/analog';
import { ArrowLeft } from 'lucide-react';

interface CompareViewProps {
  initialRefId?: string;
  initialEarthId?: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  initialRefId = 'mars-jezero-crater',
  initialEarthId = 'atacama-yungay',
  onNavigate,
}) => {
  const [selectedRefId, setSelectedRefId] = useState<string>(initialRefId);
  const [selectedEarthId, setSelectedEarthId] = useState<string>(initialEarthId);
  const [selectedActivity, setSelectedActivity] = useState<MissionActivity>('rover-traverse');

  const reference = useMemo(() => {
    return PLANETARY_REFERENCES.find((r) => r.id === selectedRefId) || PLANETARY_REFERENCES[0];
  }, [selectedRefId]);

  const earth = useMemo(() => {
    return EARTH_ANALOG_CANDIDATES.find((e) => e.id === selectedEarthId) || EARTH_ANALOG_CANDIDATES[0];
  }, [selectedEarthId]);

  // Compute similarity
  const similarity = useMemo(() => {
    const weights = MISSION_ACTIVITY_WEIGHTS[selectedActivity];
    return calculateSiteSimilarity(earth, reference, weights);
  }, [earth, reference, selectedActivity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Navigation & Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2737]">
        <button
          onClick={() => onNavigate('explore')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Explorer</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {/* Planetary Target Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400">Target:</span>
            <select
              value={selectedRefId}
              onChange={(e) => setSelectedRefId(e.target.value)}
              className="bg-[#121624] border border-[#1F2737] text-cyan-300 text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {PLANETARY_REFERENCES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.body === 'moon' ? 'Moon' : 'Mars'})
                </option>
              ))}
            </select>
          </div>

          {/* Earth Candidate Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400">Earth Twin:</span>
            <select
              value={selectedEarthId}
              onChange={(e) => setSelectedEarthId(e.target.value)}
              className="bg-[#121624] border border-[#1F2737] text-emerald-300 text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {EARTH_ANALOG_CANDIDATES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.country})
                </option>
              ))}
            </select>
          </div>

          {/* Activity Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400">Activity:</span>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value as MissionActivity)}
              className="bg-[#121624] border border-[#1F2737] text-slate-200 text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="rover-traverse">Rover Traverse</option>
              <option value="landing-hazard">Landing Hazard</option>
              <option value="habitat-siting">Habitat Siting</option>
              <option value="lava-tube">Lava-Tube Exploration</option>
              <option value="polar-ice">Polar-Ice Operations</option>
              <option value="excavation-isru">Excavation and ISRU</option>
              <option value="navigation-localization">Optical Navigation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Feature: Split-World Scrubber */}
      <SplitWorldScrubber reference={reference} earth={earth} />

      {/* Comparison Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Similarity Score Breakdown & Radial Glyph */}
        <div className="lg:col-span-5 bg-[#0F121C] border border-[#1F2737] rounded-xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2737]">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400">Quantitative Similarity</span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Twin Score: {similarity.overallScore.toFixed(1)}%
              </h3>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-[#161B26] border border-[#252F42] font-mono text-xs text-cyan-300">
              {similarity.dataCoveragePct}% verified data
            </div>
          </div>

          {/* Radial Glyph */}
          <SimilarityFingerprint
            featureScores={similarity.featureScores}
            overallScore={similarity.overallScore}
            size={240}
          />

          {/* Detailed Metric Diff Table */}
          <div className="space-y-2 pt-2 border-t border-[#1F2737]">
            <div className="text-xs font-mono text-slate-400 uppercase">
              Measured Feature Comparison
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#1F2737] rounded-lg overflow-hidden">
                <thead className="bg-[#121624] text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="p-2.5">Feature</th>
                    <th className="p-2.5">Earth</th>
                    <th className="p-2.5">Target</th>
                    <th className="p-2.5">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2737] text-slate-300">
                  {Object.entries(similarity.featureScores).map(([k, f]) => (
                    <tr key={k} className="hover:bg-[#161B26] transition-colors">
                      <td className="p-2.5 font-medium capitalize text-slate-200">{k}</td>
                      <td className="p-2.5 font-mono text-slate-400">{f.earthValue}</td>
                      <td className="p-2.5 font-mono text-slate-400">{f.refValue}</td>
                      <td className="p-2.5 font-mono text-cyan-400 font-semibold">
                        {(f.similarity * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: The Handicap Ledger (Mandatory Scientific Panel) */}
        <div className="lg:col-span-7 space-y-4">
          <HandicapLedger
            body={reference.body}
            referenceName={reference.name}
            items={reference.handicapLedger}
          />

          {/* Action to view complete site passport */}
          <div className="p-4 bg-[#0F121C] border border-[#1F2737] rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400 font-light">
              Full dataset citations and rehearsal operation cards for {earth.name}.
            </span>
            <button
              onClick={() => onNavigate('sites', { id: earth.id })}
              className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              View Site Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
