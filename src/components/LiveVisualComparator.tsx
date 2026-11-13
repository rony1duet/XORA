/**
 * XORA Live Visual Comparator Component
 * Live 1:1 Visual & Morphological Comparison: Selected Earth Place vs Moon or Mars
 * Modes:
 * 1. Split-World Scrubber (interactive 0-100% split slider)
 * 2. Synchronized Side-by-Side Dual Ortho View (with scale bar and crosshair reticle)
 * 3. 25km Standardized Topographic Elevation Transect
 * 4. Physical Environment & Geodetic Telemetry Ledger
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { PlanetaryReferenceSite, EarthCandidateSite, CelestialBody } from '../types/analog';
import { PLANETARY_REFERENCES } from '../data/planetaryReferences';
import { getTerrainImage } from '../data/terrainImages';
import { ShimmerImage } from './Shimmer';
import { 
  SlidersHorizontal, 
  Columns, 
  Activity, 
  Gauge, 
  Layers, 
  MapPin, 
  Sparkles, 
  Compass, 
  Maximize2, 
  Minimize2, 
  X,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export interface CustomProbedPoint {
  lat: number;
  lng: number;
  label?: string;
}

interface LiveVisualComparatorProps {
  selectedEarthSite: EarthCandidateSite;
  customPoint?: CustomProbedPoint | null;
  activeTarget?: PlanetaryReferenceSite;
  allTargets?: PlanetaryReferenceSite[];
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
  onSelectTarget?: (target: PlanetaryReferenceSite) => void;
}

type VisualMode = 'split' | 'sideBySide' | 'elevation' | 'environment';
type FilterMode = 'normal' | 'contrast' | 'hillshade';

export const LiveVisualComparator: React.FC<LiveVisualComparatorProps> = ({
  selectedEarthSite,
  customPoint = null,
  activeTarget,
  allTargets = PLANETARY_REFERENCES,
  isOpen = true,
  onClose,
  isModal = false,
  onSelectTarget,
}) => {
  const [selectedBody, setSelectedBody] = useState<CelestialBody>(
    activeTarget?.body || 'mars'
  );

  const availableTargets = useMemo(() => {
    return allTargets.filter((t) => t.body === selectedBody);
  }, [allTargets, selectedBody]);

  const [currentTargetId, setCurrentTargetId] = useState<string>(
    activeTarget?.id || (availableTargets[0]?.id ?? allTargets[0]?.id ?? 'mars-jezero-crater')
  );

  const target = useMemo(() => {
    return (
      allTargets.find((t) => t.id === currentTargetId) ||
      availableTargets[0] ||
      allTargets[0] ||
      PLANETARY_REFERENCES[0]
    );
  }, [allTargets, availableTargets, currentTargetId]);

  const [visualMode, setVisualMode] = useState<VisualMode>('split');
  const [filterMode, setFilterMode] = useState<FilterMode>('normal');
  const [scrubberPos, setScrubberPos] = useState<number>(50); // 0-100%
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize target when activeTarget prop changes
  useEffect(() => {
    if (activeTarget) {
      setSelectedBody(activeTarget.body);
      setCurrentTargetId(activeTarget.id);
    }
  }, [activeTarget]);

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
  }, [visualMode, isFullscreen]);

  // Pointer drag handling for scrubber
  const handlePointerMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setScrubberPos(Math.max(2, Math.min(98, pos)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    handlePointerMove(e.clientX);
    if ('setPointerCapture' in e.currentTarget && 'pointerId' in e) {
      try {
        e.currentTarget.setPointerCapture((e as React.PointerEvent).pointerId);
      } catch (_) {}
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.preventDefault();
      handlePointerMove(e.clientX);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if ('releasePointerCapture' in e.currentTarget && 'pointerId' in e) {
      try {
        e.currentTarget.releasePointerCapture((e as React.PointerEvent).pointerId);
      } catch (_) {}
    }
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: PointerEvent | MouseEvent) => {
      handlePointerMove(e.clientX);
    };
    const handleUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, handlePointerMove]);

  // Dynamic elevation range calculation
  const elevationExtremes = useMemo(() => {
    const allElevations = [
      ...target.elevationProfile.map((p) => p.elevationM),
      ...selectedEarthSite.elevationProfile.map((p) => p.elevationM),
    ];
    const rawMin = allElevations.length > 0 ? Math.min(...allElevations) : -1000;
    const rawMax = allElevations.length > 0 ? Math.max(...allElevations) : 1000;
    const padding = Math.max(150, (rawMax - rawMin) * 0.12);
    const min = Math.floor(rawMin - padding);
    const max = Math.ceil(rawMax + padding);
    return { min, max, range: Math.max(1, max - min) };
  }, [target.elevationProfile, selectedEarthSite.elevationProfile]);

  const earthImage = useMemo(() => {
    return getTerrainImage(
      selectedEarthSite.id,
      selectedEarthSite.demImageUrl,
      selectedEarthSite.metrics.geologicalClass
    );
  }, [selectedEarthSite]);

  const targetImage = useMemo(() => {
    return getTerrainImage(target.id, target.demImageUrl);
  }, [target]);

  // CSS Filter class based on filterMode
  const filterClass = useMemo(() => {
    if (filterMode === 'contrast') return 'contrast-125 saturate-110';
    if (filterMode === 'hillshade') return 'contrast-150 grayscale brightness-90';
    return '';
  }, [filterMode]);

  const handleTargetChange = (t: PlanetaryReferenceSite) => {
    setCurrentTargetId(t.id);
    if (onSelectTarget) onSelectTarget(t);
  };

  const handleBodyChange = (body: CelestialBody) => {
    setSelectedBody(body);
    const filtered = allTargets.filter((t) => t.body === body);
    if (filtered.length > 0) {
      setCurrentTargetId(filtered[0].id);
      if (onSelectTarget) onSelectTarget(filtered[0]);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className={`flex flex-col bg-[#0A0D15] border border-cyan-900/40 rounded-2xl overflow-hidden shadow-2xl text-[#F8FAFC] ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'relative w-full'
    }`}>
      {/* 1. Aerospace Control Header */}
      <div className="p-4 sm:p-5 bg-[#0D121F] border-b border-[#182030] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Live Visual Comparator
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              1:1 Morphological Matching
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-emerald-300">
                {customPoint ? customPoint.label || `Probed Earth Point (${customPoint.lat.toFixed(2)}°, ${customPoint.lng.toFixed(2)}°)` : selectedEarthSite.name}
              </span>
              <span className="text-slate-500 font-normal">⟷</span>
              <span className={target.body === 'moon' ? 'text-cyan-300' : 'text-amber-300'}>
                {target.name} ({target.body === 'moon' ? 'Moon' : 'Mars'})
              </span>
            </h2>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-2">
          {/* Target Body Switcher */}
          <div className="inline-flex rounded-lg p-0.5 bg-[#141C2B] border border-slate-800 text-xs font-mono">
            <button
              onClick={() => handleBodyChange('moon')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                selectedBody === 'moon'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Moon
            </button>
            <button
              onClick={() => handleBodyChange('mars')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                selectedBody === 'mars'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mars
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-[#141C2B] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Compare Studio'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button (if modal) */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#141C2B] hover:bg-red-950/40 border border-slate-800 hover:border-red-800/50 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
              title="Close Comparator"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Target Reference Selection Strip */}
      <div className="px-4 py-2.5 bg-[#090D18] border-b border-[#182030] flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Target:</span>
        </span>
        {availableTargets.map((t) => {
          const isActive = t.id === target.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTargetChange(t)}
              className={`px-3 py-1 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? selectedBody === 'moon'
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 font-semibold shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                    : 'bg-amber-500/20 border-amber-400/60 text-amber-200 font-semibold shadow-[0_0_10px_rgba(251,146,60,0.25)]'
                  : 'bg-[#101524] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{t.name}</span>
              <span className="text-[10px] font-mono opacity-70">
                {t.metrics.elevationReliefM}m relief
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Comparator Mode & Filter Bar */}
      <div className="px-4 py-2 bg-[#0C101C] border-b border-[#182030] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-[#07090E] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setVisualMode('split')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              visualMode === 'split'
                ? 'bg-[#1C2538] text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Split Scrubber</span>
          </button>
          <button
            onClick={() => setVisualMode('sideBySide')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              visualMode === 'sideBySide'
                ? 'bg-[#1C2538] text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dual Synchronized</span>
          </button>
          <button
            onClick={() => setVisualMode('elevation')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              visualMode === 'elevation'
                ? 'bg-[#1C2538] text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>25km Transect</span>
          </button>
          <button
            onClick={() => setVisualMode('environment')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              visualMode === 'environment'
                ? 'bg-[#1C2538] text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>Environment Ledger</span>
          </button>
        </div>

        {/* Imagery Enhancements (Contrast, Hillshade) */}
        {(visualMode === 'split' || visualMode === 'sideBySide') && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Filter:</span>
            <div className="inline-flex rounded-md p-0.5 bg-[#07090E] border border-slate-800">
              <button
                onClick={() => setFilterMode('normal')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  filterMode === 'normal'
                    ? 'bg-[#1C2538] text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Natural
              </button>
              <button
                onClick={() => setFilterMode('contrast')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  filterMode === 'contrast'
                    ? 'bg-[#1C2538] text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Enhanced
              </button>
              <button
                onClick={() => setFilterMode('hillshade')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  filterMode === 'hillshade'
                    ? 'bg-[#1C2538] text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hillshade
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Visual Stage Area */}
      <div className="relative bg-[#05070B] overflow-hidden select-none">
        {/* MODE 1: Precision Split-World Scrubber */}
        {visualMode === 'split' && (
          <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="relative w-full aspect-16/9 sm:aspect-21/9 max-h-[580px] bg-[#07080D] cursor-ew-resize overflow-hidden touch-none"
          >
            {/* Layer 1 (Right): Earth Analog Terrain */}
            <div className={`absolute inset-0 w-full h-full pointer-events-none select-none ${filterClass}`}>
              <ShimmerImage
                src={earthImage}
                alt={`Earth Analog: ${selectedEarthSite.name}`}
                draggable={false}
                className="w-full h-full object-cover pointer-events-none select-none"
              />
              {/* Earth Coordinate & Telemetry Badge */}
              <div className="absolute bottom-4 right-4 bg-[#090D18]/90 backdrop-blur-md border border-emerald-500/40 rounded-xl p-3 text-right shadow-2xl pointer-events-none z-20 space-y-1">
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center justify-end gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Earth Selected Twin</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {selectedEarthSite.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {selectedEarthSite.coordinates.lat.toFixed(3)}°N, {selectedEarthSite.coordinates.lng.toFixed(3)}°E · Copernicus 30m
                </div>
                <div className="text-[10px] font-mono text-emerald-300/80">
                  Relief: {selectedEarthSite.metrics.elevationReliefM}m · Slope: {selectedEarthSite.metrics.slopeMeanDeg.toFixed(1)}°
                </div>
              </div>
            </div>

            {/* Layer 2 (Left): Planetary Reference clipped at scrubberPos */}
            <div
              className={`absolute inset-0 h-full overflow-hidden pointer-events-none select-none z-10 ${filterClass}`}
              style={{ width: `${scrubberPos}%` }}
            >
              <div
                className="absolute inset-y-0 left-0 h-full pointer-events-none select-none"
                style={{
                  width: containerWidth ? `${containerWidth}px` : '100%',
                }}
              >
                <ShimmerImage
                  src={targetImage}
                  alt={`Planetary Target: ${target.name}`}
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none select-none"
                />
              </div>

              {/* Target Coordinate & Telemetry Badge */}
              <div className="absolute bottom-4 left-4 bg-[#090D18]/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl pointer-events-none z-20 space-y-1">
                <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{target.body === 'moon' ? 'Lunar Reference' : 'Martian Reference'}</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {target.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {target.coordinates.lat.toFixed(3)}°N, {target.coordinates.lng.toFixed(3)}°E · {target.elevationDatum.split(' ')[0]}
                </div>
                <div className="text-[10px] font-mono text-cyan-300/80">
                  Relief: {target.metrics.elevationReliefM}m · Slope: {target.metrics.slopeMeanDeg.toFixed(1)}°
                </div>
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.9)] pointer-events-none z-30"
              style={{ left: `${scrubberPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#0B0F17] border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.6)]">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div className="absolute top-4 -translate-x-1/2 bg-[#0B0F17]/90 px-2 py-0.5 rounded border border-cyan-500/40 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-md">
                {scrubberPos.toFixed(0)}% / {(100 - scrubberPos).toFixed(0)}%
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: Synchronized Side-by-Side Dual Ortho View */}
        {visualMode === 'sideBySide' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Left: Selected Earth Point */}
            <div className="relative aspect-16/10 bg-[#07090E] overflow-hidden">
              <div className={`w-full h-full ${filterClass}`}>
                <ShimmerImage
                  src={earthImage}
                  alt={selectedEarthSite.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Crosshair Target Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-emerald-400/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                  <div className="absolute w-24 h-[1px] bg-emerald-400/30" />
                  <div className="absolute h-24 w-[1px] bg-emerald-400/30" />
                </div>
              </div>

              {/* Scale Bar */}
              <div className="absolute bottom-4 left-4 bg-[#090D18]/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs font-mono space-y-1">
                <div className="text-[10px] uppercase text-emerald-400 font-bold">
                  Earth · {selectedEarthSite.name}
                </div>
                <div className="text-slate-400 text-[10px]">
                  {selectedEarthSite.coordinates.lat.toFixed(3)}°, {selectedEarthSite.coordinates.lng.toFixed(3)}°
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <div className="w-16 h-1 bg-emerald-400 rounded-full" />
                  <span className="text-[10px] text-slate-300">5.0 km Scale</span>
                </div>
              </div>
            </div>

            {/* Right: Target Reference */}
            <div className="relative aspect-16/10 bg-[#07090E] overflow-hidden">
              <div className={`w-full h-full ${filterClass}`}>
                <ShimmerImage
                  src={targetImage}
                  alt={target.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Crosshair Target Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-cyan-400/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-cyan-400/80" />
                  <div className="absolute w-24 h-[1px] bg-cyan-400/30" />
                  <div className="absolute h-24 w-[1px] bg-cyan-400/30" />
                </div>
              </div>

              {/* Scale Bar */}
              <div className="absolute bottom-4 right-4 bg-[#090D18]/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs font-mono space-y-1 text-right">
                <div className="text-[10px] uppercase text-cyan-400 font-bold">
                  {target.body === 'moon' ? 'Moon' : 'Mars'} · {target.name}
                </div>
                <div className="text-slate-400 text-[10px]">
                  {target.coordinates.lat.toFixed(3)}°, {target.coordinates.lng.toFixed(3)}°
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-300">5.0 km Scale</span>
                  <div className="w-16 h-1 bg-cyan-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: 25km Standardized Topographic Elevation Transect */}
        {visualMode === 'elevation' && (
          <div className="p-6 bg-[#07090E] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <span className="font-light">
                Standardized 25-kilometer radial topographic transect across the centers of both locations.
              </span>
              <span className="font-mono text-[11px] text-cyan-400">
                Datum Dynamic Range: [{elevationExtremes.min}m to {elevationExtremes.max}m]
              </span>
            </div>

            <div className="w-full h-64 flex items-end gap-1 border-b border-l border-[#1F2737] p-3 relative bg-[#090D18]/70 rounded-xl overflow-hidden">
              {/* Elevation grid lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 opacity-25 text-[9px] font-mono text-slate-400">
                <div className="border-b border-slate-700 flex justify-between">
                  <span>{elevationExtremes.max} m</span>
                  <span>Upper Transect</span>
                </div>
                <div className="border-b border-slate-700 border-dashed flex justify-between">
                  <span>{Math.round((elevationExtremes.max + elevationExtremes.min) / 2)} m</span>
                  <span>Datum Mean</span>
                </div>
                <div className="flex justify-between">
                  <span>{elevationExtremes.min} m</span>
                  <span>Lower Floor</span>
                </div>
              </div>

              {/* Dynamic SVG Transect Curves */}
              <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 500 150" preserveAspectRatio="none">
                {/* Target Curve */}
                {target.elevationProfile.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="3"
                    points={target.elevationProfile
                      .map((pt, i) => {
                        const x = (i / (target.elevationProfile.length - 1)) * 500;
                        const y = 140 - ((pt.elevationM - elevationExtremes.min) / elevationExtremes.range) * 125;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Earth Candidate Curve */}
                {selectedEarthSite.elevationProfile.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3"
                    strokeDasharray="5,4"
                    points={selectedEarthSite.elevationProfile
                      .map((pt, i) => {
                        const x = (i / (selectedEarthSite.elevationProfile.length - 1)) * 500;
                        const y = 140 - ((pt.elevationM - elevationExtremes.min) / elevationExtremes.range) * 125;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ')}
                  />
                )}
              </svg>

              {/* Legend overlay */}
              <div className="absolute top-4 right-4 text-xs font-mono space-y-1.5 bg-[#0B0F17]/90 p-3 rounded-xl border border-slate-800 shadow-xl z-20">
                <div className="text-cyan-400 flex items-center gap-2">
                  <span className="w-4 h-1 bg-cyan-400 inline-block rounded" />
                  <span>{target.name} (Relief: {target.metrics.elevationReliefM}m)</span>
                </div>
                <div className="text-emerald-400 flex items-center gap-2">
                  <span className="w-4 h-1 bg-emerald-400 border-dashed inline-block" />
                  <span>{selectedEarthSite.name} (Relief: {selectedEarthSite.metrics.elevationReliefM}m)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 4: Physical Environment & Geodetic Telemetry Ledger */}
        {visualMode === 'environment' && (
          <div className="p-6 bg-[#07090E] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Surface Gravity */}
              <div className="p-4 rounded-xl bg-[#0E1321] border border-slate-800 space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400">Surface Gravity</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-emerald-400 font-mono text-sm font-bold">
                    9.81 m/s² <span className="text-[10px] text-slate-400">(1.0g)</span>
                  </div>
                  <div className="text-cyan-400 font-mono text-sm font-bold">
                    {target.body === 'moon' ? '1.62 m/s² (0.16g)' : '3.71 m/s² (0.38g)'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  {target.body === 'moon' 
                    ? 'Terrestrial mobility tests experience 6× higher ground reaction forces.' 
                    : 'Terrestrial mobility tests experience 2.6× higher ground reaction forces.'}
                </div>
              </div>

              {/* 2. Atmospheric Pressure */}
              <div className="p-4 rounded-xl bg-[#0E1321] border border-slate-800 space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400">Atmospheric Pressure</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-emerald-400 font-mono text-sm font-bold">
                    101.3 kPa
                  </div>
                  <div className="text-cyan-400 font-mono text-sm font-bold">
                    {target.body === 'moon' ? '~0 kPa (Vacuum)' : '0.61 kPa (CO₂)'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Aero-braking and parachute deceleration cannot be rehearsed under terrestrial density.
                </div>
              </div>

              {/* 3. Diurnal Temperature Swing */}
              <div className="p-4 rounded-xl bg-[#0E1321] border border-slate-800 space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400">Thermal Swing (ΔT)</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-emerald-400 font-mono text-sm font-bold">
                    Δ 30°C - 50°C
                  </div>
                  <div className="text-cyan-400 font-mono text-sm font-bold">
                    {target.body === 'moon' ? 'Δ 300°C (40K-390K)' : 'Δ 140°C (-125°C to 20°C)'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Extreme cryogenic thermal cycles induce severe mechanical material contraction.
                </div>
              </div>

              {/* 4. Surface Radiation */}
              <div className="p-4 rounded-xl bg-[#0E1321] border border-slate-800 space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400">Annual Surface Radiation</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-emerald-400 font-mono text-sm font-bold">
                    2.4 mSv/yr
                  </div>
                  <div className="text-cyan-400 font-mono text-sm font-bold">
                    {target.body === 'moon' ? '380 mSv/yr' : '240 mSv/yr'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Galactic Cosmic Rays (GCR) and SPE require regolith shielding or subsurface lava-tube siting.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Scientific Citation Footer */}
      <div className="p-3.5 bg-[#090C16] border-t border-[#182030] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            1:1 scale morphological comparison powered by NASA LOLA / MRO HiRISE &amp; Copernicus GLO-30 DEM.
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Sub-pixel georeferenced datum: WGS84 ⟷ IAU 2000
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="max-w-5xl w-full my-auto animate-in fade-in zoom-in-95 duration-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
