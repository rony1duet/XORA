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
import { 
  Compass, 
  GitCompare, 
  ShieldAlert, 
  Layers, 
  Activity, 
  ArrowRight, 
  Check, 
  X as CloseIcon,
  Sparkles
} from 'lucide-react';

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

        {/* 3. The Scientific Standard: Why Visual Lookalikes Fail */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0B0F19] to-[#080C14] border border-slate-800/80 space-y-10 shadow-2xl">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Rigorous Ground Truth</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Visual lookalikes deceive. Terrain twins validate.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              A desert might look like Mars in photos, but if its soil contains cohesive organic clay and its slopes were shaped by running water, running rover wheels there generates false confidence. XORA replaces subjective impressions with measurable topography.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pitfall Card */}
            <div className="p-6 rounded-2xl bg-[#0F1422] border border-rose-950/40 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <CloseIcon className="w-4 h-4" />
                <span>The Visual Lookalike Pitfall</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 font-light">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-mono text-sm leading-none">•</span>
                  <span><strong>RGB Color Bias:</strong> Matching reddish dunes with Mars overlooks completely different grain sizes and cohesive properties.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-mono text-sm leading-none">•</span>
                  <span><strong>Hydrological Erosion:</strong> Terrestrial drainage channels follow fluid dynamics that do not apply to crater-saturated regolith.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-mono text-sm leading-none">•</span>
                  <span><strong>Biological Cohesion:</strong> Microbial roots and organic crusts bind soil, creating unrealistic traction for rover wheel tests.</span>
                </li>
              </ul>
            </div>

            {/* Solution Card */}
            <div className="p-6 rounded-2xl bg-[#0F1422] border border-cyan-950/40 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                <Check className="w-4 h-4" />
                <span>The XORA Topographic Standard</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 font-light">
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-mono text-sm leading-none">•</span>
                  <span><strong>Wasserstein Slope Distribution:</strong> Matches full continuous slope gradients, not just misleading single-point averages.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-mono text-sm leading-none">•</span>
                  <span><strong>10m RMS Roughness:</strong> Directly benchmarks sub-kilometer wheel hazards from high-precision orbital laser altimeters.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-mono text-sm leading-none">•</span>
                  <span><strong>Petrological Affinity:</strong> Evaluates volcanic basalt, impact breccia, and anhydrous salts matching the targeted planetary crust.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. The Handicap Principle: Transparent Limitations */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest mb-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Physical Constraints</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                The Handicap Ledger
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md font-light leading-relaxed">
              No place on Earth reproduces 1/6th gravity or hard vacuum. Scientific honesty requires documenting what Earth cannot simulate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-5 rounded-2xl bg-[#0B101D] border border-slate-800 space-y-2">
              <div className="font-mono text-cyan-400 text-[11px] uppercase tracking-wider font-semibold">
                Surface Gravity Offset
              </div>
              <div className="text-base font-bold text-white font-mono">
                1.62 / 3.71 vs 9.81 m/s²
              </div>
              <p className="text-slate-400 font-light text-[11px] leading-relaxed">
                Earth tests validate path slope geometry and steering kinematics, but wheel torque and sinkage require weight-offloading rigs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B101D] border border-slate-800 space-y-2">
              <div className="font-mono text-cyan-400 text-[11px] uppercase tracking-wider font-semibold">
                Atmosphere &amp; Vacuum
              </div>
              <div className="text-base font-bold text-white font-mono">
                10⁻¹⁰ Pa vs 101.3 kPa
              </div>
              <p className="text-slate-400 font-light text-[11px] leading-relaxed">
                Earth tests validate LIDAR line-of-sight and optical feature tracking, but lack lunar electrostatic regolith levitation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B101D] border border-slate-800 space-y-2">
              <div className="font-mono text-cyan-400 text-[11px] uppercase tracking-wider font-semibold">
                Thermal &amp; Radiation Flux
              </div>
              <div className="text-base font-bold text-white font-mono">
                -180°C to +120°C Diurnal
              </div>
              <p className="text-slate-400 font-light text-[11px] leading-relaxed">
                Mechanical traverse protocols remain valid; thermal cycling and radiation shielding require cryogenic vacuum chambers.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
