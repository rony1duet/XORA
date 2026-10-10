# XORA: Earth · Moon · Mars Terrain Twin Explorer
### NASA Space Apps Challenge 2026: *"Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars"*

> **"For a specific mission activity on the Moon or Mars, which place on Earth is the best terrain twin, how close is the match, and exactly where does Earth fail to be a twin?"**

Tagline: *"Rehearse other worlds on this one."*

---

## 1. Overview & Science Objective
Most space-analog tools assemble a collection of scenic landscapes that merely *look* like other planets in red or gray RGB photography. **XORA** replaces qualitative impressions with rigorous quantitative planetary science.

Using calibrated Digital Elevation Models (DEMs) and remote sensing baselines from NASA's Lunar Reconnaissance Orbiter (LOLA), Mars Global Surveyor (MOLA), Mars Express (HRSC), HiRISE, and Copernicus DEM GLO-30, XORA computes multidimensional mathematical similarity across 6 physical domains:
1. **Topographic Relief & Range**: Macro elevation variance across 25 km analysis footprints.
2. **Slope Distribution**: 1D Wasserstein (Earth Mover's) distance across 5 slope bins (0–5°, 5–10°, 10–15°, 15–20°, >20°) paired with mean gradient.
3. **Surface Micro-Roughness**: Root-mean-square (RMS) height variation evaluated at a 10-meter spatial baseline.
4. **Boulder / Pit Crater Density**: Obstacle and skylight collapse hazard density per square kilometer.
5. **Bedrock Lithology**: Petrological affinity matrix (volcanic basalt, impact breccia, deltaic mudstones, anorthosites).
6. **Environmental Aridity & Thermal Swings**: UNEP aridity index and diurnal temperature fluctuations.

---

## 2. Signature Features

### I. Terrain Twin Finder & Live Leaderboard
Choose a reference lunar region (Shackleton Crater Rim, Taurus-Littrow Valley, Mare Tranquillitatis Pit) or Martian region (Jezero Crater Delta, Gale Crater & Mt. Sharp, Oxia Planum) plus a specific mission activity (Rover traverse, Landing hazard, Habitat siting, Lava-tube exploration, Polar-ice coring, Excavation ISRU, Optical navigation). The engine dynamically computes multi-metric similarity scores and returns the #1 quantitative twin with an explainable score breakdown.

### II. Split-World Scrubber
A draggable visual divider comparing the planetary reference orbital hillshade and the Earth analog candidate under matched scale and illumination angles, accompanied by a synchronized 25-kilometer radial cross-section elevation transect. (Clearly labeled as a visual morphological aid; rankings are computed from the multi-metric feature vector).

### III. Similarity Fingerprint
A compact radial radar glyph plotting multidimensional similarity ($s_i = \exp(-d_i/\tau_i)$) across all 6 physical axes at a glance, paired with an accessible data table.

### IV. The Handicap Ledger
**Honest limitation is our defining scientific feature.** A dedicated panel itemizes fundamental physical divergences Earth cannot replicate:
- **Gravity**: Earth 9.81 m/s² vs Moon 1.62 m/s² (16.5%) vs Mars 3.71 m/s² (37.8%)
- **Atmospheric Pressure**: Earth 101.3 kPa vs Moon $10^{-10}$ Pa vs Mars 0.6–0.85 kPa
- **Ionizing Radiation**: Earth 2.4 mSv/yr vs Moon 380 mSv/yr vs Mars ~250 mSv/yr
- **Electrostatic Jagged Regolith**: Vacuum triboelectric charging and lack of erosional rounding
- **Active Hydrology & Biology**: Capillary moisture and organic microbial binding
For each difference, the ledger explicitly details **which mission test activities remain valid** and **which tests are invalidated** or require hardware gravity-offloading and vacuum chamber simulation.

### V. Weight Playground & Monte Carlo Rank Stability
Real-time sliders allow mission planners and judges to modify priority weights. Rather than displaying arbitrary rankings, a client-side **Monte Carlo weight perturbation engine (500 draws, $\pm 20\%$ weight jitter, Mulberry32 seeded pseudo-RNG)** calculates a **Rank Stability metric** (e.g., "94.2% stability"), showing whether the top pick survives weight sensitivity changes.

### VI. Evidence Passport
Every site profile features an Evidence Passport documenting dataset sources, spatial resolution, acquisition dates, 25km spatial footprint coverage %, confidence tier rating, and known sensor gaps. Every metric carries an explicit provenance tag:
- `measured`: Derived directly from DEM / raster baselines.
- `literature`: Extracted from peer-reviewed publications and NASA/USGS mission reports.
- `illustrative`: Transparently marked proxy values.

### VII. Mission Rehearsal Cards
Concrete operational test cards for each site, tagged either `supported by data` or `inferred`, providing geological reasoning and recommended field execution protocols.

### VIII. 3-Minute Guided Judge Walkthrough (`/demo`)
A tailored walkthrough allowing judges to experience the full 7-step evaluation flow in under 3 minutes.

---

## 3. Architecture & Tech Stack

- **Framework**: React 19 + TypeScript (Strict) on Vite
- **3D Celestial Graphics**: Three.js WebGL physically styled Earth with atmospheric Fresnel glow, Moon, and Mars, with graceful static SVG fallback.
- **Styling**: Tailwind CSS v4 following the Universal Frontend Design Constitution (60-30-10 palette, Zero-Pill typography, strict 3-zone Top Bar contract, tabular numerals).
- **Icons**: Lucide React
- **Validation**: Zod schema definitions
- **State & Routing**: URL synchronized pushState router (`/`, `/explore`, `/compare`, `/sites/:id`, `/rankings`, `/methodology`, `/data-sources`, `/reports`, `/demo`).

---

## 4. Verified Datasets & Sources

| Dataset | Body | Instrument / Agency | Resolution | License |
| :--- | :--- | :--- | :--- | :--- |
| **LOLA RDR Polar DEM** | Moon | LRO / NASA GSFC | 20m - 100m/px | Public Domain |
| **LROC NAC DTMs** | Moon | LRO / ASU / NASA | 1m - 2m/px | Public Domain |
| **MOLA-HRSC Blended DEM** | Mars | MGS / Mars Express / USGS | 200m/px | Public Domain |
| **HiRISE Targeted DTMs** | Mars | MRO / Univ of Arizona | 1m/px | Public Domain |
| **Copernicus DEM GLO-30** | Earth | TanDEM-X / ESA / Airbus | 30m/px | Open Access |
| **USGS 3DEP LiDAR** | Earth | USGS | 1m - 10m/px | Public Domain |
| **WorldClim v2.1** | Earth | UC Davis / Fick & Hijmans | 30 arc-sec (~1km) | CC-BY 4.0 |

---

## 5. Mathematical Scoring Formulation

$$S = 100 \times \frac{\sum w_i \cdot s_i}{\sum w_i}$$

Continuous feature similarity:
$$s_i = \exp\left(-\frac{d_i}{\tau_i}\right)$$

Where characteristic scales are:
- $\tau_{\text{relief}} = 600\text{ m}$
- $\tau_{\text{slope}} = 5.0^\circ$ (Wasserstein distance across 5 slope bins)
- $\tau_{\text{roughness}} = 0.75\text{ m RMS}$ (10m baseline)
- $\tau_{\text{hazards}} = 40\text{ features / km}^2$
- $\tau_{\text{aridity}} = 0.35$

---

## 6. Verification & Test Suite
Unit tests in `src/services/similarityEngine.test.ts` verify:
1. Lithology affinity matrix symmetry ($M_{ij} = M_{ji}$).
2. Self-similarity identity ($S(A, A) = 100.0\%$).
3. Scoring bounds ($0 \le S \le 100$).
4. Wasserstein metric non-negativity and identity of indiscernibles.
5. Monte Carlo 500-draw stability determinism across seeded iterations.
6. Mission-activity differentiation sensitivity.

Tests can be executed in-browser directly via the `/methodology` page.

---

## 7. Installation & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server on port 3000
npm run dev

# 3. Build for production
npm run build

# 4. Typecheck and lint
npm run lint
```
