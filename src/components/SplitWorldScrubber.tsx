/**
 * XORA Split-World Scrubber Component
 * Precise draggable visual divider comparing planetary reference and terrestrial analog
 * under locked 1:1 pixel scale and hillshade lighting, plus cross-section elevation profiles.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PlanetaryReferenceSite, EarthCandidateSite } from '../types/analog';
import { getTerrainImage } from '../data/terrainImages';
import { SlidersHorizontal, Info, Layers, Activity } from 'lucide-react';

interface SplitWorldScrubberProps {
  reference: PlanetaryReferenceSite;
  earth: EarthCandidateSite;
}

export const SplitWorldScrubber: React.FC<SplitWorldScrubberProps> = ({ reference, earth }) => {
  const [scrubberPosition, setScrubberPosition] = useState(50); // 0 to 100%
  const [isDragging, setIsDragging] = useState(false);
  const [viewType, setViewType] = useState<'imagery' | 'elevationProfile'>('imagery');
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep track of container width for pixel-locked split comparison
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handlePointerMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setScrubberPosition(Math.max(5, Math.min(95, pos)));
  }, []);

  const onPointerDown = () => setIsDragging(true);

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    const handleMove = (e: MouseEvent) => {
      if (isDragging) handlePointerMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handlePointerMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchend', handleUp);
      window.addEventListener('touchmove', handleTouchMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, handlePointerMove]);

  return (
    <div className="bg-[#0F121C] border border-[#1F2737] rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Top control bar */}
      <div className="p-4 border-b border-[#1F2737] bg-[#121624] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Split-World Comparison</span>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            ({scrubberPosition.toFixed(0)}% / {(100 - scrubberPosition).toFixed(0)}% split)
          </span>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#090A0F] rounded-lg border border-[#1F2737] text-xs">
          <button
            onClick={() => setViewType('imagery')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewType === 'imagery'
                ? 'bg-[#1F2737] text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Topographic Imagery</span>
          </button>
          <button
            onClick={() => setViewType('elevationProfile')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewType === 'elevationProfile'
                ? 'bg-[#1F2737] text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Elevation Transect</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewType === 'imagery' ? (
        <div
          ref={containerRef}
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
          className="relative w-full aspect-16/9 sm:aspect-21/9 bg-[#07080D] select-none cursor-ew-resize overflow-hidden"
        >
          {/* Layer 1 (Right side): Earth Analog Image */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={getTerrainImage(earth.id, earth.demImageUrl)}
              alt={`Earth Analog: ${earth.name}`}
              className="w-full h-full object-cover"
            />
            {/* Earth Label (Bottom Right) */}
            <div className="absolute bottom-4 right-4 bg-[#090A0F]/85 backdrop-blur-md border border-emerald-500/40 rounded-lg px-3 py-1.5 text-right shadow-lg">
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                Earth Twin Candidate
              </div>
              <div className="text-xs font-bold text-white">{earth.name}</div>
              <div className="text-[10px] font-mono text-slate-400">
                {earth.coordinates.lat.toFixed(2)}°, {earth.coordinates.lng.toFixed(2)}° · Copernicus 30m
              </div>
            </div>
          </div>

          {/* Layer 2 (Left side): Planetary Reference clipped precisely at scrubberPosition */}
          <div
            className="absolute inset-0 h-full overflow-hidden"
            style={{ width: `${scrubberPosition}%` }}
          >
            <img
              src={getTerrainImage(reference.id, reference.demImageUrl)}
              alt={`Planetary Reference: ${reference.name}`}
              className="absolute inset-y-0 left-0 h-full object-cover max-w-none"
              style={{
                width: containerWidth ? `${containerWidth}px` : '100%',
              }}
            />
            {/* Target Label (Bottom Left) */}
            <div className="absolute bottom-4 left-4 bg-[#090A0F]/85 backdrop-blur-md border border-cyan-500/40 rounded-lg px-3 py-1.5 shadow-lg">
              <div className="text-[10px] font-mono uppercase text-cyan-400 font-semibold tracking-wider">
                {reference.body === 'moon' ? 'Lunar Reference' : 'Martian Reference'}
              </div>
              <div className="text-xs font-bold text-white">{reference.name}</div>
              <div className="text-[10px] font-mono text-slate-400">
                {reference.coordinates.lat.toFixed(2)}°, {reference.coordinates.lng.toFixed(2)}° · {reference.elevationDatum.split(' ')[0]}
              </div>
            </div>
          </div>

          {/* Scrubber Divider Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] pointer-events-none"
            style={{ left: `${scrubberPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#0F121C] border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      ) : (
        /* Cross-Section Topographic Elevation Transect */
        <div className="p-6 bg-[#07080D] space-y-4">
          <div className="text-xs text-slate-400 leading-relaxed font-light">
            Standardized 25-kilometer radial topographic transect across the center of both sites.
            Shows normalized relief difference across the analysis window.
          </div>

          <div className="w-full h-52 flex items-end gap-1 border-b border-l border-[#1F2737] p-2 relative">
            {/* SVG Profile curves */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              {/* Reference site curve */}
              {reference.elevationProfile.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="2.5"
                  points={reference.elevationProfile
                    .map((pt, i) => {
                      const x = (i / (reference.elevationProfile.length - 1)) * 500;
                      const min = -3500;
                      const max = 3500;
                      const y = 150 - ((pt.elevationM - min) / (max - min)) * 140;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}

              {/* Earth candidate curve */}
              {earth.elevationProfile.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2.5"
                  strokeDasharray="4,3"
                  points={earth.elevationProfile
                    .map((pt, i) => {
                      const x = (i / (earth.elevationProfile.length - 1)) * 500;
                      const min = -3500;
                      const max = 3500;
                      const y = 150 - ((pt.elevationM - min) / (max - min)) * 140;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}
            </svg>

            <div className="absolute top-3 right-4 text-xs font-mono space-y-1.5 bg-[#0F121C]/90 p-3 rounded-lg border border-[#1F2737] shadow-lg">
              <div className="text-cyan-400 flex items-center gap-2">
                <span className="w-3.5 h-0.5 bg-cyan-400 inline-block rounded" />
                <span>{reference.name} (Relief {reference.metrics.elevationReliefM}m)</span>
              </div>
              <div className="text-emerald-400 flex items-center gap-2">
                <span className="w-3.5 h-0.5 bg-emerald-400 border-dashed inline-block" />
                <span>{earth.name} (Relief {earth.metrics.elevationReliefM}m)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scientific Notice Footer */}
      <div className="p-3.5 bg-[#0A0D15] border-t border-[#1F2737] flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span className="font-light">
          <strong className="text-slate-300 font-medium">Morphological Comparison Notice:</strong> This visual scrubber displays orbital hillshade and terrain textures for spatial inspection. Numerical ranking is computed independently via the multi-metric feature engine.
        </span>
      </div>
    </div>
  );
};
