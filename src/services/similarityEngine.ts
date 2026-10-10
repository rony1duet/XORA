/**
 * Similarity Engine for Analog Atlas
 * Rigorous multi-metric terrain distance, Wasserstein distribution matching,
 * lithological affinity matrix, and Monte Carlo rank stability.
 */

import {
  EarthCandidateSite,
  PlanetaryReferenceSite,
  MissionActivity,
  WeightPreset,
  SimilarityResult,
  FeatureScoreBreakdown,
  TopMismatch,
  GeologicalClass,
} from '../types/analog';

// Documented characteristic scale factors (tau_i)
export const TAU_SCALES = {
  relief: 600, // 600 meters
  slope: 5.0, // 5.0 degrees Wasserstein distance
  roughness: 0.75, // 0.75 meters RMS height
  hazards: 40, // 40 features / km²
  aridity: 0.35, // 0.35 UNEP aridity index
  diurnalTemp: 30.0, // 30°C temperature swing
};

// Activity-specific weight presets (sum to 100)
export const MISSION_ACTIVITY_WEIGHTS: Record<MissionActivity, WeightPreset> = {
  'rover-traverse': {
    relief: 15,
    slope: 30,
    roughness: 25,
    hazards: 20,
    lithology: 10,
    environmental: 0,
  },
  'landing-hazard': {
    relief: 10,
    slope: 35,
    roughness: 20,
    hazards: 35,
    lithology: 0,
    environmental: 0,
  },
  'habitat-siting': {
    relief: 20,
    slope: 25,
    roughness: 15,
    hazards: 10,
    lithology: 20,
    environmental: 10,
  },
  'lava-tube': {
    relief: 15,
    slope: 15,
    roughness: 20,
    hazards: 10,
    lithology: 40,
    environmental: 0,
  },
  'polar-ice': {
    relief: 20,
    slope: 20,
    roughness: 10,
    hazards: 0,
    lithology: 15,
    environmental: 35,
  },
  'excavation-isru': {
    relief: 5,
    slope: 15,
    roughness: 20,
    hazards: 15,
    lithology: 35,
    environmental: 10,
  },
  'navigation-localization': {
    relief: 30,
    slope: 15,
    roughness: 20,
    hazards: 25,
    lithology: 10,
    environmental: 0,
  },
};

/**
 * Symmetric geological lithology affinity matrix [0.05 to 1.0]
 */
export const LITHOLOGY_AFFINITY_MATRIX: Record<
  GeologicalClass,
  Record<GeologicalClass, number>
> = {
  volcanic_basalt: {
    volcanic_basalt: 1.0,
    impact_crater_breccia: 0.45,
    sedimentary_deltaic: 0.3,
    aeolian_dune: 0.25,
    polar_periglacial: 0.2,
    pyroclastic_mare: 0.85,
    highland_anorthosite: 0.6,
  },
  impact_crater_breccia: {
    volcanic_basalt: 0.45,
    impact_crater_breccia: 1.0,
    sedimentary_deltaic: 0.35,
    aeolian_dune: 0.2,
    polar_periglacial: 0.4,
    pyroclastic_mare: 0.5,
    highland_anorthosite: 0.8,
  },
  sedimentary_deltaic: {
    volcanic_basalt: 0.3,
    impact_crater_breccia: 0.35,
    sedimentary_deltaic: 1.0,
    aeolian_dune: 0.65,
    polar_periglacial: 0.4,
    pyroclastic_mare: 0.25,
    highland_anorthosite: 0.2,
  },
  aeolian_dune: {
    volcanic_basalt: 0.25,
    impact_crater_breccia: 0.2,
    sedimentary_deltaic: 0.65,
    aeolian_dune: 1.0,
    polar_periglacial: 0.3,
    pyroclastic_mare: 0.35,
    highland_anorthosite: 0.15,
  },
  polar_periglacial: {
    volcanic_basalt: 0.2,
    impact_crater_breccia: 0.4,
    sedimentary_deltaic: 0.4,
    aeolian_dune: 0.3,
    polar_periglacial: 1.0,
    pyroclastic_mare: 0.15,
    highland_anorthosite: 0.45,
  },
  pyroclastic_mare: {
    volcanic_basalt: 0.85,
    impact_crater_breccia: 0.5,
    sedimentary_deltaic: 0.25,
    aeolian_dune: 0.35,
    polar_periglacial: 0.15,
    pyroclastic_mare: 1.0,
    highland_anorthosite: 0.55,
  },
  highland_anorthosite: {
    volcanic_basalt: 0.6,
    impact_crater_breccia: 0.8,
    sedimentary_deltaic: 0.2,
    aeolian_dune: 0.15,
    polar_periglacial: 0.45,
    pyroclastic_mare: 0.55,
    highland_anorthosite: 1.0,
  },
};

