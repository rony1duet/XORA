/**
 * XORA: EARTH · MOON · MARS
 * Terrain Twin Proving Ground Explorer
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { CompareView } from './views/CompareView';
import { SiteProfileView } from './views/SiteProfileView';
import { RankingsView } from './views/RankingsView';
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
      {/* Clean Minimal Top Bar Navigation */}
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
      </main>

      {/* Clean Minimal Simple Footer */}
      <footer className="border-t border-[#182030] bg-[#07090E] py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Brand & Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-base font-black tracking-widest text-white uppercase font-sans">
                XORA
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                Earth · Moon · Mars
              </span>
            </div>

            {/* Center: Core Interactive Links */}
            <nav className="flex items-center gap-6 font-medium text-xs">
              <button
                onClick={() => navigate('explore')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Explore Atlas
              </button>
              <button
                onClick={() => navigate('compare')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Split-World Scrubber
              </button>
              <button
                onClick={() => navigate('rankings')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Twin Leaderboard
              </button>
            </nav>

            {/* Right: Status Ping */}
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>NASA & Copernicus Baselines</span>
            </div>
          </div>

          {/* Bottom Simple Copyright Bar */}
          <div className="pt-4 border-t border-[#141C2B] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
            <div>
              © 2026 XORA Planetary Terrain Atlas. Open planetary science & proving ground intelligence.
            </div>
            <div>
              100% Client-Side Geodetic Engine
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
