/**
 * XORA Live Visual Comparator Component
 * Fully dynamic 1:1 Dual Interactive Map & Metric Comparison Studio:
 * Selected Earth Place vs Moon or Mars
 * 
 * 100% Dynamic - Zero Static Image Dependencies
 * 1. Live Interactive Earth Satellite Map (with Google Earth 3D launcher)
 * 2. Live Interactive Moon & Mars Planetary Map (OpenPlanetary / USGS with NASA Trek 3D launcher)
 * 3. Precision Split-World Scrubber
 * 4. Multi-Metric Bar Charts (Elevation, Slope, Roughness, Thermal, Atmosphere, Gravity)
 * 5. 25km Standardized Elevation Transect Profile
 * 6. Reality Check Ledger & Operational Boundaries
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { PlanetaryReferenceSite, EarthCandidateSite, CelestialBody } from '../types/analog';
import { PLANETARY_REFERENCES } from '../data/planetaryReferences';
import { getTerrainImage } from '../data/terrainImages';
import { 
  SlidersHorizontal, 
  Columns, 
  Activity, 
  BarChart2, 
  Gauge, 
  MapPin, 
  Sparkles, 
  Compass, 
  Maximize2, 
  Minimize2, 
  X,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Rocket,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw
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

type VisualMode = 'sideBySide' | 'split' | 'charts' | 'elevation' | 'environment';
type EarthBasemapStyle = 'satellite' | 'dark' | 'topo';

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

  // Default to dual interactive maps mode
  const [visualMode, setVisualMode] = useState<VisualMode>('sideBySide');
  const [earthBasemap, setEarthBasemap] = useState<EarthBasemapStyle>('satellite');
  const [scrubberPos, setScrubberPos] = useState<number>(50); // 0-100%
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Left: Earth Leaflet Map Refs
  const earthMapContainerRef = useRef<HTMLDivElement>(null);
  const earthMapInstanceRef = useRef<L.Map | null>(null);
  const earthTileLayerRef = useRef<L.TileLayer | null>(null);

  // Right: Planetary (Moon/Mars) Leaflet Map Refs
  const targetMapContainerRef = useRef<HTMLDivElement>(null);
  const targetMapInstanceRef = useRef<L.Map | null>(null);
  const targetTileLayerRef = useRef<L.TileLayer | null>(null);

  // Split Mode Map Refs
  const splitEarthContainerRef = useRef<HTMLDivElement>(null);
  const splitTargetContainerRef = useRef<HTMLDivElement>(null);
  const splitEarthMapInstanceRef = useRef<L.Map | null>(null);
  const splitTargetMapInstanceRef = useRef<L.Map | null>(null);

  // Synchronize target when activeTarget prop changes
  useEffect(() => {
    if (activeTarget) {
      setSelectedBody(activeTarget.body);
      setCurrentTargetId(activeTarget.id);
    }
  }, [activeTarget]);

  // Keep track of container width for scrubber
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

  // 1. Mount & Synchronize Earth Leaflet Map (Left Side)
  useEffect(() => {
    if (visualMode !== 'sideBySide') {
      if (earthMapInstanceRef.current) {
        earthMapInstanceRef.current.remove();
        earthMapInstanceRef.current = null;
      }
      return;
    }

    const mapEl = earthMapContainerRef.current;
    if (!mapEl) return;

    if ((mapEl as any)._leaflet_id) {
      delete (mapEl as any)._leaflet_id;
    }

    const lat = customPoint ? customPoint.lat : selectedEarthSite.coordinates.lat;
    const lng = customPoint ? customPoint.lng : selectedEarthSite.coordinates.lng;

    // Zoom level 8 provides panoramic regional coverage of craters, salars, and dunes without empty tile errors
    const map = L.map(mapEl, {
      center: [lat, lng],
      zoom: 8,
      minZoom: 2,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Basemap tile selection
    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    if (earthBasemap === 'dark') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    } else if (earthBasemap === 'topo') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    const tileLayer = L.tileLayer(tileUrl, { maxZoom: 16 }).addTo(map);
    earthTileLayerRef.current = tileLayer;

    // Label layer for satellite mode
    if (earthBasemap === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, opacity: 0.7 }
      ).addTo(map);
    }

    // Centered targeting crosshair
    const crosshairIcon = L.divIcon({
      className: 'earth-crosshair-icon',
      html: `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; border: 2px dashed #10B981; animation: spin 8s linear infinite; opacity: 0.85;"></div>
          <div style="width: 10px; height: 10px; background: #10B981; border: 2px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 10px #10B981;"></div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });
    L.marker([lat, lng], { icon: crosshairIcon }).addTo(map);

    earthMapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(timer);
      map.remove();
      earthMapInstanceRef.current = null;
    };
  }, [visualMode, selectedEarthSite, customPoint, earthBasemap]);

  // 2. Mount & Synchronize Planetary Leaflet Map (Right Side - Moon or Mars)
  useEffect(() => {
    if (visualMode !== 'sideBySide') {
      if (targetMapInstanceRef.current) {
        targetMapInstanceRef.current.remove();
        targetMapInstanceRef.current = null;
      }
      return;
    }

    const targetEl = targetMapContainerRef.current;
    if (!targetEl) return;

    if ((targetEl as any)._leaflet_id) {
      delete (targetEl as any)._leaflet_id;
    }

    const { lat, lng } = target.coordinates;
    const isMoon = target.body === 'moon';

    const map = L.map(targetEl, {
      center: [lat, lng],
      zoom: 3,
      minZoom: 1,
      maxZoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    // Real OpenPlanetary / USGS Astrogeology Planetary Tile Layers (Verified HTTP 200 OK)
    const planetaryTileUrl = isMoon
      ? 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-moon-basemap-v0-1/all/{z}/{x}/{y}.png'
      : 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(planetaryTileUrl, {
      maxZoom: 7,
      minZoom: 1,
      attribution: isMoon ? 'USGS / NASA LRO LOLA' : 'USGS / NASA Mars Viking MDIM',
    }).addTo(map);
    targetTileLayerRef.current = tileLayer;

    // Glowing planetary target crosshair
    const targetColor = isMoon ? '#22D3EE' : '#FB923C';
    const targetIcon = L.divIcon({
      className: 'target-crosshair-icon',
      html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; border: 2px dashed ${targetColor}; animation: spin 6s linear infinite; opacity: 0.9;"></div>
          <div style="width: 12px; height: 12px; background: ${targetColor}; border: 2px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 12px ${targetColor};"></div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });
    L.marker([lat, lng], { icon: targetIcon }).addTo(map);

    targetMapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(timer);
      map.remove();
      targetMapInstanceRef.current = null;
    };
  }, [visualMode, target]);

  // 3. Mount & Synchronize Dual Stacked Split Scrubber Leaflet Maps
  useEffect(() => {
    if (visualMode !== 'split') {
      if (splitEarthMapInstanceRef.current) {
        splitEarthMapInstanceRef.current.remove();
        splitEarthMapInstanceRef.current = null;
      }
      if (splitTargetMapInstanceRef.current) {
        splitTargetMapInstanceRef.current.remove();
        splitTargetMapInstanceRef.current = null;
      }
      return;
    }

    const earthEl = splitEarthContainerRef.current;
    const targetEl = splitTargetContainerRef.current;

    const lat = customPoint ? customPoint.lat : selectedEarthSite.coordinates.lat;
    const lng = customPoint ? customPoint.lng : selectedEarthSite.coordinates.lng;

    if (earthEl) {
      if ((earthEl as any)._leaflet_id) {
        delete (earthEl as any)._leaflet_id;
      }

      const earthMap = L.map(earthEl, {
        center: [lat, lng],
        zoom: 8,
        minZoom: 2,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      if (earthBasemap === 'dark') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      } else if (earthBasemap === 'topo') {
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      }

      L.tileLayer(tileUrl, { maxZoom: 16 }).addTo(earthMap);

      if (earthBasemap === 'satellite') {
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 16, opacity: 0.7 }
        ).addTo(earthMap);
      }

      const earthCrosshair = L.divIcon({
        className: 'split-earth-crosshair',
        html: `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; border: 2px dashed #10B981; animation: spin 8s linear infinite; opacity: 0.85;"></div>
            <div style="width: 10px; height: 10px; background: #10B981; border: 2px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 10px #10B981;"></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });
      L.marker([lat, lng], { icon: earthCrosshair }).addTo(earthMap);
      splitEarthMapInstanceRef.current = earthMap;
    }

    if (targetEl) {
      if ((targetEl as any)._leaflet_id) {
        delete (targetEl as any)._leaflet_id;
      }

      const isMoon = target.body === 'moon';
      const targetMap = L.map(targetEl, {
        center: [target.coordinates.lat, target.coordinates.lng],
        zoom: 3,
        minZoom: 1,
        maxZoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      const planetaryTileUrl = isMoon
        ? 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-moon-basemap-v0-1/all/{z}/{x}/{y}.png'
        : 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png';

      L.tileLayer(planetaryTileUrl, {
        maxZoom: 7,
        minZoom: 1,
        attribution: isMoon ? 'USGS / NASA LRO LOLA' : 'USGS / NASA Mars Viking MDIM',
      }).addTo(targetMap);

      const targetColor = isMoon ? '#22D3EE' : '#FB923C';
      const targetCrosshair = L.divIcon({
        className: 'split-target-crosshair',
        html: `
          <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; border: 2px dashed ${targetColor}; animation: spin 6s linear infinite; opacity: 0.9;"></div>
            <div style="width: 12px; height: 12px; background: ${targetColor}; border: 2px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 12px ${targetColor};"></div>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });
      L.marker([target.coordinates.lat, target.coordinates.lng], { icon: targetCrosshair }).addTo(targetMap);
      splitTargetMapInstanceRef.current = targetMap;
    }

    const timer = setTimeout(() => {
      splitEarthMapInstanceRef.current?.invalidateSize();
      splitTargetMapInstanceRef.current?.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(timer);
      if (splitEarthMapInstanceRef.current) {
        splitEarthMapInstanceRef.current.remove();
        splitEarthMapInstanceRef.current = null;
      }
      if (splitTargetMapInstanceRef.current) {
        splitTargetMapInstanceRef.current.remove();
        splitTargetMapInstanceRef.current = null;
      }
    };
  }, [visualMode, selectedEarthSite, customPoint, target, earthBasemap]);

  // Elevation range bounds
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

  const earthTileImage = useMemo(() => {
    return getTerrainImage(
      selectedEarthSite.id,
      selectedEarthSite.demImageUrl,
      selectedEarthSite.metrics.geologicalClass
    );
  }, [selectedEarthSite]);

  const targetTileImage = useMemo(() => {
    return getTerrainImage(target.id, target.demImageUrl);
  }, [target]);

  // Deep-link URLs for real dynamic inspection tools
  const googleEarthUrl = useMemo(() => {
    const lat = customPoint ? customPoint.lat : selectedEarthSite.coordinates.lat;
    const lng = customPoint ? customPoint.lng : selectedEarthSite.coordinates.lng;
    return `https://earth.google.com/web/@${lat.toFixed(6)},${lng.toFixed(6)},2500a,35y,0h,0t,0r`;
  }, [selectedEarthSite, customPoint]);

  const nasaTrekUrl = useMemo(() => {
    const { lat, lng } = target.coordinates;
    if (target.body === 'moon') {
      return `https://trek.nasa.gov/moon/#v=0.1&x=${lng.toFixed(4)}&y=${lat.toFixed(4)}&z=6&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104903`;
    }
    return `https://trek.nasa.gov/mars/#v=0.1&x=${lng.toFixed(4)}&y=${lat.toFixed(4)}&z=5&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905`;
  }, [target]);

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
    <div className={`flex flex-col bg-[#080B12] border border-cyan-900/40 rounded-2xl overflow-hidden shadow-2xl text-[#F8FAFC] ${
      isFullscreen ? 'fixed inset-3 z-50 rounded-2xl' : 'relative w-full'
    }`}>
      {/* 1. Header Bar with Dynamic Deep-Link Launchers */}
      <div className="p-4 sm:p-5 bg-[#0C101C] border-b border-[#182030] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Dual Planetary Map Visualizer
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              100% Dynamic Maps
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-emerald-300">
                {customPoint ? customPoint.label || `Custom Earth Point (${customPoint.lat.toFixed(2)}°, ${customPoint.lng.toFixed(2)}°)` : selectedEarthSite.name}
              </span>
              <span className="text-slate-500 font-normal">⟷</span>
              <span className={target.body === 'moon' ? 'text-cyan-300' : 'text-amber-300'}>
                {target.name} ({target.body === 'moon' ? 'Moon' : 'Mars'})
              </span>
            </h2>
          </div>
        </div>

        {/* Dynamic Launch Badges & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Real Google Earth 3D Link */}
          <a
            href={googleEarthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-600/50 text-emerald-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
            title="Launch high-resolution 3D view in Google Earth Web"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Earth 3D</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          {/* Real NASA Trek Link */}
          <a
            href={nasaTrekUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] border ${
              target.body === 'moon'
                ? 'bg-cyan-950/70 hover:bg-cyan-900/90 border-cyan-600/50 text-cyan-200'
                : 'bg-amber-950/70 hover:bg-amber-900/90 border-amber-600/50 text-amber-200'
            }`}
            title={`Explore target coordinates in NASA ${target.body === 'moon' ? 'Moon' : 'Mars'} Trek 3D`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>NASA {target.body === 'moon' ? 'Moon' : 'Mars'} Trek</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

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
        {/* Celestial Body Toggle */}
        <div className="inline-flex rounded-lg p-0.5 bg-[#141C2B] border border-slate-800 text-xs font-mono mr-2 shrink-0">
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

        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>NASA Reference:</span>
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

      {/* 3. Comparator Mode Navigation Bar */}
      <div className="px-4 py-2 bg-[#0A0E18] border-b border-[#182030] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-[#06080E] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setVisualMode('sideBySide')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              visualMode === 'sideBySide'
                ? 'bg-[#1C2538] text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dual Live Maps (Earth &amp; {target.body === 'moon' ? 'Moon' : 'Mars'})</span>
          </button>
          <button
            onClick={() => setVisualMode('charts')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              visualMode === 'charts'
                ? 'bg-[#1C2538] text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Metric Bar Charts</span>
          </button>
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
            <span>Reality Check Ledger</span>
          </button>
        </div>

        {/* Earth Basemap Switcher (when in sideBySide mode) */}
        {visualMode === 'sideBySide' && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Earth Layer:</span>
            <div className="inline-flex rounded-md p-0.5 bg-[#06080E] border border-slate-800">
              <button
                onClick={() => setEarthBasemap('satellite')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  earthBasemap === 'satellite'
                    ? 'bg-[#1C2538] text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setEarthBasemap('dark')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  earthBasemap === 'dark'
                    ? 'bg-[#1C2538] text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark Canvas
              </button>
              <button
                onClick={() => setEarthBasemap('topo')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  earthBasemap === 'topo'
                    ? 'bg-[#1C2538] text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Topo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3.5 Quick Plain-English Explanation Banner */}
      <div className="px-4 py-2 bg-[#080C16] border-b border-[#141C2B] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            {visualMode === 'sideBySide' && (
              <>
                <strong>Dual Live Map Mode:</strong> Left is <strong>{selectedEarthSite.name} (Earth)</strong> in satellite view. Right is <strong>{target.name} ({target.body === 'moon' ? 'Moon' : 'Mars'})</strong> in orbital USGS/NASA view. Drag or zoom either map to explore!
              </>
            )}
            {visualMode === 'charts' && (
              <>
                <strong>Metric Bar Charts Mode:</strong> Quantitative comparisons for elevation relief, slopes, roughness, thermal swings, surface gravity, and atmospheric pressure.
              </>
            )}
            {visualMode === 'split' && (
              <>
                <strong>Split Slider Mode:</strong> Drag the central cyan bar left or right to peel back the Moon/Mars terrain and reveal the Earth analog twin directly underneath.
              </>
            )}
            {visualMode === 'elevation' && (
              <>
                <strong>25km Transect Profile Mode:</strong> Standardized cross-sectional elevation slice plotted across both terrains to inspect slope contours and craters.
              </>
            )}
            {visualMode === 'environment' && (
              <>
                <strong>Reality Check Ledger:</strong> Physical boundaries where Earth conditions diverge from space (atmospheric pressure, vacuum, radiation, and gravity).
              </>
            )}
          </span>
        </div>
        <div className="text-[10px] font-mono text-cyan-400 hidden sm:block">
          Target: {target.body === 'moon' ? 'Lunar Surface (1.62 m/s²)' : 'Martian Surface (3.71 m/s²)'}
        </div>
      </div>

      {/* 4. Visual Stage Area */}
      <div className="relative bg-[#05070B] overflow-hidden select-none min-h-[460px]">
        {/* MODE 1: DUAL LIVE INTERACTIVE MAPS (EARTH MAP & PLANETARY MAP) */}
        {visualMode === 'sideBySide' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Left: Earth Interactive Map */}
            <div className="relative h-[440px] sm:h-[500px] bg-[#07090E] overflow-hidden flex flex-col">
              <div ref={earthMapContainerRef} className="w-full h-full z-0" />

              {/* Top overlay badge */}
              <div className="absolute top-3 left-3 z-10 bg-[#090D18]/90 backdrop-blur-md border border-emerald-500/50 rounded-lg px-2.5 py-1 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 shadow">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Earth Map ({earthBasemap === 'satellite' ? 'Global Satellite' : earthBasemap === 'dark' ? 'Dark Matter' : 'Topographic'})</span>
              </div>

              {/* Map Zoom / Reset controls */}
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 shadow">
                <button
                  onClick={() => earthMapInstanceRef.current?.zoomIn()}
                  className="w-7 h-7 rounded bg-[#090D18]/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => earthMapInstanceRef.current?.zoomOut()}
                  className="w-7 h-7 rounded bg-[#090D18]/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const lat = customPoint ? customPoint.lat : selectedEarthSite.coordinates.lat;
                    const lng = customPoint ? customPoint.lng : selectedEarthSite.coordinates.lng;
                    earthMapInstanceRef.current?.flyTo([lat, lng], 8);
                  }}
                  className="w-7 h-7 rounded bg-[#090D18]/90 hover:bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center text-xs cursor-pointer"
                  title="Reset to Site Center"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Bottom Telemetry Card */}
              <div className="absolute bottom-3 left-3 right-3 z-10 bg-[#090D18]/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs font-mono flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase text-emerald-400 font-bold">
                    Earth · {selectedEarthSite.name}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    {selectedEarthSite.coordinates.lat.toFixed(4)}°, {selectedEarthSite.coordinates.lng.toFixed(4)}° · Elevation: {selectedEarthSite.metrics.elevationReliefM}m relief
                  </div>
                </div>
                <a
                  href={googleEarthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-[11px] hover:bg-emerald-400 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Google Earth 3D</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Right: Planetary (Moon or Mars) Interactive Map */}
            <div className="relative h-[440px] sm:h-[500px] bg-[#07090E] overflow-hidden flex flex-col">
              <div ref={targetMapContainerRef} className="w-full h-full z-0" />

              {/* Top overlay badge */}
              <div className={`absolute top-3 left-3 z-10 bg-[#090D18]/90 backdrop-blur-md border rounded-lg px-2.5 py-1 text-[11px] font-mono flex items-center gap-1.5 shadow ${
                target.body === 'moon' ? 'border-cyan-500/50 text-cyan-300' : 'border-amber-500/50 text-amber-300'
              }`}>
                <Rocket className="w-3.5 h-3.5" />
                <span>Live {target.body === 'moon' ? 'Moon Map (OpenPlanetary / LRO LOLA)' : 'Mars Map (OpenPlanetary / Viking MDIM)'}</span>
              </div>

              {/* Map Zoom / Reset controls */}
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 shadow">
                <button
                  onClick={() => targetMapInstanceRef.current?.zoomIn()}
                  className="w-7 h-7 rounded bg-[#090D18]/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => targetMapInstanceRef.current?.zoomOut()}
                  className="w-7 h-7 rounded bg-[#090D18]/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    targetMapInstanceRef.current?.flyTo([target.coordinates.lat, target.coordinates.lng], 3);
                  }}
                  className={`w-7 h-7 rounded bg-[#090D18]/90 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-xs cursor-pointer ${
                    target.body === 'moon' ? 'text-cyan-400' : 'text-amber-400'
                  }`}
                  title="Reset to Target Center"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Bottom Telemetry Card */}
              <div className="absolute bottom-3 left-3 right-3 z-10 bg-[#090D18]/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs font-mono flex items-center justify-between gap-2">
                <div>
                  <div className={`text-[10px] uppercase font-bold ${target.body === 'moon' ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {target.body === 'moon' ? 'Moon' : 'Mars'} · {target.name}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    {target.coordinates.lat.toFixed(4)}°, {target.coordinates.lng.toFixed(4)}° · Relief: {target.metrics.elevationReliefM}m
                  </div>
                </div>
                <a
                  href={nasaTrekUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                    target.body === 'moon'
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  }`}
                >
                  <span>NASA Trek 3D</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: Multi-Metric Bar Charts */}
        {visualMode === 'charts' && (
          <div className="p-6 bg-[#07090E] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <span>Physical Dimension &amp; Environmental Comparison Bar Charts</span>
                </h3>
                <p className="text-xs text-slate-400 font-light mt-0.5">
                  Direct quantitative comparisons between the selected Earth site and the NASA destination.
                </p>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span>Earth ({selectedEarthSite.name})</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-3 rounded bg-cyan-500" />
                  <span>Target ({target.name})</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Elevation Relief Bar Chart */}
              <div className="p-4 rounded-xl bg-[#0C111E] border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Total Topographic Relief</span>
                  <span className="font-mono text-slate-400">Meters (Peak to Base)</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-emerald-400">Earth: {selectedEarthSite.metrics.elevationReliefM} m</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (selectedEarthSite.metrics.elevationReliefM / Math.max(selectedEarthSite.metrics.elevationReliefM, target.metrics.elevationReliefM, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-cyan-400">{target.body === 'moon' ? 'Moon' : 'Mars'}: {target.metrics.elevationReliefM} m</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (target.metrics.elevationReliefM / Math.max(selectedEarthSite.metrics.elevationReliefM, target.metrics.elevationReliefM, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  {selectedEarthSite.metrics.elevationReliefM > target.metrics.elevationReliefM
                    ? 'The Earth site features higher vertical slopes, providing an extra challenge for rover traction and climb testing.'
                    : 'The target destination features deeper craters or cliffs than the Earth site, requiring simulated steeper descents.'}
                </p>
              </div>

              {/* 2. Slope Gradient Bar Chart */}
              <div className="p-4 rounded-xl bg-[#0C111E] border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Slope Incline Gradient</span>
                  <span className="font-mono text-slate-400">Degrees (°)</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-emerald-400">Earth: {selectedEarthSite.metrics.slopeMeanDeg.toFixed(1)}°</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (selectedEarthSite.metrics.slopeMeanDeg / 35) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-cyan-400">{target.body === 'moon' ? 'Moon' : 'Mars'}: {target.metrics.slopeMeanDeg.toFixed(1)}°</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (target.metrics.slopeMeanDeg / 35) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Standard planetary rovers (like Curiosity and Perseverance) are rated for slopes up to 25°–30°. Both sites fall within operable traverse limits.
                </p>
              </div>

              {/* 3. Surface Roughness (10m Scale) */}
              <div className="p-4 rounded-xl bg-[#0C111E] border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Surface Roughness &amp; Hazards</span>
                  <span className="font-mono text-slate-400">RMS Height Deviation (m)</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-emerald-400">Earth: {selectedEarthSite.metrics.roughnessRmsM.toFixed(2)} m</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (selectedEarthSite.metrics.roughnessRmsM / 5) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-cyan-400">{target.body === 'moon' ? 'Moon' : 'Mars'}: {target.metrics.roughnessRmsM.toFixed(2)} m</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (target.metrics.roughnessRmsM / 5) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Measures meter-scale rock abundance and boulder fields. Essential for testing autonomous hazard avoidance cameras (HazCams).
                </p>
              </div>

              {/* 4. Thermal Swing Extremes */}
              <div className="p-4 rounded-xl bg-[#0C111E] border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Day-to-Night Thermal Swing (ΔT)</span>
                  <span className="font-mono text-slate-400">Temperature Delta</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-emerald-400">Earth: Δ ~40°C</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-cyan-400">
                        {target.body === 'moon' ? 'Moon: Δ ~350°C (40K to 390K)' : 'Mars: Δ ~140°C (-125°C to 20°C)'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: target.body === 'moon' ? '100%' : '45%' }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  {target.body === 'moon'
                    ? 'The Moon lacks an atmosphere, creating extreme swings from cryogenic cold in shadowed craters to scorching heat in direct sunlight.'
                    : 'The thin Martian atmosphere allows fast heat loss at night, requiring radioisotope thermal heaters (RHUs) on rovers.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: Precision Split-World Scrubber (Dual Live Stacked Leaflet Maps) */}
        {visualMode === 'split' && (
          <div className="relative flex flex-col bg-[#07080D]">
            {/* Quick preset selector and telemetry bar */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#090D18] border-b border-slate-800 text-xs gap-2">
              <div className="flex items-center gap-2 text-slate-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-[11px]">
                  Scrubber Split: <strong className={target.body === 'moon' ? 'text-cyan-300' : 'text-amber-300'}>{scrubberPos.toFixed(0)}% {target.body === 'moon' ? 'Moon' : 'Mars'}</strong> / <strong className="text-emerald-300">{(100 - scrubberPos).toFixed(0)}% Earth</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-slate-500 hidden sm:inline">Presets:</span>
                <button
                  type="button"
                  onClick={() => setScrubberPos(25)}
                  className={`px-2.5 py-0.5 rounded cursor-pointer border transition-colors ${
                    scrubberPos === 25
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => setScrubberPos(50)}
                  className={`px-2.5 py-0.5 rounded cursor-pointer border transition-colors ${
                    scrubberPos === 50
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  50% (Split)
                </button>
                <button
                  type="button"
                  onClick={() => setScrubberPos(75)}
                  className={`px-2.5 py-0.5 rounded cursor-pointer border transition-colors ${
                    scrubberPos === 75
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  75%
                </button>
              </div>
            </div>

            {/* Main Interactive Drag Stage */}
            <div
              ref={containerRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className="relative w-full h-[460px] sm:h-[520px] bg-[#07080D] cursor-ew-resize overflow-hidden touch-none select-none"
            >
              {/* Layer 1 (Base): Live Earth Satellite Leaflet Map */}
              <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
                <div ref={splitEarthContainerRef} className="w-full h-full" />
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 shadow">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      splitEarthMapInstanceRef.current?.zoomIn();
                    }}
                    className="w-7 h-7 rounded bg-[#090D18]/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs pointer-events-auto cursor-pointer"
                    title="Zoom In Earth"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      splitEarthMapInstanceRef.current?.zoomOut();
                    }}
                    className="w-7 h-7 rounded bg-[#090D18]/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs pointer-events-auto cursor-pointer"
                    title="Zoom Out Earth"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-4 right-4 bg-[#090D18]/90 backdrop-blur-md border border-emerald-500/40 rounded-xl p-3 text-right shadow-2xl pointer-events-auto z-20 space-y-1">
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
                  <div className="pt-1 flex justify-end">
                    <a
                      href={googleEarthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 transition-colors"
                    >
                      <span>Google Earth 3D</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Layer 2 (Clipped Overlay): Live Planetary Reference Map (Moon/Mars) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden z-10 pointer-events-none select-none"
                style={{
                  clipPath: `polygon(0 0, ${scrubberPos}% 0, ${scrubberPos}% 100%, 0 100%)`,
                }}
              >
                <div ref={splitTargetContainerRef} className="w-full h-full" />
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 shadow">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      splitTargetMapInstanceRef.current?.zoomIn();
                    }}
                    className="w-7 h-7 rounded bg-[#090D18]/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs pointer-events-auto cursor-pointer"
                    title={`Zoom In ${target.body === 'moon' ? 'Moon' : 'Mars'}`}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      splitTargetMapInstanceRef.current?.zoomOut();
                    }}
                    className="w-7 h-7 rounded bg-[#090D18]/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs pointer-events-auto cursor-pointer"
                    title={`Zoom Out ${target.body === 'moon' ? 'Moon' : 'Mars'}`}
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 bg-[#090D18]/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl pointer-events-auto z-20 space-y-1">
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
                  <div className="pt-1 flex">
                    <a
                      href={nasaTrekUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono transition-colors ${
                        target.body === 'moon'
                          ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40 text-cyan-300'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      <span>NASA Trek 3D</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Draggable Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.95)] pointer-events-none z-30"
                style={{ left: `${scrubberPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#0B0F17] border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.7)] pointer-events-auto cursor-ew-resize">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div className="absolute top-4 -translate-x-1/2 bg-[#0B0F17]/95 px-2.5 py-1 rounded-full border border-cyan-500/50 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-xl">
                  {scrubberPos.toFixed(0)}% / {(100 - scrubberPos).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 4: 25km Topographic Elevation Transect Profile */}
        {visualMode === 'elevation' && (
          <div className="p-6 bg-[#07090E] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <span className="font-light">
                Standardized 25-kilometer radial topographic transect across the center of both sites.
              </span>
              <span className="font-mono text-[11px] text-cyan-400">
                Dynamic Datum Range: [{elevationExtremes.min}m to {elevationExtremes.max}m]
              </span>
            </div>

            <div className="w-full h-64 flex items-end gap-1 border-b border-l border-[#1F2737] p-3 relative bg-[#090D18]/70 rounded-xl overflow-hidden">
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

              {/* Dynamic SVG Curves */}
              <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 500 150" preserveAspectRatio="none">
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

        {/* MODE 5: Reality Check Ledger & Environmental Limits */}
        {visualMode === 'environment' && (
          <div className="p-6 bg-[#07090E] space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>The Reality Check: What Earth Analogs Can and Cannot Reproduce</span>
              </h3>
              <p className="text-xs text-slate-400 font-light">
                No location on Earth is an identical replica of the Moon or Mars. Recognizing physical boundaries is crucial for mission success.
              </p>
            </div>

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
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  {target.body === 'moon'
                    ? 'Wheels exert 6× more downward pressure on Earth. Engineers use off-loading helium balloons or counterweight cranes to test wheel slip.'
                    : 'Rovers feel 2.6× heavier on Earth. Suspension tests here stress components more than on Mars.'}
                </p>
              </div>

              {/* 2. Atmospheric Pressure */}
              <div className="p-4 rounded-xl bg-[#0E1321] border border-slate-800 space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400">Atmospheric Density</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-emerald-400 font-mono text-sm font-bold">
                    101.3 kPa
                  </div>
                  <div className="text-cyan-400 font-mono text-sm font-bold">
                    {target.body === 'moon' ? '~0 kPa (Hard Vacuum)' : '0.61 kPa (Thin CO₂)'}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Aerodynamic braking and drone flight (like Ingenuity) require high rotor RPM (2,500+ rpm) to generate lift in Mars's razor-thin air.
                </p>
              </div>

              {/* 3. Extreme Vacuum / Thermal */}
              <div className="p-4 rounded-xl bg-[#0E1321] border border-slate-800 space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400">Sublimation &amp; Ice Stability</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-emerald-400 font-mono text-sm font-bold">
                    Stable Liquid Water
                  </div>
                  <div className="text-cyan-400 font-mono text-sm font-bold">
                    Instant Sublimation
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Pure liquid water boils away instantly on Mars and the Moon. Ice transitions directly from solid to vapor unless shielded under regolith.
                </p>
              </div>

              {/* 4. Cosmic Radiation */}
              <div className="p-4 rounded-xl bg-[#0E1321] border border-slate-800 space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400">Annual Radiation Exposure</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-emerald-400 font-mono text-sm font-bold">
                    2.4 mSv/yr
                  </div>
                  <div className="text-cyan-400 font-mono text-sm font-bold">
                    {target.body === 'moon' ? '380 mSv/yr' : '240 mSv/yr'}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Earth's magnetosphere and thick atmosphere shield us from solar storms and cosmic rays. Lunar and Mars habitats must be buried under 2–3 meters of soil or inside lava tubes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Scientific Citation Footer */}
      <div className="p-3.5 bg-[#070A12] border-t border-[#182030] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Real-time planetary georeference: Copernicus 30m Digital Elevation Model · NASA LRO LOLA · MGS MOLA MEGDR.
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Open planetary science data provided by NASA, ESA, and USGS Astrogeology.
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