/**
 * 1D Earth Mover's (Wasserstein) Distance on normalized cumulative histograms
 */
export function computeWassersteinDistance(
  binsA: number[],
  binsB: number[],
  binWeights: number[] = [2.5, 7.5, 12.5, 17.5, 25.0]
): number {
  const sumA = binsA.reduce((a, b) => a + b, 0) || 1;
  const sumB = binsB.reduce((a, b) => a + b, 0) || 1;

  let cumA = 0;
  let cumB = 0;
  let emd = 0;

  for (let i = 0; i < binsA.length - 1; i++) {
    cumA += binsA[i] / sumA;
    cumB += binsB[i] / sumB;
    const binStep = binWeights[i + 1] - binWeights[i];
    emd += Math.abs(cumA - cumB) * binStep;
  }

  return emd;
}

/**
 * Seedable pseudo-random number generator (Mulberry32)
 */
export function createMulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Compute similarity score between an Earth candidate and a planetary reference site
 */
export function calculateSiteSimilarity(
  earth: EarthCandidateSite,
  ref: PlanetaryReferenceSite,
  weights: WeightPreset
): Omit<SimilarityResult, 'rank' | 'previousRank' | 'rankStabilityPct'> {
  const eMetrics = earth.metrics;
  const rMetrics = ref.metrics;

  // 1. Relief distance & score
  const dRelief = Math.abs(eMetrics.elevationReliefM - rMetrics.elevationReliefM);
  const sRelief = Math.exp(-dRelief / TAU_SCALES.relief);

  // 2. Slope distribution distance (Wasserstein on slope bins)
  const dSlopeWasserstein = computeWassersteinDistance(
    eMetrics.slopeBins,
    rMetrics.slopeBins
  );
  const dSlopeMean = Math.abs(eMetrics.slopeMeanDeg - rMetrics.slopeMeanDeg);
  const dSlopeCombined = dSlopeWasserstein * 0.7 + dSlopeMean * 0.3;
  const sSlope = Math.exp(-dSlopeCombined / TAU_SCALES.slope);

  // 3. Roughness RMS height
  const dRoughness = Math.abs(eMetrics.roughnessRmsM - rMetrics.roughnessRmsM);
  const sRoughness = Math.exp(-dRoughness / TAU_SCALES.roughness);

  // 4. Hazards (boulder/crater density)
  const dHazards = Math.abs(
    eMetrics.boulderCraterDensityPerKm2 - rMetrics.boulderCraterDensityPerKm2
  );
  const sHazards = Math.exp(-dHazards / TAU_SCALES.hazards);

  // 5. Lithology affinity
  const sLithology =
    LITHOLOGY_AFFINITY_MATRIX[eMetrics.geologicalClass]?.[rMetrics.geologicalClass] ?? 0.2;
  const dLithology = 1.0 - sLithology;

  // 6. Environmental Context (Aridity + Diurnal Temp swing)
  const dAridity = Math.abs(eMetrics.aridityIndex - rMetrics.aridityIndex);
  const sAridity = Math.exp(-dAridity / TAU_SCALES.aridity);
  const dTemp = Math.abs(eMetrics.diurnalTempRangeC - rMetrics.diurnalTempRangeC);
  const sTemp = Math.exp(-dTemp / TAU_SCALES.diurnalTemp);
  const sEnvironmental = sAridity * 0.6 + sTemp * 0.4;
  const dEnvironmental = (dAridity / TAU_SCALES.aridity + dTemp / TAU_SCALES.diurnalTemp) / 2;

  const featureScores: Record<string, FeatureScoreBreakdown> = {
    relief: {
      rawDistance: dRelief,
      similarity: sRelief,
      weight: weights.relief,
      weightedScore: sRelief * weights.relief,
      unit: 'm',
      refValue: `${rMetrics.elevationReliefM.toFixed(0)} m`,
      earthValue: `${eMetrics.elevationReliefM.toFixed(0)} m`,
    },
    slope: {
      rawDistance: dSlopeCombined,
      similarity: sSlope,
      weight: weights.slope,
      weightedScore: sSlope * weights.slope,
      unit: '°',
      refValue: `${rMetrics.slopeMeanDeg.toFixed(1)}° (P90 ${rMetrics.slopeP90Deg.toFixed(1)}°)`,
      earthValue: `${eMetrics.slopeMeanDeg.toFixed(1)}° (P90 ${eMetrics.slopeP90Deg.toFixed(1)}°)`,
    },
    roughness: {
      rawDistance: dRoughness,
      similarity: sRoughness,
      weight: weights.roughness,
      weightedScore: sRoughness * weights.roughness,
      unit: 'm RMS',
      refValue: `${rMetrics.roughnessRmsM.toFixed(2)} m`,
      earthValue: `${eMetrics.roughnessRmsM.toFixed(2)} m`,
    },
    hazards: {
      rawDistance: dHazards,
      similarity: sHazards,
      weight: weights.hazards,
      weightedScore: sHazards * weights.hazards,
      unit: '/km²',
      refValue: `${rMetrics.boulderCraterDensityPerKm2.toFixed(0)} /km²`,
      earthValue: `${eMetrics.boulderCraterDensityPerKm2.toFixed(0)} /km²`,
    },
    lithology: {
      rawDistance: dLithology,
      similarity: sLithology,
      weight: weights.lithology,
      weightedScore: sLithology * weights.lithology,
      unit: 'affinity',
      refValue: rMetrics.geologicalClass.replace(/_/g, ' '),
      earthValue: eMetrics.geologicalClass.replace(/_/g, ' '),
    },
    environmental: {
      rawDistance: dEnvironmental,
      similarity: sEnvironmental,
      weight: weights.environmental,
      weightedScore: sEnvironmental * weights.environmental,
      unit: 'index',
      refValue: `Aridity ${rMetrics.aridityIndex.toFixed(2)}, ΔT ${rMetrics.diurnalTempRangeC.toFixed(0)}°C`,
      earthValue: `Aridity ${eMetrics.aridityIndex.toFixed(2)}, ΔT ${eMetrics.diurnalTempRangeC.toFixed(0)}°C`,
    },
  };

  // Compute normalized score over active positive weights
  let totalWeight = 0;
  let totalWeightedScore = 0;
  const includedFeatures: string[] = [];
  const excludedFeatures: string[] = [];

  for (const [key, breakdown] of Object.entries(featureScores)) {
    if (breakdown.weight > 0) {
      totalWeight += breakdown.weight;
      totalWeightedScore += breakdown.weightedScore;
      includedFeatures.push(key);
    } else {
      excludedFeatures.push(key);
    }
  }

  const overallScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;

  // Determine top physical mismatches
  const mismatches: TopMismatch[] = [];
  if (Math.abs(eMetrics.roughnessRmsM - rMetrics.roughnessRmsM) > 0.4) {
    mismatches.push({
      feature: 'Surface Micro-Roughness',
      earthVal: `${eMetrics.roughnessRmsM.toFixed(2)} m`,
      refVal: `${rMetrics.roughnessRmsM.toFixed(2)} m`,
      impact:
        eMetrics.roughnessRmsM > rMetrics.roughnessRmsM
          ? 'Earth terrain exhibits higher micro-scale blockiness and erosion channels.'
          : 'Planetary surface has higher sub-meter regolith blockiness from impact fragmentation.',
    });
  }
  if (Math.abs(eMetrics.slopeP90Deg - rMetrics.slopeP90Deg) > 4) {
    mismatches.push({
      feature: 'Steep Slope Tail (P90)',
      earthVal: `${eMetrics.slopeP90Deg.toFixed(1)}°`,
      refVal: `${rMetrics.slopeP90Deg.toFixed(1)}°`,
      impact: `Slope distribution differs by ${Math.abs(eMetrics.slopeP90Deg - rMetrics.slopeP90Deg).toFixed(1)}° at the 90th percentile, affecting rover tip-over risks.`,
    });
  }
  if (sLithology < 0.6) {
    mismatches.push({
      feature: 'Bedrock Lithology',
      earthVal: eMetrics.geologicalClass.replace(/_/g, ' '),
      refVal: rMetrics.geologicalClass.replace(/_/g, ' '),
      impact: 'Geological substrate composition differs, impacting geotechnical shear strength and drilling behavior.',
    });
  }
  if (Math.abs(eMetrics.elevationReliefM - rMetrics.elevationReliefM) > 500) {
    mismatches.push({
      feature: 'Regional Topographic Relief',
      earthVal: `${eMetrics.elevationReliefM.toFixed(0)} m`,
      refVal: `${rMetrics.elevationReliefM.toFixed(0)} m`,
      impact: `Macro-scale relief difference of ${Math.abs(eMetrics.elevationReliefM - rMetrics.elevationReliefM).toFixed(0)} m across the 25km evaluation window.`,
    });
  }

  return {
    site: earth,
    reference: ref,
    overallScore: Math.round(overallScore * 10) / 10,
    featureScores,
    includedFeatures,
    excludedFeatures,
    dataCoveragePct: Math.round((includedFeatures.length / 6) * 100),
    topMismatches: mismatches.slice(0, 3),
  };
}

