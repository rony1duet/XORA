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
      <footer className="border-t border-[#1F2737] bg-[#07080D] py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-widest text-white uppercase">XORA</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-cyan-400 font-semibold tracking-wider text-[11px] uppercase">
                  Earth · Moon · Mars
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                High-fidelity planetary proving ground intelligence for lunar base sites and Mars landing environments.
              </p>
            </div>

            {/* Brand Acronym Definition */}
            <div className="font-mono text-[11px] text-slate-300 bg-[#0B0F17] px-4 py-2.5 rounded-xl border border-slate-800 space-x-2">
              <span className="text-cyan-400 font-bold">X</span>
              <span>— eXploration</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-bold">O</span>
              <span>— Orbital Altimetry</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-bold">R</span>
              <span>— Rigorous Analysis</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-bold">A</span>
              <span>— Analogs</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#181F2C] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
            <div>
              Public planetary elevation baselines: NASA LRO LOLA, Mars MOLA/HRSC, Copernicus GLO-30.
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('explore')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                Explore
              </button>
              <button onClick={() => navigate('compare')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                Compare
              </button>
              <button onClick={() => navigate('rankings')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                Rankings
              </button>
              <button onClick={() => navigate('methodology')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                Methodology
              </button>
              <button onClick={() => navigate('data-sources')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                Data Catalog
              </button>
              <button onClick={() => navigate('reports')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                Reports
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
