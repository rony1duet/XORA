# Analog Atlas - Project Implementation Plan

## 1. Executive Summary & Objective
Analog Atlas is a scientific exploration platform built for the NASA Space Apps Challenge 2026: *"Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars"*. Rather than superficial visual lookalikes, Analog Atlas identifies quantitative "Terrain Twins" based on multi-metric geospatial measurements, accompanied by an honest **Handicap Ledger** that accounts for planetary physics differences (gravity, vacuum, radiation, biology).

## 2. System Architecture
```
┌──────────────────────────────────────────────────────────────┐
│                      Client SPA (React 19)                    │
│  ┌───────────────┐ ┌────────────────┐ ┌───────────────────┐  │
│  │ Three.js Hero │ │ Interactive Map│ │ Split-World       │  │
│  │ 3D Celestial  │ │ Geospatial View│ │ Scrubber (DEM/Hill)│ │
│  └───────────────┘ └────────────────┘ └───────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Similarity Engine (Deterministic, Multi-Metric, Math)  │  │
│  │ • Exponential unit-scaled distance: s_i = exp(-d_i/τ_i)│  │
│  │ • Wasserstein slope distribution matching              │  │
│  │ • Categorical geological distance matrices             │  │
│  │ • Monte Carlo weight perturbation (500 iterations)     │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Curated Planetary & Terrestrial Geodatabase (Zod typed)│  │
│  │ • Reference targets: Moon (Artemis Pole, Taurus-       │  │
│  │   Littrow, Tranquillitatis Pit, Descartes Highlands)   │  │
│  │ • Reference targets: Mars (Jezero, Gale, Oxia Planum,  │  │
│  │   Olympus Lava Tube / Pavonis, Meridiani)              │  │
│  │ • Earth candidates: 12 verified terrestrial analogs    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 3. Data Integrity & Provenance Strategy
- Every parameter is tagged with one of:
  - `measured`: Derived directly from DEM / raster baselines (Copernicus DEM 30m, LOLA 100m, MOLA 128px/deg, HRSC 50m).
  - `literature`: Extracted from peer-reviewed planetary science publications (USGS Astrogeology, LPI, Planetary & Space Science).
  - `illustrative`: Mock or synthetic proxy where sensor coverage is missing, visibly labeled with a clear UI tag.
- Zero fake endorsements or fabricated metrics.

## 4. Phase Schedule
- Phase 0: Recon & Documentation (`PLAN.md`, `DECISIONS.md`, `DATA_VERIFICATION.md`, `ATTRIBUTION.md`).
- Phase 1: Core Type Models & Zod Schemas (`src/types/analog.ts`).
- Phase 2: Similarity Engine & Monte Carlo Stability (`src/services/similarityEngine.ts`). Unit tests in `src/services/similarityEngine.test.ts`.
- Phase 3: Planetary Reference & Earth Candidate Geodatabase (`src/data/planetaryReferences.ts`, `src/data/earthAnalogs.ts`, `src/data/datasets.ts`).
- Phase 4: UI Components (Navigation, Top Bar Contract, Handicap Ledger, Evidence Passport, Similarity Fingerprint, Split-World Scrubber, Weight Playground).
- Phase 5: 3D Celestial Hero with WebGL & Graceful Fallback (`src/components/CelestialHero3D.tsx`).
- Phase 6: All 8 Routes (Home, Explore, Compare, Site Profile, Rankings, Methodology, Data Sources, Reports, plus Guided Demo).
- Phase 7: Verification, Compilation, Tests, and Final Polish.
