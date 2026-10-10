/**
 * Site Profile View
 * Comprehensive dossier for an individual Earth candidate site,
 * featuring Evidence Passport, Mission Rehearsal Cards, and metric provenance.
 */

import React, { useMemo } from 'react';
import { EARTH_ANALOG_CANDIDATES } from '../data/earthAnalogs';
import { getTerrainImage } from '../data/terrainImages';
import { EvidencePassport } from '../components/EvidencePassport';
import { MissionRehearsalCards } from '../components/MissionRehearsalCards';
import { ArrowLeft, GitCompare, MapPin, Compass, History, ExternalLink } from 'lucide-react';

interface SiteProfileViewProps {
  siteId: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const SiteProfileView: React.FC<SiteProfileViewProps> = ({ siteId, onNavigate }) => {
  const site = useMemo(() => {
    return (
      EARTH_ANALOG_CANDIDATES.find((s) => s.id === siteId) ||
      EARTH_ANALOG_CANDIDATES[0]
    );
  }, [siteId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={() => onNavigate('explore')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explorer</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {site.name}
            </h1>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-cyan-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {site.coordinates.lat.toFixed(4)}°N, {site.coordinates.lng.toFixed(4)}°E
              </span>
            </span>
            <span>·</span>
            <span>{site.location}, {site.country}</span>
            <span>·</span>
            <span className="uppercase text-emerald-400 font-semibold">
              Primary: {site.primaryAnalogs.join(' & ')}
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('compare', { earth: site.id })}
          className="px-4 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Launch Split-World Scrubber</span>
        </button>
      </div>

      {/* Hero Banner & Geological Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: High-resolution Aerial Photo */}
        <div className="lg:col-span-7 rounded-lg overflow-hidden border border-slate-800 bg-[#0E1523] aspect-16/9 relative">
          <img
            src={getTerrainImage(site.id, site.demImageUrl)}
            alt={site.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-300 font-mono">
            Copernicus 30m Georeferenced Analysis Footprint (25 km × 25 km)
          </div>
        </div>

        {/* Right: Geological Context & Field Research History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0E1523] border border-slate-800 rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Geological Context & Petrology</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {site.geologicalContext}
            </p>
          </div>

          <div className="bg-[#0E1523] border border-slate-800 rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Space Exploration Field History</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {site.fieldResearchHistory}
            </p>
          </div>
        </div>
      </div>

      {/* Evidence Passport Section */}
      <EvidencePassport passport={site.evidencePassport} provenances={site.provenance} />

      {/* Mission Rehearsal Cards */}
      <MissionRehearsalCards cards={site.rehearsalCards} />

      {/* Quantitative Terrain Metrics Table */}
      <div className="bg-[#0E1523] border border-slate-800 rounded-lg p-5 space-y-4">
        <h3 className="text-base font-semibold text-white tracking-tight">
          Standardized Terrain & Environmental Parameters
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="p-2.5">Parameter</th>
                <th className="p-2.5">Value</th>
                <th className="p-2.5">Provenance Tier</th>
                <th className="p-2.5">Data Source / Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-2.5 font-medium text-white">Elevation Relief Range</td>
                <td className="p-2.5 font-mono text-cyan-300">{site.metrics.elevationReliefM} m</td>
                <td className="p-2.5 font-mono text-cyan-400 uppercase text-[10px]">
                  {site.provenance.elevationReliefM.type}
                </td>
                <td className="p-2.5 font-mono text-slate-400">{site.provenance.elevationReliefM.source}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-white">Mean Slope Angle</td>
                <td className="p-2.5 font-mono text-cyan-300">{site.metrics.slopeMeanDeg}°</td>
                <td className="p-2.5 font-mono text-cyan-400 uppercase text-[10px]">
                  {site.provenance.slopeMeanDeg.type}
                </td>
                <td className="p-2.5 font-mono text-slate-400">{site.provenance.slopeMeanDeg.source}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-white">P90 Slope Gradient</td>
                <td className="p-2.5 font-mono text-cyan-300">{site.metrics.slopeP90Deg}°</td>
                <td className="p-2.5 font-mono text-cyan-400 uppercase text-[10px]">
                  {site.provenance.slopeP90Deg.type}
                </td>
                <td className="p-2.5 font-mono text-slate-400">{site.provenance.slopeP90Deg.source}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-white">Surface RMS Roughness (10m baseline)</td>
                <td className="p-2.5 font-mono text-cyan-300">{site.metrics.roughnessRmsM} m RMS</td>
                <td className="p-2.5 font-mono text-amber-400 uppercase text-[10px]">
                  {site.provenance.roughnessRmsM.type}
                </td>
                <td className="p-2.5 font-mono text-slate-400">{site.provenance.roughnessRmsM.source}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-white">Boulder / Crater Density</td>
                <td className="p-2.5 font-mono text-cyan-300">{site.metrics.boulderCraterDensityPerKm2} /km²</td>
                <td className="p-2.5 font-mono text-amber-400 uppercase text-[10px]">
                  {site.provenance.boulderCraterDensityPerKm2.type}
                </td>
                <td className="p-2.5 font-mono text-slate-400">{site.provenance.boulderCraterDensityPerKm2.source}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-white">UNEP Aridity Index (P/PET)</td>
                <td className="p-2.5 font-mono text-cyan-300">{site.metrics.aridityIndex}</td>
                <td className="p-2.5 font-mono text-cyan-400 uppercase text-[10px]">
                  {site.provenance.aridityIndex.type}
                </td>
                <td className="p-2.5 font-mono text-slate-400">{site.provenance.aridityIndex.source}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
