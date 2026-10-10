/**
 * Rankings View
 * Full candidate ranking leaderboard with interactive Weight Playground,
 * animated rank shifts, Monte Carlo stability reporting, and multi-select compare.
 */

import React, { useState, useMemo } from 'react';
import { PLANETARY_REFERENCES } from '../data/planetaryReferences';
import { EARTH_ANALOG_CANDIDATES } from '../data/earthAnalogs';
import {
  MISSION_ACTIVITY_WEIGHTS,
  rankCandidatesWithStability,
} from '../services/similarityEngine';
import { WeightPlayground } from '../components/WeightPlayground';
import { CelestialBody, MissionActivity, WeightPreset } from '../types/analog';
import { BarChart3, GitCompare, Bookmark, CheckSquare, Square, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface RankingsViewProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  shortlist: string[];
  onToggleShortlist: (siteId: string) => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({
  onNavigate,
  shortlist,
  onToggleShortlist,
}) => {
  const [selectedBody, setSelectedBody] = useState<CelestialBody>('mars');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>('mars-jezero-crater');
  const [selectedActivity, setSelectedActivity] = useState<MissionActivity>('rover-traverse');
  const [weights, setWeights] = useState<WeightPreset>(
    MISSION_ACTIVITY_WEIGHTS['rover-traverse']
  );
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);

  // Available references
  const availableReferences = useMemo(
    () => PLANETARY_REFERENCES.filter((r) => r.body === selectedBody),
    [selectedBody]
  );

  const activeReference = useMemo(() => {
    return (
      availableReferences.find((r) => r.id === selectedReferenceId) ||
      availableReferences[0] ||
      PLANETARY_REFERENCES[0]
    );
  }, [availableReferences, selectedReferenceId]);

  // Compute live ranking with Monte Carlo stability
  const rankedResults = useMemo(() => {
    return rankCandidatesWithStability(
      EARTH_ANALOG_CANDIDATES,
      activeReference,
      weights,
      42
    );
  }, [activeReference, weights]);

  const topPick = rankedResults[0];

  const handleBodyChange = (body: CelestialBody) => {
    setSelectedBody(body);
    const newRefs = PLANETARY_REFERENCES.filter((r) => r.body === body);
    if (newRefs.length > 0) {
      setSelectedReferenceId(newRefs[0].id);
    }
  };

  const handleActivitySelect = (act: MissionActivity) => {
    setSelectedActivity(act);
    setWeights(MISSION_ACTIVITY_WEIGHTS[act]);
  };

  const toggleSelectSite = (siteId: string) => {
    if (selectedSiteIds.includes(siteId)) {
      setSelectedSiteIds(selectedSiteIds.filter((id) => id !== siteId));
    } else {
      if (selectedSiteIds.length >= 2) {
        setSelectedSiteIds([selectedSiteIds[1], siteId]);
      } else {
        setSelectedSiteIds([...selectedSiteIds, siteId]);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Target Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Terrain Twin Leaderboard
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic multi-metric similarity scores evaluated over {EARTH_ANALOG_CANDIDATES.length} terrestrial candidates.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Target Body */}
          <div className="inline-flex rounded p-1 bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => handleBodyChange('moon')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedBody === 'moon'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Moon
            </button>
            <button
              onClick={() => handleBodyChange('mars')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedBody === 'mars'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mars
            </button>
          </div>

          {/* Reference Site */}
          <select
            value={activeReference.id}
            onChange={(e) => setSelectedReferenceId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white text-xs rounded px-3 py-1.5 font-medium focus:outline-none"
          >
            {availableReferences.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Multi-Select Compare Button */}
          {selectedSiteIds.length === 2 && (
            <button
              onClick={() =>
                onNavigate('compare', {
                  ref: activeReference.id,
                  earth: selectedSiteIds[0],
                })
              }
              className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Selected 2 Sites</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Weight Playground, Right Rankings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Weight Playground */}
        <div className="lg:col-span-5">
          <WeightPlayground
            weights={weights}
            onWeightsChange={setWeights}
            selectedActivity={selectedActivity}
            onActivitySelect={handleActivitySelect}
            topCandidateName={topPick.site.name}
            rankStabilityPct={topPick.rankStabilityPct}
          />
        </div>

        {/* Right Column: Full Leaderboard Table */}
        <div className="lg:col-span-7 bg-[#0E1523] border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Rankings for {activeReference.name}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              12 evaluated · {weights.slope + weights.roughness + weights.relief + weights.hazards + weights.lithology + weights.environmental}% total weight
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3 w-10">Select</th>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Earth Candidate</th>
                  <th className="p-3 text-right">Twin Score</th>
                  <th className="p-3 text-right">Stability</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {rankedResults.map((result) => {
                  const isChecked = selectedSiteIds.includes(result.site.id);
                  const isTop = result.rank === 1;

                  return (
                    <tr
                      key={result.site.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isTop ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3">
                        <button
                          onClick={() => toggleSelectSite(result.site.id)}
                          className="text-slate-500 hover:text-cyan-400 focus:outline-none"
                          aria-label={`Select ${result.site.name} for comparison`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Rank */}
                      <td className="p-3 font-mono font-bold text-slate-200">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                            isTop
                              ? 'bg-cyan-400 text-slate-900'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          #{result.rank}
                        </span>
                      </td>

                      {/* Site Name & Country */}
                      <td className="p-3">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{result.site.name}</span>
                          {isTop && (
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-1 rounded border border-cyan-800/50">
                              TOP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {result.site.country} · {result.site.metrics.geologicalClass.replace(/_/g, ' ')}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="p-3 text-right font-mono font-bold text-sm text-cyan-300">
                        {result.overallScore.toFixed(1)}%
                      </td>

                      {/* Stability */}
                      <td className="p-3 text-right font-mono text-xs">
                        <span
                          className={`${
                            result.rankStabilityPct > 70
                              ? 'text-emerald-400'
                              : result.rankStabilityPct > 30
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {result.rankStabilityPct.toFixed(0)}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              onNavigate('compare', {
                                ref: activeReference.id,
                                earth: result.site.id,
                              })
                            }
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] transition-colors cursor-pointer"
                          >
                            Compare
                          </button>
                          <button
                            onClick={() =>
                              onNavigate('sites', { id: result.site.id })
                            }
                            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] transition-colors cursor-pointer"
                          >
                            Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
