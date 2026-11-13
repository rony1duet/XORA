/**
 * XORA Compare View
 * High-End Aerospace & Planetary Science Terrain Comparator
 * Features:
 * - Quick-load calibrated signature twin pairs (Jezero, Shackleton, Tranquillitatis)
 * - Sleek custom target, Earth twin, and activity selectors
 * - Precision Split-World Scrubber with live coordinate & source citations
 * - Quantitative metric cards with visual progress meters and delta indicators
 * - Multi-dimensional Similarity Fingerprint glyph
 * - Comprehensive Handicap Ledger documenting physical environment boundaries
 */

import React, { useState, useMemo, useEffect } from 'react';
import { PLANETARY_REFERENCES } from '../data/planetaryReferences';
import { EARTH_ANALOG_CANDIDATES } from '../data/earthAnalogs';
import { MISSION_ACTIVITY_WEIGHTS, calculateSiteSimilarity } from '../services/similarityEngine';
import { searchAnalogsRemote, ApiSearchResultItem, TARGET_KEY_MAP } from '../services/analogApiService';
import { SplitWorldScrubber } from '../components/SplitWorldScrubber';
import { LiveVisualComparator } from '../components/LiveVisualComparator';
import { HandicapLedger } from '../components/HandicapLedger';
import { SimilarityFingerprint } from '../components/SimilarityFingerprint';
import { EarthCandidateSite, PlanetaryReferenceSite, MissionActivity } from '../types/analog';
import { 
  ArrowLeft, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
  Brain,
  AlertTriangle,
  Check,
  ShieldAlert
} from 'lucide-react';
import { Shimmer, ShimmerMetricCard } from '../components/Shimmer';

interface CompareViewProps {
  initialRefId?: string;
  initialEarthId?: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
  sites?: EarthCandidateSite[];
  references?: PlanetaryReferenceSite[];
}

// Preset signature proving ground baselines
const SIGNATURE_PAIRS = [
  {
    name: 'Jezero Delta ↔ Atacama',
    refId: 'mars-jezero-crater',
    earthId: 'atacama-yungay',
    activity: 'rover-traverse' as MissionActivity,
    badge: 'Mars · 88.1%'
  },
  {
    name: 'Shackleton Rim ↔ Haughton',
    refId: 'lunar-shackleton-rim',
    earthId: 'haughton-crater',
    activity: 'rover-traverse' as MissionActivity,
    badge: 'Moon · 86.4%'
  },
  {
    name: 'Tranquillitatis ↔ Lanzarote',
    refId: 'lunar-tranquillitatis-pit',
    earthId: 'lanzarote-tubes',
    activity: 'lava-tube' as MissionActivity,
    badge: 'Moon · 83.5%'
  },
  {
    name: 'Gale Mt Sharp ↔ Death Valley',
    refId: 'mars-gale-crater',
    earthId: 'death-valley',
    activity: 'rover-traverse' as MissionActivity,
    badge: 'Mars · 81.2%'
  }
];

