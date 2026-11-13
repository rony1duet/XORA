/**
 * XORA Explore View
 * Primary geospatial workspace with planetary target toggle, reference region selector,
 * mission activity filters, interactive global Leaflet map, and live ranked candidate inspector.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  CelestialBody,
  MissionActivity,
  EarthCandidateSite,
  PlanetaryReferenceSite,
} from '../types/analog';
import { PLANETARY_REFERENCES } from '../data/planetaryReferences';
import { EARTH_ANALOG_CANDIDATES } from '../data/earthAnalogs';
import {
  MISSION_ACTIVITY_WEIGHTS,
  rankCandidatesWithStability,
} from '../services/similarityEngine';
import { InteractiveMap } from '../components/InteractiveMap';
import { SimilarityFingerprint } from '../components/SimilarityFingerprint';
import {
  Compass,
  GitCompare,
  FileText,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Search,
  Filter,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { ShimmerMetricCard } from '../components/Shimmer';
import { LiveVisualComparator, CustomProbedPoint } from '../components/LiveVisualComparator';

interface ExploreViewProps {
  initialBody?: CelestialBody;
  onNavigate: (route: string, params?: Record<string, string>) => void;
  shortlist: string[];
  onToggleShortlist: (siteId: string) => void;
  sites?: EarthCandidateSite[];
  references?: PlanetaryReferenceSite[];
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  initialBody = 'mars',
  onNavigate,
  shortlist,
  onToggleShortlist,
  sites = EARTH_ANALOG_CANDIDATES,
  references = PLANETARY_REFERENCES,
}) => {
  const [selectedBody, setSelectedBody] = useState<CelestialBody>(initialBody);
  const [candidateFilter, setCandidateFilter] = useState<'auto' | 'all' | 'moon' | 'mars'>('auto');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>(
    initialBody === 'moon' ? 'lunar-shackleton-rim' : 'mars-jezero-crater'
  );
  const [selectedActivity, setSelectedActivity] = useState<MissionActivity>('rover-traverse');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || 'atacama-yungay');
  const [candidateSearchQuery, setCandidateSearchQuery] = useState<string>('');
  const [isLiveCompareOpen, setIsLiveCompareOpen] = useState<boolean>(false);
  const [liveCompareCustomPoint, setLiveCompareCustomPoint] = useState<CustomProbedPoint | null>(null);

  const effectiveFilter = candidateFilter === 'auto' ? selectedBody : candidateFilter;

  const moonCount = useMemo(() => sites.filter((s) => s.primaryAnalogs.includes('moon')).length, [sites]);
  const marsCount = useMemo(() => sites.filter((s) => s.primaryAnalogs.includes('mars')).length, [sites]);

  const filteredSites = useMemo(() => {
    if (effectiveFilter === 'all') return sites;
    return sites.filter((s) => s.primaryAnalogs.includes(effectiveFilter));
  }, [sites, effectiveFilter]);

  const availableReferences = useMemo(
    () => references.filter((r) => r.body === selectedBody),
    [references, selectedBody]
  );

  const activeReference: PlanetaryReferenceSite = useMemo(() => {
    return (
      availableReferences.find((r) => r.id === selectedReferenceId) ||
      availableReferences[0] ||
      references[0] ||
      PLANETARY_REFERENCES[0]
    );
  }, [availableReferences, selectedReferenceId, references]);

  const rankedResults = useMemo(() => {
    const weights = MISSION_ACTIVITY_WEIGHTS[selectedActivity];
    const ranked = rankCandidatesWithStability(
      filteredSites,
      activeReference,
      weights,
      42
    );
    if (!candidateSearchQuery.trim()) return ranked;
    const q = candidateSearchQuery.toLowerCase();
    return ranked.filter(
      (r) =>
        r.site.name.toLowerCase().includes(q) ||
        r.site.country.toLowerCase().includes(q) ||
        r.site.location.toLowerCase().includes(q) ||
        r.site.metrics.geologicalClass.toLowerCase().includes(q)
    );
  }, [filteredSites, activeReference, selectedActivity, candidateSearchQuery]);

  const topResult = rankedResults[0] || {
    site: filteredSites[0] || sites[0] || EARTH_ANALOG_CANDIDATES[0],
    reference: activeReference,
    overallScore: 85,
    featureScores: {},
    includedFeatures: [],
    excludedFeatures: [],
    dataCoveragePct: 100,
    topMismatches: [],
    rankStabilityPct: 92,
    rank: 1,
  };

  const selectedResult = useMemo(() => {
    return rankedResults.find((r) => r.site.id === selectedSiteId) || topResult;
  }, [rankedResults, selectedSiteId, topResult]);

  // Keep selected site valid when candidate filter or body changes
  useEffect(() => {
    if (rankedResults.length > 0 && !rankedResults.some((r) => r.site.id === selectedSiteId)) {
      setSelectedSiteId(rankedResults[0].site.id);
    }
  }, [rankedResults, selectedSiteId]);

  const handleBodyChange = (body: CelestialBody) => {
    setSelectedBody(body);
    const newRefs = references.filter((r) => r.body === body);
    if (newRefs.length > 0) {
      setSelectedReferenceId(newRefs[0].id);
    }
  };

  const handleSelectSite = React.useCallback((site: EarthCandidateSite) => {
    setSelectedSiteId(site.id);
  }, []);

  const isShortlisted = shortlist.includes(selectedResult.site.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Workspace Control Bar */}
      <div className="bg-[#0F121C] border border-[#1F2737] rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Target Body Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase text-slate-400">Target Body:</span>
            <div className="inline-flex rounded-lg p-1 bg-[#161B26] border border-[#252F42]">
              <button
                onClick={() => handleBodyChange('moon')}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  selectedBody === 'moon'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Moon (1.62 m/s²)
              </button>
              <button
                onClick={() => handleBodyChange('mars')}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  selectedBody === 'mars'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mars (3.71 m/s²)
              </button>
            </div>
          </div>

          {/* Reference Region Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase text-slate-400">Reference Site:</span>
            <select
              value={activeReference.id}
              onChange={(e) => setSelectedReferenceId(e.target.value)}
              className="bg-[#161B26] border border-[#252F42] text-white text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {availableReferences.map((ref) => (
                <option key={ref.id} value={ref.id}>
                  {ref.name} ({ref.keyTargetFeature})
                </option>
              ))}
            </select>
          </div>

          {/* Mission Activity Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase text-slate-400">Mission Activity:</span>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value as MissionActivity)}
              className="bg-[#161B26] border border-[#252F42] text-cyan-300 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="rover-traverse">Rover Traverse and Mobility</option>
              <option value="landing-hazard">Landing Hazard and Sensor Testing</option>
              <option value="habitat-siting">Habitat Siting and Geotechnics</option>
              <option value="lava-tube">Lava-Tube and Cave Exploration</option>
              <option value="polar-ice">Polar-Ice and Volatiles</option>
              <option value="excavation-isru">Regolith Excavation and ISRU</option>
              <option value="navigation-localization">Optical Navigation and Landmarks</option>
            </select>
          </div>
        </div>

        {/* Reference Context Kicker */}
        <div className="pt-3 border-t border-[#1F2737] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            <strong className="text-white font-medium">{activeReference.name}:</strong>{' '}
            <span className="font-light">{activeReference.geologicalContext}</span>
          </div>
          <div className="font-mono text-cyan-400 shrink-0">
            {activeReference.coordinates.lat.toFixed(2)}°, {activeReference.coordinates.lng.toFixed(2)}° · LOLA / MOLA Datum
          </div>
        </div>
      </div>

      {/* Main Two-Column Analysis Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map & Candidate Ranking List */}
        <div className="lg:col-span-7 space-y-5">
          {/* Global Interactive Map (Free Leaflet + OpenStreetMap/CartoDB) */}
          <InteractiveMap
            sites={sites}
            selectedSiteId={selectedResult.site.id}
            onSelectSite={(site) => setSelectedSiteId(site.id)}
            activeTargetBody={selectedBody}
            onOpenLiveCompare={(site, customPt) => {
              setSelectedSiteId(site.id);
              setLiveCompareCustomPoint(customPt ? { lat: customPt.lat, lng: customPt.lng, label: customPt.label } : null);
              setIsLiveCompareOpen(true);
            }}
          />

          {/* Ranked Candidates Strip with Live Search Filter */}
          <div className="bg-[#0F121C] border border-[#1F2737] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Ranked Terrestrial Candidates ({rankedResults.length} sites)</span>
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter country, region or geology..."
                  value={candidateSearchQuery}
                  onChange={(e) => setCandidateSearchQuery(e.target.value)}
                  className="bg-[#121624] border border-[#1F2737] rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-48 sm:w-56"
                />
              </div>
            </div>

            {/* Candidate Body Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
                Filter Analogs:
              </span>
              <button
                onClick={() => setCandidateFilter('auto')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  candidateFilter === 'auto'
                    ? selectedBody === 'moon'
                      ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 font-bold shadow'
                      : 'bg-amber-500/25 text-amber-300 border border-amber-500/50 font-bold shadow'
                    : 'bg-[#121624] text-slate-400 border border-[#1F2737] hover:text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedBody === 'moon' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span>{selectedBody === 'moon' ? `Moon Analogs (${moonCount})` : `Mars Analogs (${marsCount})`}</span>
                <span className="text-[10px] opacity-70">(Auto)</span>
              </button>
              <button
                onClick={() => setCandidateFilter('moon')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  candidateFilter === 'moon'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 font-bold shadow'
                    : 'bg-[#121624] text-slate-400 border border-[#1F2737] hover:text-cyan-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Moon Only ({moonCount})</span>
              </button>
              <button
                onClick={() => setCandidateFilter('mars')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  candidateFilter === 'mars'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 font-bold shadow'
                    : 'bg-[#121624] text-slate-400 border border-[#1F2737] hover:text-amber-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Mars Only ({marsCount})</span>
              </button>
              <button
                onClick={() => setCandidateFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                  candidateFilter === 'all'
                    ? 'bg-slate-700/80 text-white font-bold border border-slate-600 shadow'
                    : 'bg-[#121624] text-slate-400 border border-[#1F2737] hover:text-white'
                }`}
              >
                <span>All Sites ({sites.length})</span>
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {rankedResults.map((result) => {
                const isSelected = result.site.id === selectedResult.site.id;
                const isTop = result.rank === 1;

                return (
                  <div
                    key={result.site.id}
                    onClick={() => setSelectedSiteId(result.site.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#161B26] border-cyan-500/80 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                        : 'bg-[#121624] border-[#1F2737] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                          isTop
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-[#1F2737] text-slate-300'
                        }`}
                      >
                        #{result.rank}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>{result.site.name}</span>
                          {isTop && (
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/50">
                              #1 TWIN
                            </span>
                          )}
                          {result.site.primaryAnalogs.map((a) => (
                            <span
                              key={a}
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                                a === 'moon'
                                  ? 'bg-cyan-950/80 border-cyan-800/60 text-cyan-300'
                                  : 'bg-amber-950/80 border-amber-800/60 text-amber-300'
                              }`}
                            >
                              {a === 'moon' ? 'Moon' : 'Mars'}
                            </span>
                          ))}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {result.site.location}, {result.site.country} · {result.site.metrics.geologicalClass.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm font-bold text-cyan-300">
                        {result.overallScore.toFixed(1)}%
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {result.rankStabilityPct.toFixed(0)}% stability
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Twin Detailed Inspector */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#0F121C] border border-[#1F2737] rounded-xl p-5 space-y-5">
            {/* Inspector Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1F2737]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">
                    Rank #{selectedResult.rank} Candidate
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedResult.site.country}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  {selectedResult.site.name}
                </h2>
              </div>

              {/* Action Buttons: Shortlist */}
              <button
                onClick={() => onToggleShortlist(selectedResult.site.id)}
                className={`p-2 rounded border transition-colors cursor-pointer ${
                  isShortlisted
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                    : 'bg-[#161B26] text-slate-400 border-[#252F42] hover:text-white'
                }`}
                title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            {/* Overall Score & Fingerprint */}
            <div className="flex flex-col items-center p-3 rounded-xl bg-[#121624] border border-[#1F2737]">
              <SimilarityFingerprint
                featureScores={selectedResult.featureScores}
                overallScore={selectedResult.overallScore}
                size={230}
              />
            </div>

            {/* Clear Plain-English Geological Summary */}
            <div className="p-3.5 rounded-xl bg-[#141C2B] border border-[#252F42] space-y-1.5 text-xs">
              <div className="font-semibold text-cyan-300">
                Mission Fit Assessment: {selectedResult.site.name}
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px] font-light">
                {selectedResult.site.name} matches {activeReference.name} with a{' '}
                <strong className="text-white font-semibold">{selectedResult.overallScore.toFixed(1)}% fidelity score</strong>.
                Its {selectedResult.site.metrics.slopeMeanDeg.toFixed(1)}° slopes and {selectedResult.site.metrics.roughnessRmsM.toFixed(2)}m roughness create ideal real-world terrain to rehearse {selectedActivity.replace(/-/g, ' ')}.
              </p>
            </div>

            {/* Primary Physical Mismatches */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>The Reality Check: What Differs on Earth</span>
              </div>

              {selectedResult.topMismatches.length > 0 ? (
                <div className="space-y-2">
                  {selectedResult.topMismatches.map((mismatch, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[#181A22] border border-[#2B231C] text-xs space-y-1"
                    >
                      <div className="font-semibold text-slate-200 flex items-center justify-between">
                        <span>{mismatch.feature}</span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {mismatch.earthVal} vs {mismatch.refVal}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px] font-light">
                        {mismatch.impact}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-300">
                  No critical physical divergence detected across evaluated baseline thresholds.
                </div>
              )}
            </div>

            {/* Direct Action Links */}
            <div className="pt-2 flex flex-col gap-2">
              {/* Primary Live Visual Comparison Studio Button */}
              <button
                onClick={() => {
                  setLiveCompareCustomPoint(null);
                  setIsLiveCompareOpen(true);
                }}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-teal-200 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25 active:scale-[0.99]"
              >
                <Eye className="w-4 h-4" />
                <span>Live Visual Comparison: {selectedResult.site.name} vs {activeReference.name}</span>
              </button>

              <button
                onClick={() =>
                  onNavigate('compare', {
                    ref: activeReference.id,
                    earth: selectedResult.site.id,
                  })
                }
                className="w-full py-2 px-4 text-xs font-semibold text-slate-200 bg-[#161B26] hover:bg-[#1F2738] border border-[#252F42] hover:border-cyan-500/50 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Full-Page Dual Comparator</span>
              </button>

              <button
                onClick={() => onNavigate('sites', { id: selectedResult.site.id })}
                className="w-full py-2 px-4 text-xs font-medium text-slate-300 bg-[#121624] hover:bg-[#1A2033] rounded-lg border border-[#1F2737] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>View Full Evidence Passport &amp; Rehearsals</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Visual Comparison Modal (Earth Point vs Moon / Mars) */}
      {isLiveCompareOpen && (
        <LiveVisualComparator
          isModal
          isOpen={isLiveCompareOpen}
          onClose={() => setIsLiveCompareOpen(false)}
          selectedEarthSite={selectedResult.site}
          customPoint={liveCompareCustomPoint}
          activeTarget={activeReference}
          allTargets={references}
          onSelectTarget={(t) => setSelectedReferenceId(t.id)}
        />
      )}
    </div>
  );
};
