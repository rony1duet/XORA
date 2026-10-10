/**
 * XORA Home View
 * Cinematic 3D Celestial Hero scrolling into a modern editorial narrative:
 * The Scientific Problem -> Core Principles -> The Handicap Ledger -> Interactive Proving Grounds.
 */

import React from 'react';
import { CelestialHero3D } from '../components/CelestialHero3D';
import { Compass, ShieldAlert, ArrowRight, CheckCircle2, Layers, Cpu, Database, Eye } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#07090E] text-[#F8FAFC]">
      {/* 3D Celestial Hero with Orbit Mechanics */}
      <CelestialHero3D
        onExplore={(body) => onNavigate('explore', body ? { body } : undefined)}
        onCompare={() => onNavigate('compare')}
      />

      {/* Editorial Science & Mission Narrative */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 space-y-20">
        {/* Brand Architecture & Mission Scope */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0F17] border border-slate-800/80 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span>Mission Framework &amp; Core Architecture</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black tracking-widest text-white uppercase font-sans">
                XORA
              </h2>
              <div className="text-xs font-mono text-cyan-300 tracking-wider uppercase font-semibold">
                Earth · Moon · Mars
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                An open planetary science platform quantifying terrestrial terrain twins for lunar base sites and Martian landing zones using calibrated orbital altimetry.
              </p>
              <div className="pt-2 text-xs text-slate-400 font-sans">
                Bridging the gap between laboratory bench testing and deep-space planetary surface operations.
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#111622] border border-slate-800/90 space-y-1.5 shadow-sm">
                <span className="text-cyan-400 font-bold text-base">X</span>
                <div className="text-white font-semibold">eXploration</div>
                <div className="text-slate-400 text-[11px] font-sans">Mission-critical test design for rovers &amp; landers</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111622] border border-slate-800/90 space-y-1.5 shadow-sm">
                <span className="text-cyan-400 font-bold text-base">O</span>
                <div className="text-white font-semibold">Orbital Altimetry</div>
                <div className="text-slate-400 text-[11px] font-sans">NASA LOLA, MGS MOLA &amp; ESA HRSC datasets</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111622] border border-slate-800/90 space-y-1.5 shadow-sm">
                <span className="text-cyan-400 font-bold text-base">R</span>
                <div className="text-white font-semibold">Rigorous Analysis</div>
                <div className="text-slate-400 text-[11px] font-sans">Wasserstein slope CDF &amp; RMS roughness math</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111622] border border-slate-800/90 space-y-1.5 shadow-sm">
                <span className="text-cyan-400 font-bold text-base">A</span>
                <div className="text-white font-semibold">Analogs Catalog</div>
                <div className="text-slate-400 text-[11px] font-sans">12 georeferenced high-fidelity proving grounds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter 01: The Problem with Lookalikes */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>01. The Problem</span>
          </div>
          <div className="md:col-span-8 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Space missions demand terrain twins, not visual lookalikes.
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base font-light">
              A red desert might look like Mars in a photo, but if its slopes were carved by rain and its soil contains sticky biological clay, testing rover wheels there gives engineers false confidence. Real space hardware requires terrain that matches measurable slope distributions, surface roughness, and bedrock geology.
            </p>
          </div>
        </div>

        {/* Chapter 02: Three Principles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-[#1F2737] pt-16">
          <div className="md:col-span-4 font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>02. Scientific Principles</span>
          </div>
          <div className="md:col-span-8 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Measurable metrics. Honest limitations. Mission-first.
            </h2>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl bg-[#0F121C] border border-[#1F2737] space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">1.</span>
                  <span>Measurable Topographic Alignment</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-xs font-light">
                  Similarity scores are computed from elevation relief, slope distributions, 10m RMS roughness, and boulder hazard densities. Never from cosmetic RGB appearance.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F121C] border border-[#1F2737] space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">2.</span>
                  <span>The Handicap Ledger</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-xs font-light">
                  Earth has 9.81 m/s² gravity, an atmosphere, active biology, and water. Every comparison lists exactly what Earth cannot reproduce and details which tests remain valid.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F121C] border border-[#1F2737] space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">3.</span>
                  <span>Mission-Specific Weightings</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-xs font-light">
                  Rover traverse, landing hazard testing, lava-tube exploration, and polar ice drilling each prioritize different physical terrain metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter 03: The Handicap Ledger Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-[#1F2737] pt-16">
          <div className="md:col-span-4 font-mono text-xs text-amber-400 uppercase tracking-widest font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>03. The Handicap Ledger</span>
          </div>
          <div className="md:col-span-8 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Transparent physical boundaries separate science from fiction.
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm font-light">
              No Earth location can replicate lunar vacuum or Martian gravity. The Handicap Ledger makes these boundaries transparent on every evaluation:
            </p>

            <div className="overflow-x-auto border border-[#1F2737] rounded-xl bg-[#0E121C]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#121624] text-slate-400 font-mono border-b border-[#1F2737]">
                  <tr>
                    <th className="p-3.5">Environment Factor</th>
                    <th className="p-3.5">Earth Baseline</th>
                    <th className="p-3.5">Planetary Target</th>
                    <th className="p-3.5">Valid Testing Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2737] text-slate-300">
                  <tr>
                    <td className="p-3.5 font-medium text-white">Surface Gravity</td>
                    <td className="p-3.5 font-mono">9.81 m/s²</td>
                    <td className="p-3.5 font-mono text-cyan-400">1.62 m/s² (Moon) / 3.71 m/s² (Mars)</td>
                    <td className="p-3.5 text-slate-400">Geometric pathing, hazard avoidance FOV, slip angles.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-white">Atmosphere &amp; Vacuum</td>
                    <td className="p-3.5 font-mono">101.3 kPa</td>
                    <td className="p-3.5 font-mono text-cyan-400">10⁻¹⁰ Pa (Vacuum) / 0.6 kPa (CO₂)</td>
                    <td className="p-3.5 text-slate-400">LIDAR ranging, optical SLAM, rock coring mechanical drill.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-white">Ionizing Radiation</td>
                    <td className="p-3.5 font-mono">2.4 mSv/yr</td>
                    <td className="p-3.5 font-mono text-cyan-400">250 to 380 mSv/yr</td>
                    <td className="p-3.5 text-slate-400">Structural mobility, sample caching procedures, autonomy.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chapter 04: Interactive Call to Exploration */}
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-[#0E121C] to-[#141C2B] border border-cyan-500/30 text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-xs font-mono text-cyan-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>12 Georeferenced Proving Grounds · NASA &amp; ESA Remote Baselines</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-xl mx-auto uppercase">
            Start Your Analysis
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto font-light">
            Compare orbital radar transects, explore global geographic coordinates, and simulate mission hardware tolerances against verified planetary topography.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('explore')}
              className="px-6 py-3.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.25)]"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Terrain Twin Explorer</span>
            </button>
            <button
              onClick={() => onNavigate('compare')}
              className="px-6 py-3.5 text-sm font-medium text-slate-200 bg-[#121624] hover:bg-[#1A2033] border border-[#1F2737] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Split-World Scrubber</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
