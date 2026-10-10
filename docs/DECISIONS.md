# Analog Atlas - Architecture & Engineering Decisions

## DECISION-001: Client-Side React SPA with URL State Routing
- **Context**: The application requires instant interactivity across eight distinct analytical views (`/`, `/explore`, `/compare`, `/sites/:id`, `/rankings`, `/methodology`, `/data-sources`, `/reports`, `/demo`).
- **Choice**: Utilize lightweight browser pushState / URLSearchParams synchronized state management. All filter criteria, active reference site, mission activity, custom feature weights, and candidate shortlists persist cleanly in the URL, allowing direct deep-linking and bookmarking without server overhead or hydration mismatch.

## DECISION-002: Deterministic Similarity Engine with Unit-Aware Exponential Decay
- **Context**: Comparing planetary terrain requires combining heterogeneous physical properties (elevation relief in meters, slope distribution in degrees, roughness RMS height in meters, boulder density per 100m², geological lithology, and environmental aridity).
- **Choice**:
  - $s_i = \exp(-d_i / \tau_i)$, where $\tau_i$ is calibrated to the characteristic scale of each physical dimension.
  - Distribution metrics (slope bins: 0–5°, 5–10°, 10–15°, 15–20°, >20°) use Earth Mover's / 1D Wasserstein distance.
  - Categorical lithology uses a symmetric geomorphological affinity matrix defined by petrological compatibility.
  - Aggregate score: $S = 100 \times \frac{\sum w_i s_i}{\sum w_i}$, evaluated strictly across available features with coverage penalties explicitly reported.

## DECISION-003: Monte Carlo Rank Stability Calculation
- **Context**: Judges and scientists need to know if a #1 ranking is fragile (sensitive to slight weight shifts) or robust.
- **Choice**: Run a 500-iteration Monte Carlo perturbation on the client ($w_k' = w_k \cdot (1 + \delta_k)$, $\delta_k \sim U[-0.2, +0.2]$) using a seeded pseudo-random number generator (Mulberry32) for deterministic, reproducible results. Report the exact percentage of iterations where the top candidate retains its rank.

## DECISION-004: Pure Three.js WebGL Celestial Hero with Resilient Fallback
- **Context**: The hero requires a cinematic, physically styled Earth, Moon, and Mars scene with atmosphere Fresnel glow, soft terminator, and interactive coordinate links.
- **Choice**: Direct Three.js WebGL canvas lifecycle inside a React component with explicit cleanup of geometries, textures, materials, and requestAnimationFrame handles. Includes `webglcontextlost` handling and a static editorial celestial diagram fallback if WebGL is unavailable or user requests reduced motion.

## DECISION-005: Honest Handicap Ledger as a First-Class Domain Model
- **Context**: No place on Earth possesses 0.16g or an atmospheric pressure of 0.6 kPa.
- **Choice**: Every site profile and comparison incorporates an unskippable "Handicap Ledger" itemizing physical, atmospheric, radiation, triboelectric, and hydrological divergence, with concrete notes on which mission activities remain valid despite each handicap.
