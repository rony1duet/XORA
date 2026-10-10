/**
 * Weight Playground Component
 * Interactive slider matrix allowing scientists and judges to tune mission priority weights,
 * with preset mission shortcuts and real-time Monte Carlo rank stability indicators.
 */

import React from 'react';
import { WeightPreset, MissionActivity } from '../types/analog';
import { MISSION_ACTIVITY_WEIGHTS } from '../services/similarityEngine';
import { Sliders, RotateCcw, Activity } from 'lucide-react';

interface WeightPlaygroundProps {
  weights: WeightPreset;
  onWeightsChange: (newWeights: WeightPreset) => void;
  selectedActivity: MissionActivity;
  onActivitySelect: (activity: MissionActivity) => void;
  topCandidateName: string;
  rankStabilityPct: number;
}

export const WeightPlayground: React.FC<WeightPlaygroundProps> = ({
  weights,
  onWeightsChange,
  selectedActivity,
  onActivitySelect,
  topCandidateName,
  rankStabilityPct,
}) => {
  const missionActivities: { id: MissionActivity; label: string }[] = [
    { id: 'rover-traverse', label: 'Rover Traverse' },
    { id: 'landing-hazard', label: 'Landing Hazard' },
    { id: 'habitat-siting', label: 'Habitat Siting' },
    { id: 'lava-tube', label: 'Lava Tube / Cave' },
    { id: 'polar-ice', label: 'Polar Ice / Volatiles' },
    { id: 'excavation-isru', label: 'Excavation & ISRU' },
    { id: 'navigation-localization', label: 'Optical Navigation' },
  ];

  const weightSliders: { key: keyof WeightPreset; label: string; desc: string }[] = [
    { key: 'relief', label: 'Relief & Range', desc: 'Elevation relief within 25 km analysis window' },
    { key: 'slope', label: 'Slope Distribution', desc: 'Wasserstein distance across 5 slope gradient bins' },
    { key: 'roughness', label: 'Surface Roughness', desc: 'RMS height variation at 10m spatial baseline' },
    { key: 'hazards', label: 'Boulder / Crater Density', desc: 'Surface hazards per square kilometer' },
    { key: 'lithology', label: 'Geological Lithology', desc: 'Petrological substrate compatibility matrix' },
    { key: 'environmental', label: 'Environmental Context', desc: 'Aridity index and diurnal temperature range' },
  ];

  const handleSliderChange = (key: keyof WeightPreset, value: number) => {
    onWeightsChange({
      ...weights,
      [key]: value,
    });
  };

  const handleReset = () => {
    onWeightsChange(MISSION_ACTIVITY_WEIGHTS[selectedActivity]);
  };

  // Compute total weight to display normalization status
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-[#0E1523] border border-slate-800 rounded-lg p-5 space-y-6">
      {/* Header & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Weight Playground</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Adjust multi-metric priorities to re-evaluate Earth terrain candidates.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="self-start sm:self-auto px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded border border-slate-700 hover:border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Activity Default</span>
        </button>
      </div>

      {/* Mission Activity Presets */}
      <div>
        <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
          Mission Activity Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {missionActivities.map((act) => {
            const isSelected = selectedActivity === act.id;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onActivitySelect(act.id);
                  onWeightsChange(MISSION_ACTIVITY_WEIGHTS[act.id]);
                }}
                className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-medium'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {act.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Sliders */}
      <div className="space-y-4">
        {weightSliders.map((slider) => {
          const val = weights[slider.key];
          const pctOfTotal = totalWeight > 0 ? Math.round((val / totalWeight) * 100) : 0;

          return (
            <div key={slider.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="space-x-1.5">
                  <span className="font-medium text-slate-200">{slider.label}</span>
                  <span className="text-slate-500 font-mono hidden md:inline">· {slider.desc}</span>
                </div>
                <div className="font-mono text-cyan-400 font-semibold">
                  {val} <span className="text-slate-500 font-normal">({pctOfTotal}%)</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={val}
                onChange={(e) => handleSliderChange(slider.key, Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                aria-label={`Weight for ${slider.label}`}
              />
            </div>
          );
        })}
      </div>

      {/* Rank Stability Banner */}
      <div className="p-3.5 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400">Monte Carlo Rank Stability (500 draws): </span>
            <span className="font-semibold text-white">{topCandidateName}</span>
          </div>
        </div>
        <div className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shrink-0">
          {rankStabilityPct.toFixed(1)}% robust
        </div>
      </div>
    </div>
  );
};