/**
 * Rank candidates and compute Monte Carlo Rank Stability (500 draws)
 */
export function rankCandidatesWithStability(
  candidates: EarthCandidateSite[],
  reference: PlanetaryReferenceSite,
  weights: WeightPreset,
  monteCarloSeed = 42
): SimilarityResult[] {
  // 1. Calculate baseline scores
  const baselineResults = candidates.map((site) =>
    calculateSiteSimilarity(site, reference, weights)
  );

  // Sort descending
  baselineResults.sort((a, b) => b.overallScore - a.overallScore);

  // 2. Perform Monte Carlo weight perturbation (500 iterations)
  const rng = createMulberry32(monteCarloSeed);
  const N_ITERATIONS = 500;
  const top1Counts: Record<string, number> = {};
  candidates.forEach((c) => {
    top1Counts[c.id] = 0;
  });

  const weightKeys = Object.keys(weights) as (keyof WeightPreset)[];

  for (let i = 0; i < N_ITERATIONS; i++) {
    // Perturb each weight by ±20%
    const perturbedWeights: WeightPreset = { ...weights };
    weightKeys.forEach((key) => {
      const noise = (rng() * 0.4 - 0.2); // [-0.2, +0.2]
      perturbedWeights[key] = Math.max(0, weights[key] * (1 + noise));
    });

    let bestScore = -1;
    let bestSiteId = '';

    candidates.forEach((site) => {
      const res = calculateSiteSimilarity(site, reference, perturbedWeights);
      if (res.overallScore > bestScore) {
        bestScore = res.overallScore;
        bestSiteId = site.id;
      }
    });

    if (bestSiteId) {
      top1Counts[bestSiteId] = (top1Counts[bestSiteId] || 0) + 1;
    }
  }

  // 3. Assemble final results with rank stability
  return baselineResults.map((res, index) => {
    const stabilityPct =
      Math.round(((top1Counts[res.site.id] || 0) / N_ITERATIONS) * 1000) / 10;
    return {
      ...res,
      rank: index + 1,
      rankStabilityPct: stabilityPct,
    };
  });
}
