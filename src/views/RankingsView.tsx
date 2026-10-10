/**
 * XORA Rankings View
 * High-End Aerospace & Planetary Science Proving Ground Leaderboard
 * Features:
 * - Deterministic multi-metric ranking with Monte Carlo stability testing
 * - Executive #1 Top Match candidate spotlight card
 * - Celestial body switcher (Moon/Mars) with active reference selector
 * - Candidate quick-search and filter by name, country, or lithology
 * - Interactive Weight Playground for real-time mission priority tuning
 * - Floating dual-candidate comparison bar
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
import { 
  BarChart3, 
  GitCompare, 
  CheckSquare, 
  Square, 
  Search, 
  Trophy, 
  ArrowRight,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface RankingsViewProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  shortlist: string[];
  onToggleShortlist: (siteId: string) => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({
  onNavigate,
}) => {
  const [selectedBody, setSelectedBody] = useState<CelestialBody>('mars');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>('mars-jezero-crater');
  const [selectedActivity, setSelectedActivity] = useState<MissionActivity>('rover-traverse');
  const [weights, setWeights] = useState<WeightPreset>(
    MISSION_ACTIVITY_WEIGHTS['rover-traverse']
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);

  // Filter available references by active celestial body
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

  // Compute live rankings with Monte Carlo rank stability
  const rankedResults = useMemo(() => {
    return rankCandidatesWithStability(
      EARTH_ANALOG_CANDIDATES,
      activeReference,
      weights,
      42
    );
  }, [activeReference, weights]);

  // Filter candidates by search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return rankedResults;
    const query = searchQuery.toLowerCase();
    return rankedResults.filter(
      (r) =>
        r.site.name.toLowerCase().includes(query) ||
        r.site.country.toLowerCase().includes(query) ||
        r.site.metrics.geologicalClass.toLowerCase().includes(query)
    );
  }, [rankedResults, searchQuery]);

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

  const isMoon = selectedBody === 'moon';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative">
      {/* Top Header & Celestial Mission Bar */}
      <div className="space-y-6 pb-6 border-b border-[#182030]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              <BarChart3 className="w-4 h-4" />
              <span>Multi-Metric Proving Ground Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
              Terrain Twin Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-light max-w-2xl leading-relaxed">
              Deterministic ranking of 12 terrestrial analog test grounds against calibrated NASA LOLA and MOLA orbital laser altimetry baselines.
            </p>
          </div>

          {/* Celestial Body Switcher & Reference Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Moon / Mars Segmented Selector */}
            <div className="inline-flex rounded-full p-1 bg-[#0A0E17] border border-slate-800 shadow-inner">
              <button
                onClick={() => handleBodyChange('moon')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  isMoon
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Moon</span>
              </button>
              <button
                onClick={() => handleBodyChange('mars')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  !isMoon
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Mars</span>
              </button>
            </div>

            {/* Reference Landing Site Dropdown */}
            <div className="relative">
              <select
                value={activeReference.id}
                onChange={(e) => setSelectedReferenceId(e.target.value)}
                className="bg-[#0E1321] border border-slate-800 text-white text-xs rounded-full px-4 py-2 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer shadow-md transition-colors"
              >
                {availableReferences.map((r) => (
                  <option key={r.id} value={r.id}>
                    Target: {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Top Candidate Spotlight Executive Card */}
        {topPick && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0C1222] via-[#0E1528] to-[#0A101C] border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/40 flex items-center justify-center shrink-0 text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.2)]">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/60 font-mono text-[10px] text-cyan-300 font-semibold uppercase">
                    Rank #1 Top Baseline Match
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    For {activeReference.name}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {topPick.site.name} ({topPick.site.country})
                </h3>
                <p className="text-xs text-slate-300 font-light max-w-xl line-clamp-1">
                  {topPick.site.metrics.geologicalClass.replace(/_/g, ' ')} · Best match for {selectedActivity.replace('-', ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Twin Fidelity</div>
                <div className="text-2xl font-black font-mono text-cyan-300">
                  {topPick.overallScore.toFixed(1)}%
                </div>
                <div className="text-[11px] font-mono text-emerald-400">
                  {topPick.rankStabilityPct.toFixed(0)}% Stable
                </div>
              </div>

              <button
                onClick={() =>
                  onNavigate('compare', {
                    ref: activeReference.id,
                    earth: topPick.site.id,
                  })
                }
                className="px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(34,211,238,0.3)] shrink-0"
              >
                <span>Launch Dual Scrubber</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left Weight Playground, Right Rankings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Weight Playground */}
        <div className="lg:col-span-5 space-y-4">
          <WeightPlayground
            weights={weights}
            onWeightsChange={setWeights}
            selectedActivity={selectedActivity}
            onActivitySelect={handleActivitySelect}
            topCandidateName={topPick.site.name}
            rankStabilityPct={topPick.rankStabilityPct}
          />
        </div>

        {/* Right Column: Full Interactive Leaderboard Table */}
        <div className="lg:col-span-7 bg-[#0B0F17]/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl space-y-0">
          {/* Table Header & Search Filter */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0E1424]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Leaderboard: {activeReference.name}</span>
                <span className="text-xs font-mono font-normal text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40">
                  {filteredResults.length} Candidates
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-light mt-0.5">
                Multi-metric correlation sorted by overall topographic score.
              </p>
            </div>

            {/* Candidate Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-full bg-[#121828] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 sm:w-48 transition-colors"
              />
            </div>
          </div>

          {/* Table Rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B101D] text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5 w-10 text-center">Select</th>
                  <th className="p-3.5 w-16 text-center">Rank</th>
                  <th className="p-3.5">Earth Analog Candidate</th>
                  <th className="p-3.5 text-right">Fidelity</th>
                  <th className="p-3.5 text-right">Stability</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredResults.map((result) => {
                  const isChecked = selectedSiteIds.includes(result.site.id);
                  const isTop = result.rank === 1;

                  return (
                    <tr
                      key={result.site.id}
                      className={`hover:bg-[#12192B] transition-colors ${
                        isTop ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      {/* Checkbox for Dual Comparison */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => toggleSelectSite(result.site.id)}
                          className="text-slate-500 hover:text-cyan-400 focus:outline-none cursor-pointer transition-colors"
                          aria-label={`Select ${result.site.name} for comparison`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Rank Badge */}
                      <td className="p-3.5 text-center font-mono font-bold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            isTop
                              ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                              : result.rank <= 3
                              ? 'bg-slate-800 text-cyan-300'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          #{result.rank}
                        </span>
                      </td>

                      {/* Site Name, Country & Classification */}
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span className="hover:text-cyan-300 transition-colors cursor-pointer" onClick={() => onNavigate('sites', { id: result.site.id })}>
                            {result.site.name}
                          </span>
                          {isTop && (
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/60 font-semibold">
                              TOP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {result.site.country} · {result.site.metrics.geologicalClass.replace(/_/g, ' ')}
                        </div>
                      </td>

                      {/* Overall Twin Score & Visual Meter */}
                      <td className="p-3.5 text-right font-mono">
                        <div className="font-bold text-sm text-cyan-300">
                          {result.overallScore.toFixed(1)}%
                        </div>
                        <div className="w-16 h-1 rounded-full bg-slate-800 ml-auto mt-1 overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${result.overallScore}%` }}
                          />
                        </div>
                      </td>

                      {/* Monte Carlo Stability Indicator */}
                      <td className="p-3.5 text-right font-mono text-xs">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            result.rankStabilityPct > 70
                              ? 'text-emerald-400'
                              : result.rankStabilityPct > 35
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            result.rankStabilityPct > 70 ? 'bg-emerald-400' : result.rankStabilityPct > 35 ? 'bg-amber-400' : 'bg-slate-500'
                          }`} />
                          <span>{result.rankStabilityPct.toFixed(0)}%</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              onNavigate('compare', {
                                ref: activeReference.id,
                                earth: result.site.id,
                              })
                            }
                            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 text-slate-200 border border-slate-700/60 font-semibold text-[11px] transition-all cursor-pointer"
                          >
                            Compare
                          </button>
                          <button
                            onClick={() =>
                              onNavigate('sites', { id: result.site.id })
                            }
                            className="px-2.5 py-1 rounded-full bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] transition-colors cursor-pointer"
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

      {/* Floating Dual Comparison Bottom Drawer */}
      {selectedSiteIds.length === 2 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-[#0E1424]/95 border border-cyan-500/50 rounded-full px-6 py-3 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-semibold">2 Sites Selected for Comparison</span>
          </div>

          <button
            onClick={() =>
              onNavigate('compare', {
                ref: activeReference.id,
                earth: selectedSiteIds[0],
              })
            }
            className="px-4 py-1.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Launch Dual Scrubber</span>
          </button>

          <button
            onClick={() => setSelectedSiteIds([])}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
