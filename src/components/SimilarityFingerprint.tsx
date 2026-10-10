/**
 * Similarity Fingerprint Component
 * Compact radial radar glyph plotting multidimensional similarity vector s_i,
 * paired with an accessible text and table breakdown.
 */

import React, { useState } from 'react';
import { FeatureScoreBreakdown } from '../types/analog';
import { Table, Eye } from 'lucide-react';

interface SimilarityFingerprintProps {
  featureScores: Record<string, FeatureScoreBreakdown>;
  overallScore: number;
  size?: number;
  showTableToggle?: boolean;
}

export const SimilarityFingerprint: React.FC<SimilarityFingerprintProps> = ({
  featureScores,
  overallScore,
  size = 240,
  showTableToggle = true,
}) => {
  const [viewMode, setViewMode] = useState<'glyph' | 'table'>('glyph');

  const axes = [
    { key: 'relief', label: 'Relief' },
    { key: 'slope', label: 'Slope Dist' },
    { key: 'roughness', label: 'Roughness' },
    { key: 'hazards', label: 'Hazards' },
    { key: 'lithology', label: 'Lithology' },
    { key: 'environmental', label: 'Climate' },
  ];

  const center = size / 2;
  const radius = (size / 2) - 34;
  const angleStep = (2 * Math.PI) / axes.length;

  // Compute radial polygon points
  const points = axes.map((axis, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const score = featureScores[axis.key]?.similarity ?? 0.5;
    const r = radius * score;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, score, label: axis.label, key: axis.key };
  });

  const polygonPath = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Concentric background rings at 0.25, 0.5, 0.75, 1.0
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center">
      {/* View mode toggle */}
      {showTableToggle && (
        <div className="flex items-center justify-end w-full mb-2">
          <div className="inline-flex rounded-md p-0.5 bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('glyph')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'glyph'
                  ? 'bg-slate-800 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Radial Glyph</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Data Table</span>
            </button>
          </div>
        </div>
      )}

      {viewMode === 'glyph' ? (
        <div className="relative flex flex-col items-center">
          <svg
            width={size}
            height={size}
            className="overflow-visible"
            aria-label="Multi-dimensional terrain similarity fingerprint radar chart"
          >
            {/* Concentric reference polygons */}
            {rings.map((ringFactor) => {
              const ringRadius = radius * ringFactor;
              const ringPoints = axes
                .map((_, i) => {
                  const angle = i * angleStep - Math.PI / 2;
                  const x = center + ringRadius * Math.cos(angle);
                  const y = center + ringRadius * Math.sin(angle);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(' ');

              return (
                <polygon
                  key={ringFactor}
                  points={ringPoints}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth={ringFactor === 1.0 ? '1.5' : '1'}
                  strokeDasharray={ringFactor === 1.0 ? undefined : '2,2'}
                />
              );
            })}

            {/* Axis spoke lines */}
            {axes.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x2 = center + radius * Math.cos(angle);
              const y2 = center + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="#1E293B"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Similarity Area */}
            <polygon
              points={polygonPath}
              fill="rgba(6, 182, 212, 0.22)"
              stroke="#06B6D4"
              strokeWidth="2"
              className="transition-all duration-300"
            />

            {/* Data vertices */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#22D3EE"
                stroke="#080D17"
                strokeWidth="1.5"
              />
            ))}

            {/* Axis Labels */}
            {points.map((p, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const labelRadius = radius + 18;
              const lx = center + labelRadius * Math.cos(angle);
              const ly = center + labelRadius * Math.sin(angle);
              const scorePct = Math.round(p.score * 100);

              return (
                <text
                  key={i}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[10px] font-mono fill-slate-300 font-medium select-none"
                >
                  {p.label} ({scorePct}%)
                </text>
              );
            })}

            {/* Center score readout */}
            <text
              x={center}
              y={center - 4}
              textAnchor="middle"
              className="text-lg font-bold font-mono fill-cyan-300"
            >
              {overallScore.toFixed(0)}%
            </text>
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              className="text-[9px] font-mono fill-slate-400 tracking-wider"
            >
              MATCH
            </text>
          </svg>
        </div>
      ) : (
        /* Accessible Data Table Equivalent */
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="py-2 px-3">Terrain Dimension</th>
                <th className="py-2 px-3">Similarity (sᵢ)</th>
                <th className="py-2 px-3">Earth Value</th>
                <th className="py-2 px-3">Target Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {axes.map((axis) => {
                const breakdown = featureScores[axis.key];
                if (!breakdown) return null;
                const simPct = (breakdown.similarity * 100).toFixed(1);

                return (
                  <tr key={axis.key} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-medium text-slate-200">{axis.label}</td>
                    <td className="py-2 px-3 font-mono">
                      <span className="text-cyan-400 font-semibold">{simPct}%</span>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400">{breakdown.earthValue}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">{breakdown.refValue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