export const CompareView: React.FC<CompareViewProps> = ({
  initialRefId = 'mars-jezero-crater',
  initialEarthId = 'atacama-yungay',
  onNavigate,
  sites = EARTH_ANALOG_CANDIDATES,
  references = PLANETARY_REFERENCES,
}) => {
  const [selectedRefId, setSelectedRefId] = useState<string>(initialRefId);
  const [selectedEarthId, setSelectedEarthId] = useState<string>(initialEarthId);
  const [selectedActivity, setSelectedActivity] = useState<MissionActivity>('rover-traverse');
  const [remoteInsight, setRemoteInsight] = useState<ApiSearchResultItem | null>(null);
  const [isLoadingRemote, setIsLoadingRemote] = useState<boolean>(false);

  const moonSites = useMemo(() => sites.filter((e) => e.primaryAnalogs.includes('moon')), [sites]);
  const marsSites = useMemo(() => sites.filter((e) => e.primaryAnalogs.includes('mars')), [sites]);

  const reference = useMemo(() => {
    return references.find((r) => r.id === selectedRefId) || references[0] || PLANETARY_REFERENCES[0];
  }, [references, selectedRefId]);

  const earth = useMemo(() => {
    return sites.find((e) => e.id === selectedEarthId) || sites[0] || EARTH_ANALOG_CANDIDATES[0];
  }, [sites, selectedEarthId]);

  // Fetch ML remote prediction and scientific breakdown from teammate's live API
  useEffect(() => {
    let isCancelled = false;
    const fetchInsight = async () => {
      setIsLoadingRemote(true);
      try {
        const apiTargetKey = TARGET_KEY_MAP[reference.id] || reference.id;
        const results = await searchAnalogsRemote({
          targetKey: apiTargetKey,
          top: 50,
        });
        if (!isCancelled && results.length > 0) {
          const matched = results.find(
            (r) =>
              r.site.key === earth.id ||
              r.site.name.toLowerCase() === earth.name.toLowerCase() ||
              earth.name.toLowerCase().includes(r.site.name.toLowerCase())
          );
          setRemoteInsight(matched || results[0]);
        }
      } catch (_) {
        // Fallback to client-side mathematical scoring
      } finally {
        if (!isCancelled) setIsLoadingRemote(false);
      }
    };

    fetchInsight();
    return () => {
      isCancelled = true;
    };
  }, [reference.id, earth.id]);

  // Compute live multi-metric similarity
  const similarity = useMemo(() => {
    const weights = MISSION_ACTIVITY_WEIGHTS[selectedActivity];
    return calculateSiteSimilarity(earth, reference, weights);
  }, [earth, reference, selectedActivity]);

  const isMoon = reference.body === 'moon';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Navigation & Mission Control Header */}
      <div className="space-y-4 pb-6 border-b border-[#182030]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={() => onNavigate('explore')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer mb-1 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Explorer</span>
            </button>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase font-semibold ${
                isMoon 
                  ? 'bg-cyan-950/80 border border-cyan-800/60 text-cyan-300' 
                  : 'bg-amber-950/80 border border-amber-800/60 text-amber-300'
              }`}>
                {isMoon ? 'Moon Exploration Target' : 'Mars Exploration Target'}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Planetary Proving Ground Studio: Earth vs. {isMoon ? 'Moon' : 'Mars'}
              </h1>
            </div>
            <p className="text-xs text-slate-300 font-light max-w-2xl leading-relaxed">
              Earth is humanity's most accessible laboratory. Here, mission teams test rover wheels, robotic drills, and navigation cameras across terrestrial terrains that mirror the Moon's cratered poles and Mars's ancient dry river deltas.
            </p>
          </div>

          {/* Quick Match Score Badge */}
          <div className="p-3.5 rounded-xl bg-[#0B0F17]/90 border border-slate-800/80 flex items-center gap-4 shrink-0 shadow-lg">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Twin Fidelity Index
              </div>
              <div className="text-2xl font-black font-mono text-cyan-300 flex items-baseline gap-1">
                <span>{similarity.overallScore.toFixed(1)}</span>
                <span className="text-xs font-normal text-slate-400">%</span>
              </div>
            </div>
            <div className="border-l border-slate-800 pl-4 space-y-0.5 text-[11px] font-mono">
              <div className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{similarity.dataCoveragePct}% verified data</span>
              </div>
              <div className="text-slate-400">
                10m spatial resolution
              </div>
            </div>
          </div>
        </div>

        {/* Quick Baseline Signature Pair Switchers */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none text-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Calibrated Baselines:</span>
          </span>
          {SIGNATURE_PAIRS.map((pair) => {
            const isActive = selectedRefId === pair.refId && selectedEarthId === pair.earthId;
            return (
              <button
                key={pair.name}
                onClick={() => {
                  setSelectedRefId(pair.refId);
                  setSelectedEarthId(pair.earthId);
                  setSelectedActivity(pair.activity);
                }}
                className={`px-3 py-1.5 rounded-full font-sans text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : 'bg-[#0E131F]/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{pair.name}</span>
                <span className="text-[10px] font-mono opacity-80">{pair.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Customized Control Bar: Target Body, Earth Twin, Activity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Target Reference Selector */}
          <div className="p-3 rounded-xl bg-[#0B0F17]/90 border border-slate-800/80 space-y-1.5">
            <label className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center justify-between">
              <span>1. Planetary Target</span>
              <span className="text-slate-400 font-normal">NASA LOLA / MOLA</span>
            </label>
            <select
              value={selectedRefId}
              onChange={(e) => {
                const newRefId = e.target.value;
                setSelectedRefId(newRefId);
                const newRef = references.find((r) => r.id === newRefId);
                if (newRef && !earth.primaryAnalogs.includes(newRef.body)) {
                  const matching = sites.find((s) => s.primaryAnalogs.includes(newRef.body));
                  if (matching) setSelectedEarthId(matching.id);
                }
              }}
              className="w-full bg-[#121624] border border-[#1F2737] text-white text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer transition-colors"
            >
              <optgroup label="🌕 Moon Exploration Targets">
                {references
                  .filter((r) => r.body === 'moon')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.keyTargetFeature})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="🔴 Mars Exploration Targets">
                {references
                  .filter((r) => r.body === 'mars')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.keyTargetFeature})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Earth Candidate Selector */}
          <div className="p-3 rounded-xl bg-[#0B0F17]/90 border border-slate-800/80 space-y-1.5">
            <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span>2. Earth Analog Twin</span>
              <span className="text-slate-400 font-normal">{sites.length} Global Analogs</span>
            </label>
            <select
              value={selectedEarthId}
              onChange={(e) => setSelectedEarthId(e.target.value)}
              className="w-full bg-[#121624] border border-[#1F2737] text-white text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
            >
              <optgroup label={`🌕 Moon Analogs (${moonSites.length})`}>
                {moonSites.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.country})
                  </option>
                ))}
              </optgroup>
              <optgroup label={`🔴 Mars Analogs (${marsSites.length})`}>
                {marsSites.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.country})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Mission Activity Weight Selector */}
          <div className="p-3 rounded-xl bg-[#0B0F17]/90 border border-slate-800/80 space-y-1.5">
            <label className="text-[11px] font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>3. Rehearsal Objective</span>
              <span className="text-slate-400 font-normal">Weight Preset</span>
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value as MissionActivity)}
              className="w-full bg-[#121624] border border-[#1F2737] text-white text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-amber-500 cursor-pointer transition-colors"
            >
              <option value="rover-traverse">Rover Traverse &amp; Traction</option>
              <option value="landing-hazard">Landing Hazard Detection</option>
              <option value="habitat-siting">Habitat Siting &amp; Foundation</option>
              <option value="lava-tube">Lava-Tube / Skylight Descent</option>
              <option value="polar-ice">Polar-Ice Operations &amp; Volatiles</option>
              <option value="excavation-isru">Regolith Excavation &amp; ISRU</option>
              <option value="navigation-localization">Optical Navigation &amp; Terrain SLAM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Feature: Live Multi-Mode Visual Comparator Studio */}
      <section className="space-y-3">
        <LiveVisualComparator
          selectedEarthSite={earth}
          activeTarget={reference}
          allTargets={references}
          onSelectTarget={(newRef) => setSelectedRefId(newRef.id)}
          isModal={false}
          isOpen={true}
        />
      </section>

      {/* Quantitative Analysis & Fingerprint Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Radial Similarity Fingerprint & Measurement Scores */}
        <div className="lg:col-span-5 bg-[#0B0F17]/90 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
                Scientific Comparison Profile
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                Terrain &amp; Environmental Blueprint
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded-md bg-[#121624] border border-slate-800">
              6 Measured Vectors
            </span>
          </div>

          {/* Radial Glyph */}
          <div className="flex justify-center py-2">
            <SimilarityFingerprint
              featureScores={similarity.featureScores}
              overallScore={similarity.overallScore}
              size={240}
            />
          </div>

          {/* Measured Feature Progress Breakdown */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Metric Correlation</span>
              <span>Earth vs Target</span>
            </div>

            <div className="space-y-2.5">
              {Object.entries(similarity.featureScores).map(([key, f]) => {
                const pct = Math.round(f.similarity * 100);
                const isHigh = pct >= 85;
                const isMed = pct >= 70;

                return (
                  <div key={key} className="p-2.5 rounded-xl bg-[#101524]/60 border border-slate-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200 capitalize">
                        {key === 'relief' ? 'Elevation Relief' :
                         key === 'slope' ? 'Slope Gradient CDF' :
                         key === 'roughness' ? '10m RMS Roughness' :
                         key === 'hazards' ? 'Hazard Density' :
                         key === 'lithology' ? 'Rock Substrate' : 'Environment'}
                      </span>
                      <span className={`font-mono text-xs font-bold ${
                        isHigh ? 'text-emerald-400' : isMed ? 'text-cyan-400' : 'text-amber-400'
                      }`}>
                        {pct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHigh ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                          isMed ? 'bg-gradient-to-r from-cyan-500 to-sky-400' :
                          'bg-gradient-to-r from-amber-500 to-orange-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                      <span>{earth.name}: <strong className="text-slate-300">{f.earthValue}</strong></span>
                      <span>Target: <strong className="text-slate-300">{f.refValue}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Physical Constraints & Site Passport Link */}
        <div className="lg:col-span-7 space-y-6">
          {/* Teammate ML Model Live Evaluation Card */}
          <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Brain className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Why This Place Feels Like {reference.body === 'moon' ? 'the Moon' : 'Mars'}
                  </h3>
                  <div className="text-[10px] font-mono text-cyan-400">
                    Scientific Analysis: Geology, Surface Chemistry &amp; Mission Value
                  </div>
                </div>
              </div>

              {isLoadingRemote ? (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Querying Model...</span>
                </div>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-300 font-mono text-xs font-bold">
                  {remoteInsight ? `${remoteInsight.score}% Match` : `${Math.round(similarity.overallScore)}% Match`}
                </span>
              )}
            </div>

            {remoteInsight ? (
              <div className="space-y-4 text-xs">
                {/* Why Analog */}
                <div className="p-3.5 rounded-xl bg-[#0F1626] border border-cyan-500/20 space-y-1">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Why This Location is an Analog:</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {remoteInsight.why_analog || earth.geologicalContext}
                  </p>
                </div>

                {/* Where the Analogy Breaks Down */}
                <div className="p-3.5 rounded-xl bg-[#1A1215] border border-rose-900/40 space-y-1">
                  <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Where the Analogy Breaks Down:</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {remoteInsight.breakdown_limitations || 'Earth retains 1G gravity, dense atmosphere, and active biology.'}
                  </p>
                </div>

                {/* Strengths and Gaps Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {remoteInsight.strengths && remoteInsight.strengths.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#0C121E] border border-emerald-900/30 space-y-1.5">
                      <div className="text-[11px] font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Key Matched Strengths</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {remoteInsight.strengths.slice(0, 3).map((st, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {remoteInsight.gaps && remoteInsight.gaps.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#0C121E] border border-amber-900/30 space-y-1.5">
                      <div className="text-[11px] font-mono text-amber-400 uppercase font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Significant Environmental Gaps</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {remoteInsight.gaps.slice(0, 3).map((gp, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{gp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {earth.geologicalContext}
              </p>
            )}
          </div>

          {/* The Handicap Ledger: Physical Discrepancies */}
          <HandicapLedger
            body={reference.body}
            referenceName={reference.name}
            items={reference.handicapLedger}
          />

          {/* Action Card: Complete Site Profile & Citations */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C111E] to-[#0A0E18] border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Complete Field Evidence
              </div>
              <h4 className="text-base font-bold text-white">
                Inspect Site Dossier: {earth.name}
              </h4>
              <p className="text-xs text-slate-400 font-light max-w-md leading-relaxed">
                Review verified remote-sensing datasets, astronaut field test campaigns, coordinates, and ground truth imagery.
              </p>
            </div>

            <button
              onClick={() => onNavigate('sites', { id: earth.id })}
              className="px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all cursor-pointer shrink-0 shadow-[0_0_16px_rgba(34,211,238,0.25)] flex items-center gap-1.5"
            >
              <span>View Site Dossier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
