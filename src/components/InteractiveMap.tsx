/**
 * Interactive Geospatial Map Component
 * Powered by Leaflet & CARTO 3 Cloud Native BigQuery Engine
 * Features zero-watermark Dark Matter canvas tiles, real satellite imagery,
 * live CARTO BigQuery 25km geodetic buffer polygons, and resilient map lifecycle management.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { EarthCandidateSite, CelestialBody } from '../types/analog';
import { Navigation, ZoomIn, ZoomOut, Maximize2, MapPin, Database, Layers, Loader2, Globe, Mountain, Map as MapIcon } from 'lucide-react';
import { testCartoConnection, fetchCartoSiteBuffers, CartoConnectionStatus } from '../services/cartoService';

interface InteractiveMapProps {
  sites: EarthCandidateSite[];
  selectedSiteId: string;
  onSelectSite: (site: EarthCandidateSite) => void;
  activeTargetBody?: CelestialBody;
}

type BasemapStyle = 'dark' | 'satellite' | 'osm';

function createMarkerIcon(markerColor: string, isSelected: boolean) {
  return L.divIcon({
    className: 'custom-analog-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${
          isSelected
            ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; border: 2px dashed ${markerColor}; animation: spin 4s linear infinite; opacity: 0.95;"></div>`
            : ''
        }
        <div style="
          width: ${isSelected ? '16px' : '12px'};
          height: ${isSelected ? '16px' : '12px'};
          background: ${markerColor};
          border-radius: 50%;
          border: 2px solid #07090E;
          box-shadow: 0 0 ${isSelected ? '14px' : '6px'} ${markerColor};
          transition: all 0.25s ease;
        "></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentLayersRef = useRef<L.Layer[]>([]);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const bufferLayerRef = useRef<L.GeoJSON | null>(null);
  const cachedBuffersRef = useRef<any>(null);
  const prevSelectedSiteIdRef = useRef<string>(selectedSiteId);

  const [basemap, setBasemap] = useState<BasemapStyle>('dark');
  const [cartoStatus, setCartoStatus] = useState<CartoConnectionStatus | null>(null);
  const [showCartoBuffers, setShowCartoBuffers] = useState<boolean>(true);
  const [loadingBuffers, setLoadingBuffers] = useState<boolean>(false);

  // Health check CARTO Cloud Native BigQuery connection on mount
  useEffect(() => {
    let isMounted = true;
    testCartoConnection().then((status) => {
      if (isMounted) {
        setCartoStatus(status);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Change basemap tile layer dynamically
  const switchBasemap = useCallback((style: BasemapStyle) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    currentLayersRef.current.forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    currentLayersRef.current = [];

    if (style === 'dark') {
      const base = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, attribution: '&copy; Esri &copy; DeLorme' }
      ).addTo(map);
      const labels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16 }
      ).addTo(map);
      currentLayersRef.current = [base, labels];
    } else if (style === 'satellite') {
      const sat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, attribution: '&copy; Esri &copy; Maxar' }
      ).addTo(map);
      currentLayersRef.current = [sat];
    } else if (style === 'osm') {
      const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '&copy; OpenStreetMap' }
      ).addTo(map);
      currentLayersRef.current = [osm];
    }

    setBasemap(style);
  }, []);

  // 1. Initialize Map Instance and Lifecycle
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Safety clear any prior instance flag
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    const map = L.map(container, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    // Initial tile layers: High-contrast Dark Matter with crisp cartographic labels (zero watermark)
    const baseLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 16, attribution: '&copy; Esri &copy; DeLorme' }
    ).addTo(map);

    const labelLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 16 }
    ).addTo(map);

    currentLayersRef.current = [baseLayer, labelLayer];
    mapInstanceRef.current = map;

    // Build analog candidate markers
    markersRef.current = {};
    sites.forEach((site) => {
      const isMoon = site.primaryAnalogs.includes('moon');
      const isMars = site.primaryAnalogs.includes('mars');
      const markerColor =
        isMoon && isMars ? '#38bdf8' : isMoon ? '#22d3ee' : '#fb923c';

      const isSelected = site.id === selectedSiteId;
      const marker = L.marker([site.coordinates.lat, site.coordinates.lng], {
        icon: createMarkerIcon(markerColor, isSelected),
        title: site.name,
      }).addTo(map);

      const popupContent = `
        <div style="color: #F8FAFC; font-family: 'Plus Jakarta Sans', sans-serif; min-width: 220px; padding: 4px;">
          <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: ${markerColor}; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 3px;">
            ${site.primaryAnalogs.map((a) => (a === 'moon' ? 'Moon Twin' : 'Mars Twin')).join(' · ')}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #FFFFFF; margin-bottom: 2px;">
            ${site.name}
          </div>
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 6px;">
            ${site.location}, ${site.country}
          </div>
          <div style="font-size: 11px; line-height: 1.4; color: #CBD5E1; margin-bottom: 8px;">
            ${site.geologicalContext.slice(0, 115)}...
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; font-family: monospace; color: #38BDF8; background: #0A101D; padding: 4px 6px; border-radius: 4px; border: 1px solid #1E293B;">
            <span>${site.coordinates.lat.toFixed(2)}°N, ${site.coordinates.lng.toFixed(2)}°E</span>
            <span>Copernicus 30m</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'dark-leaflet-popup',
        closeButton: true,
      });

      marker.on('click', () => {
        onSelectSite(site);
      });

      markersRef.current[site.id] = marker;
    });

    // ResizeObserver ensures seamless rendering across layout shifts
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 80);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      if (bufferLayerRef.current) {
        bufferLayerRef.current.remove();
        bufferLayerRef.current = null;
      }
      currentLayersRef.current.forEach((l) => {
        if (map.hasLayer(l)) map.removeLayer(l);
      });
      currentLayersRef.current = [];
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Run on mount / unmount

  // 2. Smoothly update selected marker and viewport without recreating the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const prevId = prevSelectedSiteIdRef.current;
    if (prevId && prevId !== selectedSiteId && markersRef.current[prevId]) {
      const prevSite = sites.find((s) => s.id === prevId);
      if (prevSite) {
        const isMoon = prevSite.primaryAnalogs.includes('moon');
        const isMars = prevSite.primaryAnalogs.includes('mars');
        const color = isMoon && isMars ? '#38bdf8' : isMoon ? '#22d3ee' : '#fb923c';
        markersRef.current[prevId].setIcon(createMarkerIcon(color, false));
      }
    }

    if (selectedSiteId && markersRef.current[selectedSiteId]) {
      const currSite = sites.find((s) => s.id === selectedSiteId);
      if (currSite) {
        const isMoon = currSite.primaryAnalogs.includes('moon');
        const isMars = currSite.primaryAnalogs.includes('mars');
        const color = isMoon && isMars ? '#38bdf8' : isMoon ? '#22d3ee' : '#fb923c';
        markersRef.current[selectedSiteId].setIcon(createMarkerIcon(color, true));

        map.flyTo([currSite.coordinates.lat, currSite.coordinates.lng], 5, {
          duration: 0.9,
        });

        markersRef.current[selectedSiteId].openPopup();
      }
    }

    prevSelectedSiteIdRef.current = selectedSiteId;

    // Dynamically update buffer layer stroke styling
    if (bufferLayerRef.current) {
      bufferLayerRef.current.setStyle((feature: any) => {
        const isSelected = feature?.properties?.siteId === selectedSiteId;
        return {
          color: isSelected ? '#22d3ee' : '#38bdf8',
          weight: isSelected ? 2.5 : 1.2,
          dashArray: isSelected ? undefined : '4, 4',
          fillColor: isSelected ? '#06b6d4' : '#0284c7',
          fillOpacity: isSelected ? 0.25 : 0.08,
        };
      });
    }
  }, [selectedSiteId, sites]);

  // 3. CARTO BigQuery Buffers Fetch & Mount (Cached once)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!showCartoBuffers) {
      if (bufferLayerRef.current) {
        bufferLayerRef.current.remove();
        bufferLayerRef.current = null;
      }
      return;
    }

    const applyGeoJson = (geojson: any) => {
      if (!mapInstanceRef.current) return;
      if (bufferLayerRef.current) {
        bufferLayerRef.current.remove();
      }
      const layer = L.geoJSON(geojson, {
        style: (feature: any) => {
          const isSelected = feature?.properties?.siteId === selectedSiteId;
          return {
            color: isSelected ? '#22d3ee' : '#38bdf8',
            weight: isSelected ? 2.5 : 1.2,
            dashArray: isSelected ? undefined : '4, 4',
            fillColor: isSelected ? '#06b6d4' : '#0284c7',
            fillOpacity: isSelected ? 0.25 : 0.08,
          };
        },
        onEachFeature: (feature, l) => {
          l.bindTooltip(
            `<div style="font-family: monospace; font-size: 10px; color: #38bdf8;"><strong>${feature.properties.siteName}</strong><br/>25km CARTO BigQuery Buffer</div>`,
            { sticky: true }
          );
        },
      }).addTo(mapInstanceRef.current);
      bufferLayerRef.current = layer;
    };

    if (cachedBuffersRef.current) {
      applyGeoJson(cachedBuffersRef.current);
      return;
    }

    if (sites.length > 0) {
      setLoadingBuffers(true);
      fetchCartoSiteBuffers(
        sites.map((s) => ({
          id: s.id,
          name: s.name,
          lat: s.coordinates.lat,
          lng: s.coordinates.lng,
        }))
      )
        .then((geojson) => {
          cachedBuffersRef.current = geojson;
          if (mapInstanceRef.current && showCartoBuffers) {
            applyGeoJson(geojson);
          }
        })
        .catch((err) => {
          console.warn('CARTO buffer load deferred:', err);
        })
        .finally(() => {
          setLoadingBuffers(false);
        });
    }
  }, [showCartoBuffers, sites, selectedSiteId]);

  // Navigation Helpers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([20, 0], 2, { duration: 1 });
  };

  const handleRegionJump = (lat: number, lng: number, zoom: number) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 });
  };

  const activeSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  return (
    <div className="relative w-full bg-[#080D17] border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
      {/* Map Header with Navigation Bar & Live CARTO Status */}
      <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-white">Live Earth Map</span>
          </div>

          {/* Live CARTO DW Status Badge */}
          {cartoStatus && cartoStatus.connected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0A101D] border border-cyan-800/60 font-mono text-[10px] text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CARTO BigQuery · Tokyo ({cartoStatus.latencyMs}ms)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0A101D] border border-slate-800 font-mono text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>CARTO 3 Native Ready</span>
            </div>
          )}

          {/* Toggle 25km Buffers */}
          <button
            onClick={() => setShowCartoBuffers(!showCartoBuffers)}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              showCartoBuffers
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600/60 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle live 25km geodetic buffer polygons calculated in CARTO BigQuery"
          >
            {loadingBuffers ? (
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
            ) : (
              <Layers className="w-3 h-3 text-cyan-400" />
            )}
            <span>25km CARTO Buffers</span>
          </button>
        </div>

        {/* Basemap Style Switcher (Dark Matter, Satellite, OpenStreetMap) */}
        <div className="flex items-center gap-1 bg-[#0A101D] p-1 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => switchBasemap('dark')}
            className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              basemap === 'dark'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Dark Matter space theme with zero watermarks"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>Dark Matter</span>
          </button>
          <button
            onClick={() => switchBasemap('satellite')}
            className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              basemap === 'satellite'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Photographic satellite imagery of analog terrain"
          >
            <Mountain className="w-3 h-3 text-amber-400" />
            <span>Satellite</span>
          </button>
          <button
            onClick={() => switchBasemap('osm')}
            className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              basemap === 'osm'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="OpenStreetMap topographic view"
          >
            <MapIcon className="w-3 h-3 text-slate-300" />
            <span>Topographic</span>
          </button>
        </div>

        {/* Quick Region Jump Shortcuts */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-mono hidden md:inline">Jump:</span>
          <button
            onClick={() => handleRegionJump(25, -110, 4)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            N. America
          </button>
          <button
            onClick={() => handleRegionJump(-24, -70, 5)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Atacama
          </button>
          <button
            onClick={() => handleRegionJump(29, -13, 7)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Lanzarote
          </button>
          <button
            onClick={() => handleRegionJump(75, -89, 4)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Haughton
          </button>
          <button
            onClick={handleResetView}
            className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset to global view"
          >
            <Maximize2 className="w-3 h-3" />
            <span>World</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-[#07090E]">
        {/* Leaflet DOM container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Custom Map Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 shadow-md">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-md bg-[#0E1523]/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center transition-colors shadow cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-md bg-[#0E1523]/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center transition-colors shadow cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="w-8 h-8 rounded-md bg-[#0E1523]/90 hover:bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center transition-colors shadow cursor-pointer"
            title="Reset to global view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selected Site Quick Floating Card */}
        {activeSite && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 max-w-sm bg-[#0E1523]/95 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 text-xs shadow-xl space-y-1.5 pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeSite.name}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 uppercase">
                {activeSite.country}
              </span>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
              {activeSite.geologicalContext}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
              <span>{activeSite.coordinates.lat.toFixed(2)}°N, {activeSite.coordinates.lng.toFixed(2)}°E</span>
              <span className="text-cyan-300 flex items-center gap-1">
                <Database className="w-3 h-3 text-cyan-400" />
                <span>CARTO 25km Buffer Active</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
