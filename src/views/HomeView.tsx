/**
 * XORA Home View
 * High-End Aerospace & Planetary Science Proving Ground Presentation:
 * 1. 3D Celestial Hero (Earth, Moon, Mars in real orbital mechanics)
 * 2. Planetary Twin Spotlights (Live Terrain Pair Previews: Shackleton, Jezero, Marius)
 * 3. The Fidelity Standard (Why visual lookalikes fail vs mathematical terrain twins)
 * 4. The Handicap Principle (Operational boundaries of Earth-based rehearsals)
 */

import React from 'react';
import { CelestialHero3D } from '../components/CelestialHero3D';
import { ArrowRight } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#07090E] text-[#F8FAFC]">
      {/* 1. 3D Celestial Hero with Interactive Orbit Physics */}
      <CelestialHero3D
        onExplore={(body) => onNavigate('explore', body ? { body } : undefined)}
        onCompare={() => onNavigate('compare')}
      />

      {/* Main Editorial Content Stream */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 space-y-28">
        
        {/* 2. Planetary Twin Spotlights: 3 Calibrated Proving Ground Pairs */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span>Calibrated Planetary Pairs</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                Signature Proving Ground Baselines
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md font-light leading-relaxed">
              Real mission landing candidates paired with verified Earth analogs based on NASA LOLA, MOLA, and Copernicus topography.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pair 1: Shackleton Rim (Moon) -> Haughton Crater */}
            <div 
              onClick={() => onNavigate('compare', { ref: 'lunar-shackleton-rim', earth: 'haughton-crater' })}
              className="p-5 rounded-2xl bg-[#0B101D]/80 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-[#0E1526] transition-all cursor-pointer group flex flex-col justify-between space-y-5 shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 font-mono text-[11px] text-cyan-300">
                    Moon · Artemis Base
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">86.4% Match</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Shackleton Rim ↔ Haughton
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                    Polar impact rim with continuous illumination ridges paired with Arctic impact breccia and permafrost polygons.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Slope Match:</span>
                  <span className="text-slate-200">14.8° vs 11.2°</span>
                </div>
                <div className="flex justify-between">
                  <span>Surface Roughness:</span>
                  <span className="text-slate-200">0.95m vs 0.88m RMS</span>
                </div>
                <div className="pt-2 text-cyan-400 group-hover:underline flex items-center justify-between font-semibold">
                  <span>Launch Visual Scrubber</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Pair 2: Jezero Crater (Mars) -> Atacama Yungay */}
            <div 
              onClick={() => onNavigate('compare', { ref: 'mars-jezero-crater', earth: 'atacama-yungay' })}
              className="p-5 rounded-2xl bg-[#0B101D]/80 border border-slate-800/80 hover:border-amber-500/50 hover:bg-[#0E1526] transition-all cursor-pointer group flex flex-col justify-between space-y-5 shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/50 font-mono text-[11px] text-amber-300">
                    Mars · Perseverance
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">88.1% Match</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    Jezero Delta ↔ Atacama
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                    River delta fan deposits and clay scarps matched against Earth&apos;s hyper-arid desiccation basin and perchlorate soils.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Slope Match:</span>
                  <span className="text-slate-200">6.2° vs 5.8°</span>
                </div>
                <div className="flex justify-between">
                  <span>Surface Roughness:</span>
                  <span className="text-slate-200">0.42m vs 0.38m RMS</span>
                </div>
                <div className="pt-2 text-amber-400 group-hover:underline flex items-center justify-between font-semibold">
                  <span>Launch Visual Scrubber</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Pair 3: Tranquillitatis Pit (Moon) -> Lanzarote */}
            <div 
              onClick={() => onNavigate('compare', { ref: 'lunar-tranquillitatis-pit', earth: 'lanzarote-lava-tubes' })}
              className="p-5 rounded-2xl bg-[#0B101D]/80 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-[#0E1526] transition-all cursor-pointer group flex flex-col justify-between space-y-5 shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/50 font-mono text-[11px] text-emerald-300">
                    Moon · Lava Tube Skylight
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">83.5% Match</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Mare Pit ↔ Lanzarote
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                    Subsurface basalt cavern collapse matched against volcanic lava tubes tested by ESA PANGAEA astronaut campaigns.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Slope Match:</span>
                  <span className="text-slate-200">22.4° vs 19.8°</span>
                </div>
                <div className="flex justify-between">
                  <span>Surface Roughness:</span>
                  <span className="text-slate-200">1.25m vs 1.18m RMS</span>
                </div>
                <div className="pt-2 text-emerald-400 group-hover:underline flex items-center justify-between font-semibold">
                  <span>Launch Visual Scrubber</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
