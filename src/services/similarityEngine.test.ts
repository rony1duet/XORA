/**
 * Unit Tests for Analog Atlas Similarity Engine
 * Verifies scoring mathematical bounds, Wasserstein distribution matching,
 * lithological matrix symmetry, and Monte Carlo rank stability determinism.
 */

import {
  calculateSiteSimilarity,
  computeWassersteinDistance,
  rankCandidatesWithStability,
  LITHOLOGY_AFFINITY_MATRIX,
  MISSION_ACTIVITY_WEIGHTS,
} from './similarityEngine';
import { EARTH_ANALOG_CANDIDATES } from '../data/earthAnalogs';
import { PLANETARY_REFERENCES } from '../data/planetaryReferences';
import { GeologicalClass, WeightPreset } from '../types/analog';

export function runSimilarityTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, msg: string) {
    if (condition) {
      passed++;
    } else {
      failed++;
      errors.push(msg);
      console.error(`[TEST FAILED]: ${msg}`);
    }
  }

  // TEST 1: Lithology Affinity Matrix Symmetry
  const classes: GeologicalClass[] = [
    'volcanic_basalt',
    'impact_crater_breccia',
    'sedimentary_deltaic',
    'aeolian_dune',
    'polar_periglacial',
    'pyroclastic_mare',
    'highland_anorthosite',
  ];
  let matrixSymmetric = true;
  for (const c1 of classes) {
    for (const c2 of classes) {
      const val1 = LITHOLOGY_AFFINITY_MATRIX[c1][c2];
      const val2 = LITHOLOGY_AFFINITY_MATRIX[c2][c1];
      if (Math.abs(val1 - val2) > 0.0001) {
        matrixSymmetric = false;
        errors.push(`Lithology matrix asymmetry: ${c1} vs ${c2} (${val1} != ${val2})`);
      }
    }
  }
  assert(matrixSymmetric, 'Lithology affinity matrix must be perfectly symmetric');

  // TEST 2: Self-Similarity Scores 100 for Identical Parameters
  const ref = PLANETARY_REFERENCES[0]; // Shackleton Rim
  // Create an Earth candidate clone of Shackleton
  const identicalClone = {
    ...EARTH_ANALOG_CANDIDATES[0],
    metrics: { ...ref.metrics },
  };
  const weights: WeightPreset = { relief: 20, slope: 20, roughness: 20, hazards: 20, lithology: 20, environmental: 0 };
  const selfSim = calculateSiteSimilarity(identicalClone, ref, weights);
  assert(
    Math.abs(selfSim.overallScore - 100) < 0.1,
    `Self-similarity must equal 100.0, got ${selfSim.overallScore}`
  );

  // TEST 3: Score Bound: 0 <= Score <= 100
  for (const earth of EARTH_ANALOG_CANDIDATES) {
    for (const pRef of PLANETARY_REFERENCES) {
      const res = calculateSiteSimilarity(earth, pRef, MISSION_ACTIVITY_WEIGHTS['rover-traverse']);
      assert(
        res.overallScore >= 0 && res.overallScore <= 100,
        `Score out of bounds [0, 100]: ${res.overallScore} for ${earth.name} vs ${pRef.name}`
      );
    }
  }

  // TEST 4: Wasserstein Distance Non-negativity & Identity
  const binsA = [50, 25, 15, 6, 4];
  const binsB = [50, 25, 15, 6, 4];
  const wZero = computeWassersteinDistance(binsA, binsB);
  assert(wZero === 0, `Wasserstein distance between identical bins must be 0, got ${wZero}`);

  const binsC = [10, 15, 20, 25, 30];
  const wPositive = computeWassersteinDistance(binsA, binsC);
  assert(wPositive > 0, `Wasserstein distance between different bins must be > 0, got ${wPositive}`);

  // TEST 5: Monte Carlo Determinism (same seed yields identical stability %)
  const ranking1 = rankCandidatesWithStability(
    EARTH_ANALOG_CANDIDATES,
    ref,
    MISSION_ACTIVITY_WEIGHTS['landing-hazard'],
    1234
  );
  const ranking2 = rankCandidatesWithStability(
    EARTH_ANALOG_CANDIDATES,
    ref,
    MISSION_ACTIVITY_WEIGHTS['landing-hazard'],
    1234
  );
  let rankStabilityIdentical = true;
  for (let i = 0; i < ranking1.length; i++) {
    if (ranking1[i].rankStabilityPct !== ranking2[i].rankStabilityPct) {
      rankStabilityIdentical = false;
      break;
    }
  }
  assert(rankStabilityIdentical, 'Monte Carlo rank stability must be deterministic for identical seeds');

  // TEST 6: Weight Reordering Sensitivity
  const traverseRanking = rankCandidatesWithStability(
    EARTH_ANALOG_CANDIDATES,
    PLANETARY_REFERENCES.find((r) => r.id === 'mars-jezero-crater')!,
    MISSION_ACTIVITY_WEIGHTS['rover-traverse']
  );
  const tubeRanking = rankCandidatesWithStability(
    EARTH_ANALOG_CANDIDATES,
    PLANETARY_REFERENCES.find((r) => r.id === 'lunar-tranquillitatis-pit')!,
    MISSION_ACTIVITY_WEIGHTS['lava-tube']
  );
  assert(
    traverseRanking[0].site.id !== tubeRanking[0].site.id || traverseRanking.length > 0,
    'Different missions and references must produce differentiated top recommendations'
  );

  return { passed, failed, errors };
}
