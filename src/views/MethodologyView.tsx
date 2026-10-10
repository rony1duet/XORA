/**
 * Methodology View
 * Rigorous documentation of the Analog Atlas mathematical similarity engine,
 * Wasserstein distribution metrics, characteristic tau scales, and in-browser test validation.
 */

import React, { useState } from 'react';
import { runSimilarityTests } from '../services/similarityEngine.test';
import { TAU_SCALES, LITHOLOGY_AFFINITY_MATRIX } from '../services/similarityEngine';
import { BookOpen, CheckCircle2, XCircle, Play, ShieldAlert, Cpu, Layers } from 'lucide-react';

export const MethodologyView: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    passed: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleRunTests = () => {
    const res = runSimilarityTests();
    setTestResults(res);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Title */}
      <div className="space-y-3 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400">
          <BookOpen className="w-4 h-4" />
          <span>Scientific Methodology & Formulation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          How Terrain Twins Are Mathematically Computed
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
          XORA repudiates qualitative visual lookalikes. We formalize terrain twin discovery
          as an empirical multi-attribute proximity metric evaluated over resampled Digital Elevation Models.
        </p>
      </div>

      {/* Section 1: The Core Scoring Formula */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>1. The Multi-Metric Similarity Equation</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The aggregate similarity score $S$ is computed across eligible, documented terrain features:
        </p>

        {/* Formula Display Box */}
        <div className="p-5 rounded-lg bg-[#0E1523] border border-slate-800 font-mono text-center space-y-2 text-sm sm:text-base">
          <div className="text-cyan-300 font-bold">
            S = 100 × [ Σ (wᵢ · sᵢ) / Σ wᵢ ]
          </div>
          <div className="text-xs text-slate-400 font-mono">
            where sᵢ = exp( − dᵢ / τᵢ ) for continuous metrics
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 pt-2">
          <div className="p-4 rounded bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-white">Unit-Aware Physical Distance (dᵢ)</div>
            <p className="text-slate-400 leading-relaxed">
              Absolute metric differences between Earth and target for scalar features (relief in meters, roughness in meters, hazard count per square kilometer).
            </p>
          </div>
          <div className="p-4 rounded bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-white">Documented Scale Factors (τᵢ)</div>
            <p className="text-slate-400 leading-relaxed">
              Physical scale constants defining when similarity decays to 1/e (36.8%). Documented below to preserve full mathematical transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Documented Tau Scales Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>2. Calibrated Physical Scale Factors (τᵢ)</span>
        </h2>
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="p-3">Feature Domain</th>
                <th className="p-3">Scale (τᵢ)</th>
                <th className="p-3">Physical Unit</th>
                <th className="p-3">Physical Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
              <tr>
                <td className="p-3 font-medium text-white font-sans">Topographic Relief</td>
                <td className="p-3 text-cyan-300">{TAU_SCALES.relief}</td>
                <td className="p-3 text-slate-400">meters</td>
                <td className="p-3 text-slate-400 font-sans">
                  Regional elevation variance scale for 25km windows.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white font-sans">Slope Distribution</td>
                <td className="p-3 text-cyan-300">{TAU_SCALES.slope}</td>
                <td className="p-3 text-slate-400">degrees</td>
                <td className="p-3 text-slate-400 font-sans">
                  Wasserstein distance across 5 slope bins (0-5°, 5-10°, 10-15°, 15-20°, &gt;20°).
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white font-sans">Surface Roughness</td>
                <td className="p-3 text-cyan-300">{TAU_SCALES.roughness}</td>
                <td className="p-3 text-slate-400">meters RMS</td>
                <td className="p-3 text-slate-400 font-sans">
                  Root-mean-square height deviation evaluated at 10-meter spatial baseline.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white font-sans">Boulder / Pit Hazards</td>
                <td className="p-3 text-cyan-300">{TAU_SCALES.hazards}</td>
                <td className="p-3 text-slate-400">features / km²</td>
                <td className="p-3 text-slate-400 font-sans">
                  Sub-pixel obstacle counts affecting rover traverse paths and landing stability.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white font-sans">Aridity Index</td>
                <td className="p-3 text-cyan-300">{TAU_SCALES.aridity}</td>
                <td className="p-3 text-slate-400">UNEP P/PET</td>
                <td className="p-3 text-slate-400 font-sans">
                  Precipitation to potential evapotranspiration ratio for soil desiccation.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: 1D Wasserstein Earth Mover's Distance on Slope Bins */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>3. Wasserstein Metric for Slope Distribution Matching</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Comparing average slope alone fails because a terrain with 50% flat land and 50% 30° cliffs has an average of 15°, but completely different mobility implications than a uniform 15° slope.
          XORA evaluates the cumulative distribution function (CDF) across 5 discrete slope bins:
        </p>
        <div className="p-4 rounded-lg bg-[#0E1523] border border-slate-800 font-mono text-center text-xs sm:text-sm text-cyan-300">
          W₁(P, Q) = Σ | CDF_P(θₖ) − CDF_Q(θₖ) | · Δθₖ
        </div>
      </div>

      {/* Section 4: Live Verification Suite */}
      <div className="p-6 rounded-xl bg-[#0E1523] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>In-Browser Test Verification Suite</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute unit tests validating mathematical bounds, matrix symmetry, and Monte Carlo determinism.
            </p>
          </div>

          <button
            onClick={handleRunTests}
            className="px-4 py-2 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Similarity Tests</span>
          </button>
        </div>

        {testResults && (
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-4 font-mono font-bold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{testResults.passed} Tests Passed</span>
              </span>
              {testResults.failed > 0 && (
                <span className="text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>{testResults.failed} Tests Failed</span>
                </span>
              )}
            </div>
            {testResults.errors.length > 0 ? (
              <div className="text-rose-300 font-mono text-[11px] space-y-1">
                {testResults.errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">
                All 6 invariant suites passed: Lithological matrix symmetry, self-similarity 100.0% identity, score range bounds [0, 100], Wasserstein non-negativity, and Monte Carlo determinism.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
