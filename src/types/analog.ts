/**
 * Core Domain Types & Schemas for Analog Atlas
 * Planetary Terrain Twin Exploration Engine
 */

export type CelestialBody = 'moon' | 'mars';

export type MissionActivity =
  | 'rover-traverse'
  | 'landing-hazard'
  | 'habitat-siting'
  | 'lava-tube'
  | 'polar-ice'
  | 'excavation-isru'
  | 'navigation-localization';

export type ProvenanceType = 'measured' | 'literature' | 'illustrative';

export type ConfidenceTier =
  | 'Tier 1 - High Precision'
  | 'Tier 2 - Moderate'
  | 'Tier 3 - Exploratory';

export type GeologicalClass =
  | 'volcanic_basalt'
  | 'impact_crater_breccia'
  | 'sedimentary_deltaic'
  | 'aeolian_dune'
  | 'polar_periglacial'
  | 'pyroclastic_mare'
  | 'highland_anorthosite';

export interface TerrainMetrics {
  elevationReliefM: number;
  elevationMeanM: number;
  slopeMeanDeg: number;
  slopeMedianDeg: number;
  slopeP90Deg: number;
  slopeAbove15Pct: number;
  slopeBins: [number, number, number, number, number]; // 0-5°, 5-10°, 10-15°, 15-20°, >20°
  roughnessRmsM: number; // RMS roughness at 10m baseline
  boulderCraterDensityPerKm2: number;
  geologicalClass: GeologicalClass;
  aridityIndex: number; // UNEP aridity index P/PET (lower = drier)
  diurnalTempRangeC: number;
}

export interface MetricProvenance {
  type: ProvenanceType;
  source: string;
  notes?: string;
}

export interface HandicapItem {
  factor: string;
  earthValue: string;
  planetaryValue: string;
  divergence: string;
  citation: string;
  validTestingScope: string;
  invalidTestingScope: string;
}

export interface ElevationProfilePoint {
  distanceKm: number;
  elevationM: number;
}

export interface PlanetaryReferenceSite {
  id: string;
  name: string;
  body: CelestialBody;
  coordinates: { lat: number; lng: number };
  elevationDatum: string;
  geologicalContext: string;
  missionContext: string;
  keyTargetFeature: string;
  metrics: TerrainMetrics;
  provenance: Record<keyof TerrainMetrics, MetricProvenance>;
  handicapLedger: HandicapItem[];
  demImageUrl: string;
  elevationProfile: ElevationProfilePoint[];
}

export interface MissionRehearsalCard {
  activity: MissionActivity;
  title: string;
  status: 'supported by data' | 'inferred';
  reasoning: string;
  recommendedProtocol: string;
}

export interface EvidencePassport {
  datasetSources: string[];
  resolutionMeters: number;
  acquisitionPeriod: string;
  coveragePct: number;
  analysisWindowKm: number;
  confidenceTier: ConfidenceTier;
  knownGaps: string[];
}

export interface EarthCandidateSite {
  id: string;
  name: string;
  location: string;
  country: string;
  coordinates: { lat: number; lng: number };
  geologicalContext: string;
  primaryAnalogs: CelestialBody[];
  metrics: TerrainMetrics;
  provenance: Record<keyof TerrainMetrics, MetricProvenance>;
  demImageUrl: string;
  elevationProfile: ElevationProfilePoint[];
  rehearsalCards: MissionRehearsalCard[];
  evidencePassport: EvidencePassport;
  fieldResearchHistory: string;
}

export interface WeightPreset {
  relief: number;
  slope: number;
  roughness: number;
  hazards: number;
  lithology: number;
  environmental: number;
}

export interface FeatureScoreBreakdown {
  rawDistance: number;
  similarity: number; // 0 to 1
  weight: number;
  weightedScore: number;
  unit: string;
  refValue: string;
  earthValue: string;
}

export interface TopMismatch {
  feature: string;
  earthVal: string;
  refVal: string;
  impact: string;
}

export interface SimilarityResult {
  site: EarthCandidateSite;
  reference: PlanetaryReferenceSite;
  overallScore: number; // 0 to 100
  featureScores: Record<string, FeatureScoreBreakdown>;
  includedFeatures: string[];
  excludedFeatures: string[];
  dataCoveragePct: number;
  topMismatches: TopMismatch[];
  rankStabilityPct: number; // 0 to 100%
  rank: number;
  previousRank?: number;
}
