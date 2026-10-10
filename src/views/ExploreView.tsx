/**
 * XORA Explore View
 * Primary geospatial workspace with planetary target toggle, reference region selector,
 * mission activity filters, interactive global Leaflet map, and live ranked candidate inspector.
 */

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

interface ExploreViewProps {
  initialBody?: CelestialBody;
  onNavigate: (route: string, params?: Record<string, string>) => void;
  shortlist: string[];
  onToggleShortlist: (siteId: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  initialBody = 'mars',
  onNavigate,
  shortlist,
  onToggleShortlist,
}) => {
  const [selectedBody, setSelectedBody] = useState<CelestialBody>(initialBody);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>(
    initialBody === 'moon' ? 'lunar-shackleton-rim' : 'mars-jezero-crater'
  );
  const [selectedActivity, setSelectedActivity] = useState<MissionActivity>('rover-traverse');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('atacama-yungay');

  const availableReferences = useMemo(
    () => PLANETARY_REFERENCES.filter((r) => r.body === selectedBody),
    [selectedBody]
  );

  const activeReference: PlanetaryReferenceSite = useMemo(() => {
    return (
      availableReferences.find((r) => r.id === selectedReferenceId) ||
      availableReferences[0] ||
      PLANETARY_REFERENCES[0]
    );
  }, [availableReferences, selectedReferenceId]);

  const rankedResults = useMemo(() => {
    const weights = MISSION_ACTIVITY_WEIGHTS[selectedActivity];
    return rankCandidatesWithStability(
      EARTH_ANALOG_CANDIDATES,
      activeReference,
      weights,
      42
    );
  }, [activeReference, selectedActivity]);

  const topResult = rankedResults[0];
  const selectedResult = useMemo(() => {
    return rankedResults.find((r) => r.site.id === selectedSiteId) || topResult;
  }, [rankedResults, selectedSiteId, topResult]);

  const handleBodyChange = (body: CelestialBody) => {
    setSelectedBody(body);
    const newRefs = PLANETARY_REFERENCES.filter((r) => r.body === body);
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
            sites={EARTH_ANALOG_CANDIDATES}
            selectedSiteId={selectedResult.site.id}
            onSelectSite={(site) => setSelectedSiteId(site.id)}
            activeTargetBody={selectedBody}
          />

          {/* Ranked Candidates Strip */}
          <div className="bg-[#0F121C] border border-[#1F2737] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Ranked Terrestrial Candidates for {activeReference.name}</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Sorted for {selectedActivity.replace(/-/g, ' ')}
              </span>
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
                Terrain Match Assessment: {selectedResult.site.name}
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px] font-light">
                {selectedResult.site.name} matches {activeReference.name} at a{' '}
                <strong className="text-white font-semibold">{selectedResult.overallScore.toFixed(1)}% score</strong>.
                Slope gradients average {selectedResult.site.metrics.slopeMeanDeg.toFixed(1)}° with {selectedResult.site.metrics.roughnessRmsM.toFixed(2)}m RMS roughness, offering calibrated test terrain for {selectedActivity.replace(/-/g, ' ')}.
              </p>
            </div>

            {/* Primary Physical Mismatches */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Documented Physical Divergences</span>
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
              <button
                onClick={() =>
                  onNavigate('compare', {
                    ref: activeReference.id,
                    earth: selectedResult.site.id,
                  })
                }
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Open Split-World Scrubber</span>
              </button>

              <button
                onClick={() => onNavigate('sites', { id: selectedResult.site.id })}
                className="w-full py-2 px-4 text-xs font-medium text-slate-200 bg-[#161B26] hover:bg-[#202737] rounded-md border border-[#252F42] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>View Full Evidence Passport &amp; Rehearsals</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
