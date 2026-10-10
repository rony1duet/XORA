/**
 * XORA: EARTH · MOON · MARS
 * Explore Beyond Earth.
 * Discover Earth's hidden analogs. Prepare for humanity's next worlds.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { CompareView } from './views/CompareView';
import { SiteProfileView } from './views/SiteProfileView';
import { RankingsView } from './views/RankingsView';
import { MethodologyView } from './views/MethodologyView';
import { DataSourcesView } from './views/DataSourcesView';
import { ReportsView } from './views/ReportsView';
import { CelestialBody } from './types/analog';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [shortlist, setShortlist] = useState<string[]>(['atacama-yungay', 'haughton-crater']);

  // Synchronize state with URL hash on mount & hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      const [path, queryString] = hash.split('?');
      const params: Record<string, string> = {};

      if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((val, key) => {
          params[key] = val;
        });
      }

      setCurrentRoute(path || 'home');
      setRouteParams(params);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation helper
  const navigate = (route: string, params?: Record<string, string>) => {
    let hash = `#${route}`;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      hash += `?${searchParams.toString()}`;
    }
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleShortlist = (siteId: string) => {
    setShortlist((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E] text-[#F8FAFC] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Navigation */}
      <Navbar currentRoute={currentRoute} navigate={navigate} />

      {/* Main View Stage */}
      <main className="flex-1 w-full">
        {currentRoute === 'home' && (
          <HomeView onNavigate={navigate} />
        )}

        {currentRoute === 'explore' && (
          <ExploreView
            initialBody={(routeParams.body as CelestialBody) || 'mars'}
            onNavigate={navigate}
            shortlist={shortlist}
            onToggleShortlist={toggleShortlist}
          />
        )}

        {currentRoute === 'compare' && (
          <CompareView
            initialRefId={routeParams.ref || 'mars-jezero-crater'}
            initialEarthId={routeParams.earth || 'atacama-yungay'}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'sites' && (
          <SiteProfileView
            siteId={routeParams.id || 'atacama-yungay'}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'rankings' && (
          <RankingsView
            onNavigate={navigate}
            shortlist={shortlist}
            onToggleShortlist={toggleShortlist}
          />
        )}

        {currentRoute === 'methodology' && <MethodologyView />}

        {currentRoute === 'data-sources' && <DataSourcesView />}

        {currentRoute === 'reports' && (
          <ReportsView shortlist={shortlist} onNavigate={navigate} />
        )}
      </main>

      {/* Modern Refined Footer */}
      <footer className="border-t border-[#182030] bg-[#06080F] pt-16 pb-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Main 4-Column Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Column 1: Brand & Scientific Identity (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-lg font-black tracking-widest text-white uppercase font-sans">
                  XORA
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] font-mono tracking-wider text-cyan-400 uppercase">
                  Earth · Moon · Mars
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-light">
                An open planetary terrain intelligence platform matching lunar base habitats and Mars rover landing regions with calibrated terrestrial proving grounds.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0E1524] border border-slate-800 text-[10px] font-mono text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>NASA PDS & Copernicus Baselines</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#0E1524] border border-slate-800 text-[10px] font-mono text-slate-400">
                  v2.4 Production
                </span>
              </div>
            </div>

            {/* Column 2: Interactive Atlas (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold">
                Interactive Atlas
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => navigate('explore')} className="hover:text-cyan-300 transition-colors cursor-pointer text-slate-400">
                    Proving Grounds Map
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('compare')} className="hover:text-cyan-300 transition-colors cursor-pointer text-slate-400">
                    Split-World Scrubber
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('rankings')} className="hover:text-cyan-300 transition-colors cursor-pointer text-slate-400">
                    Twin Leaderboard
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('explore', { body: 'moon' })} className="hover:text-cyan-300 transition-colors cursor-pointer text-slate-400">
                    Lunar Artemis Baselines
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('explore', { body: 'mars' })} className="hover:text-cyan-300 transition-colors cursor-pointer text-slate-400">
                    Martian Rover Traverses
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Science & Methodology (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold">
                Science &amp; Standards
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => navigate('methodology')} className="hover:text-cyan-300 transition-colors cursor-pointer text-slate-400">
                    Mathematical Methodology
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('data-sources')} className="hover:text-cyan-300 transition-colors cursor-pointer text-slate-400">
                    Remote Sensing Catalog
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('reports')} className="hover:text-cyan-300 transition-colors cursor-pointer text-slate-400">
                    Evaluation Reports &amp; CSV
                  </button>
                </li>
                <li>
                  <span className="text-slate-500 font-mono text-[11px] block pt-1">
                    Wasserstein Slope CDF · 10m RMS Roughness
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 4: Architecture Framework (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold">
                Architecture
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-400">
                <div className="text-slate-300"><span className="text-cyan-400 font-bold">X</span> — eXploration</div>
                <div className="text-slate-300"><span className="text-cyan-400 font-bold">O</span> — Orbital Altimetry</div>
                <div className="text-slate-300"><span className="text-cyan-400 font-bold">R</span> — Rigorous Analysis</div>
                <div className="text-slate-300"><span className="text-cyan-400 font-bold">A</span> — Analog Baselines</div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & License Bar */}
          <div className="pt-8 border-t border-[#141C2B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
            <div>
              NASA Space Apps Challenge 2026 · Open Science Planetary Dataset Integration.
            </div>
            <div className="flex items-center gap-4">
              <span>NASA LOLA · MOLA · HRSC · Copernicus GLO-30</span>
              <span className="hidden sm:inline text-slate-700">|</span>
              <span className="text-cyan-400/80">100% Client-Side Geodetic Engine</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
