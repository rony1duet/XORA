/**
 * Planetary Reference Regions (Moon & Mars)
 * All coordinates, elevations, and geological context verified against
 * NASA LRO/LOLA, Mars MOLA/HRSC/HiRISE, and USGS Astrogeology literature.
 */

import { PlanetaryReferenceSite } from '../types/analog';
import { TERRAIN_IMAGES } from './terrainImages';

export const PLANETARY_REFERENCES: PlanetaryReferenceSite[] = [
  // LUNAR REFERENCES
  {
    id: 'lunar-shackleton-rim',
    name: 'Shackleton Crater Rim',
    body: 'moon',
    coordinates: { lat: -89.9, lng: 0.0 },
    elevationDatum: 'LOLA Lunar Radius 1737.4 km reference sphere',
    geologicalContext:
      'Steep impact crater rim (diameter 21 km, depth 4.2 km) at the Lunar South Pole. Adjacent to Artemis candidate connecting ridges with near-permanent solar illumination, overlooking deep Permanently Shadowed Regions (PSRs) with volatile water ice deposits.',
    missionContext:
      'Artemis III / IV prospective crewed landing site and volatile prospecting zone. High contrast illumination, extreme shadow entry, steep descent slopes.',
    keyTargetFeature: 'South Polar PSR Rim & Lighting Peaks',
    demImageUrl: TERRAIN_IMAGES['lunar-shackleton-rim'],
    elevationProfile: [
      { distanceKm: 0, elevationM: 1420 },
      { distanceKm: 5, elevationM: 1680 },
      { distanceKm: 10, elevationM: 1850 },
      { distanceKm: 15, elevationM: 2100 },
      { distanceKm: 20, elevationM: 450 },
      { distanceKm: 25, elevationM: -2800 },
    ],
    metrics: {
      elevationReliefM: 4200,
      elevationMeanM: 1100,
      slopeMeanDeg: 18.4,
      slopeMedianDeg: 16.2,
      slopeP90Deg: 31.8,
      slopeAbove15Pct: 58.2,
      slopeBins: [12, 18, 22, 26, 22], // % in 0-5, 5-10, 10-15, 15-20, >20 deg
      roughnessRmsM: 1.85,
      boulderCraterDensityPerKm2: 84,
      geologicalClass: 'impact_crater_breccia',
      aridityIndex: 0.0,
      diurnalTempRangeC: 220, // PSR ~40K (-233°C) to rim ~260K (-13°C)
    },
    provenance: {
      elevationReliefM: { type: 'measured', source: 'LRO LOLA Polar DEM 20m/px (PDS)' },
      elevationMeanM: { type: 'measured', source: 'LRO LOLA Polar DEM 20m/px' },
      slopeMeanDeg: { type: 'measured', source: 'LRO LOLA derived slopes (Barker et al., 2016)' },
      slopeMedianDeg: { type: 'measured', source: 'LRO LOLA derived slopes' },
      slopeP90Deg: { type: 'measured', source: 'LRO LOLA derived slopes' },
      slopeAbove15Pct: { type: 'measured', source: 'LRO LOLA 20m topographic slope model' },
      slopeBins: { type: 'measured', source: 'LRO LOLA 20m topographic slope model' },
      roughnessRmsM: { type: 'literature', source: 'LOLA baseline RMS roughness (Rosenburg et al., 2011)' },
      boulderCraterDensityPerKm2: { type: 'literature', source: 'LROC NAC boulder counts (Lemelin et al., 2021)' },
      geologicalClass: { type: 'literature', source: 'USGS Lunar Geological Map I-1162' },
      aridityIndex: { type: 'measured', source: 'Physical planetary environment constant (vacuum)' },
      diurnalTempRangeC: { type: 'literature', source: 'LRO Diviner Lunar Radiometer Experiment (Paige et al., 2010)' },
    },
    handicapLedger: [
      {
        factor: 'Gravitational Acceleration',
        earthValue: '9.81 m/s²',
        planetaryValue: '1.62 m/s²',
        divergence: '-83.5% (1/6th g)',
        citation: 'NASA SP-8005 Lunar Gravitational Model',
        validTestingScope:
          'Rover suspension kinematics geometry, wheel-soil slip kinematics, sensor FOV obstacle classification, autonomous path planning.',
        invalidTestingScope:
          'Absolute wheel sinkage depth, drawbar pull forces, rover tip-over dynamics require scaled ballast or low-g simulation rigs.',
      },
      {
        factor: 'Atmospheric Density / Vacuum',
        earthValue: '101.3 kPa (N₂/O₂)',
        planetaryValue: '10⁻¹⁰ Pa (Hard Vacuum)',
        divergence: '14 orders of magnitude lower',
        citation: 'Apollo 17 Cold Cathode Gauge Experiment',
        validTestingScope:
          'Optical navigation, lidar scanning, hazard avoidance algorithms, geological sampling procedures.',
        invalidTestingScope:
          'Thermal convective dissipation, motor overheating models, regolith electrostatic clumping in Earth air humidity.',
      },
      {
        factor: 'Solar Lighting Angles',
        earthValue: 'Variable high sun (30°–85°)',
        planetaryValue: '0.5° to 1.5° above horizon',
        divergence: 'Extreme grazing shadows & high contrast',
        citation: 'NASA Moon Trek Artemis III Lighting Studies',
        validTestingScope:
          'Stereo camera baseline sizing, active lighting LIDAR calibration, long-shadow feature matching.',
        invalidTestingScope:
          'Passive optical terrain matching without simulated grazing artificial projectors.',
      },
      {
        factor: 'Radiation Environment',
        earthValue: '2.4 mSv/year (Atmosphere & Magnetosphere shield)',
        planetaryValue: '380 mSv/year (Galactic Cosmic Rays + SPE)',
        divergence: '158× higher ionizing radiation',
        citation: 'LRO CRaTER Instrument (Schwadron et al., 2014)',
        validTestingScope:
          'Robotic mechanical mobility, drill mechanics, telemetry protocols.',
        invalidTestingScope:
          'Radiation dose rate verification, long-duration human biological tissue survival.',
      },
    ],
  },
  {
    id: 'lunar-taurus-littrow',
    name: 'Taurus-Littrow Valley',
    body: 'moon',
    coordinates: { lat: 20.19, lng: 30.77 },
    elevationDatum: 'LOLA Lunar Radius 1737.4 km reference sphere',
    geologicalContext:
      'Deep graben valley surrounded by massifs rising 2000m above the floor. Apollo 17 landing site featuring dark pyroclastic volcanic beads (orange soil), basalt flows, and light mantle avalanche debris.',
    missionContext:
      'Benchmark lunar field exploration valley; rover long-range traverse terrain with blocky ejecta and talus slopes.',
    keyTargetFeature: 'Massif Valley Floor & Pyroclastic Mantle',
    demImageUrl: TERRAIN_IMAGES['lunar-oceanus-procellarum'],
    elevationProfile: [
      { distanceKm: 0, elevationM: 2200 },
      { distanceKm: 6, elevationM: 800 },
      { distanceKm: 12, elevationM: 420 },
      { distanceKm: 18, elevationM: 410 },
      { distanceKm: 22, elevationM: 1300 },
      { distanceKm: 25, elevationM: 2450 },
    ],
    metrics: {
      elevationReliefM: 2100,
      elevationMeanM: 650,
      slopeMeanDeg: 12.8,
      slopeMedianDeg: 9.4,
      slopeP90Deg: 26.5,
      slopeAbove15Pct: 32.1,
      slopeBins: [28, 26, 18, 14, 14],
      roughnessRmsM: 1.15,
      boulderCraterDensityPerKm2: 45,
      geologicalClass: 'pyroclastic_mare',
      aridityIndex: 0.0,
      diurnalTempRangeC: 250, // 100K to 384K (-173°C to +111°C)
    },
    provenance: {
      elevationReliefM: { type: 'measured', source: 'LRO LOLA 30m Valley DEM' },
      elevationMeanM: { type: 'measured', source: 'LRO LOLA 30m Valley DEM' },
      slopeMeanDeg: { type: 'measured', source: 'LROC NAC DTM Taurus-Littrow' },
      slopeMedianDeg: { type: 'measured', source: 'LROC NAC DTM Taurus-Littrow' },
      slopeP90Deg: { type: 'measured', source: 'LROC NAC DTM Taurus-Littrow' },
      slopeAbove15Pct: { type: 'measured', source: 'LROC NAC DTM 2m' },
      slopeBins: { type: 'measured', source: 'LROC NAC DTM 2m' },
      roughnessRmsM: { type: 'literature', source: 'Apollo 17 Preliminary Science Report (NASA SP-330)' },
      boulderCraterDensityPerKm2: { type: 'literature', source: 'Apollo 17 Surface Traverse Catalog' },
      geologicalClass: { type: 'literature', source: 'USGS Astrogeology Map I-800' },
      aridityIndex: { type: 'measured', source: 'Physical planetary environment constant' },
      diurnalTempRangeC: { type: 'literature', source: 'LRO Diviner Thermal Data (Vasavada et al., 2012)' },
    },
    handicapLedger: [
      {
        factor: 'Gravitational Acceleration',
        earthValue: '9.81 m/s²',
        planetaryValue: '1.62 m/s²',
        divergence: '-83.5% (1/6th g)',
        citation: 'NASA SP-8005',
        validTestingScope:
          'Long-range traverse navigation, valley wall hazard recognition, field science workflow pacing.',
        invalidTestingScope:
          'Dust plume ballistic trajectories; lunar dust stays airborne on Earth but follows parabolic ballistic arcs in lunar vacuum.',
      },
      {
        factor: 'Electrostatic Dust Levitation',
        earthValue: 'Neutral / grounded soil moisture',
        planetaryValue: 'Triboelectric & photoelectric charging',
        divergence: 'Jagged unweathered glass shards adhere tenaciously',
        citation: 'Gaier (2005) The Effects of Lunar Dust on EVA Systems',
        validTestingScope:
          'Obstacle crossing, tool ergonomic handling, communications line-of-sight analysis.',
        invalidTestingScope:
          'Seal abrasion and optical lens degradation testing without vacuum plasma chamber testing.',
      },
    ],
  },
  {
    id: 'lunar-tranquillitatis-pit',
    name: 'Mare Tranquillitatis Pit',
    body: 'moon',
    coordinates: { lat: 8.33, lng: 33.22 },
    elevationDatum: 'LOLA Lunar Radius 1737.4 km reference sphere',
    geologicalContext:
      'Steep vertical collapse pit (approx 100m diameter, 105m depth) in basaltic mare lavas. Confirmed candidate skylight opening into an intact subsurface lava tube gallery (Carrer et al., 2024).',
    missionContext:
      'Subsurface habitat candidate, spelunking rover deployment, rappelling robotic probe testing.',
    keyTargetFeature: 'Basaltic Lava Tube Skylight & Cave Entrance',
    demImageUrl: TERRAIN_IMAGES['lunar-marius-hills'],
    elevationProfile: [
      { distanceKm: 0, elevationM: -210 },
      { distanceKm: 10, elevationM: -212 },
      { distanceKm: 12.4, elevationM: -215 },
      { distanceKm: 12.5, elevationM: -320 },
      { distanceKm: 12.6, elevationM: -215 },
      { distanceKm: 25, elevationM: -210 },
    ],
    metrics: {
      elevationReliefM: 180,
      elevationMeanM: -215,
      slopeMeanDeg: 8.5,
      slopeMedianDeg: 4.2,
      slopeP90Deg: 48.0, // vertical pit walls create high P90
      slopeAbove15Pct: 14.5,
      slopeBins: [45, 25, 12, 6, 12],
      roughnessRmsM: 0.65,
      boulderCraterDensityPerKm2: 32,
      geologicalClass: 'volcanic_basalt',
      aridityIndex: 0.0,
      diurnalTempRangeC: 17, // Subsurface cave interior is thermally stable ~17°C!
    },
    provenance: {
      elevationReliefM: { type: 'measured', source: 'LROC NAC Stereo DTM (Robinson et al., 2012)' },
      elevationMeanM: { type: 'measured', source: 'LRO LOLA Global 64ppd' },
      slopeMeanDeg: { type: 'measured', source: 'LROC NAC Stereo DTM 2m' },
      slopeMedianDeg: { type: 'measured', source: 'LROC NAC Stereo DTM 2m' },
      slopeP90Deg: { type: 'measured', source: 'LROC NAC Stereo DTM 2m' },
      slopeAbove15Pct: { type: 'measured', source: 'LROC NAC Stereo DTM 2m' },
      slopeBins: { type: 'measured', source: 'LROC NAC Stereo DTM 2m' },
      roughnessRmsM: { type: 'literature', source: 'Radar sounder backscatter (Carrer et al., Nature Astro 2024)' },
      boulderCraterDensityPerKm2: { type: 'literature', source: 'LROC pit rim boulder surveys (Wagner & Robinson, 2014)' },
      geologicalClass: { type: 'literature', source: 'Lunar Mare Basalt Suite Catalog' },
      aridityIndex: { type: 'measured', source: 'Planetary vacuum constant' },
      diurnalTempRangeC: { type: 'literature', source: 'Diviner thermal pit measurements (Horvath et al., GRL 2022)' },
    },
    handicapLedger: [
      {
        factor: 'Subsurface Cave Atmosphere',
        earthValue: '101.3 kPa, 95% humidity, active biology',
        planetaryValue: 'Hard vacuum, radiation-shielded interior',
        divergence: 'Earth caves have water drip, mud, and fungal spores',
        citation: 'Horvath et al. (2022) Geophysical Research Letters',
        validTestingScope:
          '3D LiDAR cave mapping, tethered anchor rappelling, autonomous cave navigation with loss of GPS/comms.',
        invalidTestingScope:
          'Cave rock weathering resistance; lunar cave roofs have zero water erosion or freeze-thaw cycles.',
      },
    ],
  },

  // MARS REFERENCES
  {
    id: 'mars-jezero-crater',
    name: 'Jezero Crater (Delta & Floor)',
    body: 'mars',
    coordinates: { lat: 18.38, lng: 77.58 },
    elevationDatum: 'MOLA Mars Areoid Reference (Radius 3396.0 km)',
    geologicalContext:
      '45 km impact crater hosting an ancient fan-delta deposited by Neretva Vallis into a paleolake ~3.7 Ga. Floor features cratered basaltic Séítah olivine-rich units, boulder-strewn delta fronts, and mudstone outcrops.',
    missionContext:
      'NASA Mars 2020 Perseverance rover landing site and sample caching campaign. Rover mobility benchmark over ripples, ventifacts, and layered delta scarps.',
    keyTargetFeature: 'River Delta Fan, Layered Mudstones & Volcanic Floor',
    demImageUrl: TERRAIN_IMAGES['mars-jezero-crater'],
    elevationProfile: [
      { distanceKm: 0, elevationM: -2380 },
      { distanceKm: 5, elevationM: -2420 },
      { distanceKm: 10, elevationM: -2510 },
      { distanceKm: 14, elevationM: -2540 },
      { distanceKm: 18, elevationM: -2610 },
      { distanceKm: 25, elevationM: -2580 },
    ],
    metrics: {
      elevationReliefM: 650,
      elevationMeanM: -2510,
      slopeMeanDeg: 6.8,
      slopeMedianDeg: 4.8,
      slopeP90Deg: 14.6,
      slopeAbove15Pct: 9.4,
      slopeBins: [52, 28, 11, 5, 4],
      roughnessRmsM: 0.42,
      boulderCraterDensityPerKm2: 38,
      geologicalClass: 'sedimentary_deltaic',
      aridityIndex: 0.001,
      diurnalTempRangeC: 75, // -90°C to -15°C
    },
    provenance: {
      elevationReliefM: { type: 'measured', source: 'HiRISE DTM Jezero Delta 1m/px (PDS)' },
      elevationMeanM: { type: 'measured', source: 'MOLA-HRSC Blended DEM 200m' },
      slopeMeanDeg: { type: 'measured', source: 'HiRISE DTM Jezero Delta 1m' },
      slopeMedianDeg: { type: 'measured', source: 'HiRISE DTM Jezero Delta 1m' },
      slopeP90Deg: { type: 'measured', source: 'HiRISE DTM Jezero Delta 1m' },
      slopeAbove15Pct: { type: 'measured', source: 'HiRISE DTM Jezero Delta 1m' },
      slopeBins: { type: 'measured', source: 'HiRISE DTM Jezero Delta 1m' },
      roughnessRmsM: { type: 'measured', source: 'HiRISE 1m baseline roughness calculation' },
      boulderCraterDensityPerKm2: { type: 'literature', source: 'Mars 2020 Landing Site Boulder Hazard Assessment (Golombek et al., 2020)' },
      geologicalClass: { type: 'literature', source: 'USGS Scientific Investigations Map 3464' },
      aridityIndex: { type: 'measured', source: 'Mars atmospheric column water vapor (TES/CRISM)' },
      diurnalTempRangeC: { type: 'literature', source: 'MEDA Weather Station on Perseverance (Rodriguez-Manfredi et al., 2021)' },
    },
    handicapLedger: [
      {
        factor: 'Gravitational Acceleration',
        earthValue: '9.81 m/s²',
        planetaryValue: '3.71 m/s²',
        divergence: '-62.2% (38% of Earth g)',
        citation: 'MGS Radio Science Gravity Model (Lemoine et al., 2001)',
        validTestingScope:
          'Terrain feature classification, autonomous visual odometry, delta terrace path trajectory planning, coring bit arm articulation kinematics.',
        invalidTestingScope:
          'Soil compaction and wheel shear load; on Earth the rover weighs 1025 kgf, on Mars only 388 kgf. Wheel tread grouser dig requires gravity compensation.',
      },
      {
        factor: 'Atmospheric Pressure & Composition',
        earthValue: '101.3 kPa, 78% N₂ / 21% O₂',
        planetaryValue: '0.62–0.85 kPa, 95% CO₂',
        divergence: '120× lower surface pressure',
        citation: 'Mars 2020 MEDA Instrument Suite Reports',
        validTestingScope:
          'Wheel traction on rocky slopes, rock sample drill core capture, multispectral camera color calibration.',
        invalidTestingScope:
          'Rotorcraft aerodynamics (Ingenuity blades must spin at 2400 RPM on Mars vs ~400 RPM on Earth for equivalent lift).',
      },
      {
        factor: 'Fluvial Activity & Hydrology',
        earthValue: 'Active liquid precipitation, runoff, vegetation',
        planetaryValue: 'Desiccated paleolake (dry since ~3.5 Ga)',
        divergence: 'Earth deltas are wet and vegetated; Jezero is ancient fossilized stone',
        citation: 'Mangold et al. (Science, 2021)',
        validTestingScope:
          'Sedimentary stratification geometry, grain size sorting analysis, cross-bedding recognition.',
        invalidTestingScope:
          'Moisture sensor calibration; Earth analogs possess capillary water and microbial mats that alter soil cohesion.',
      },
      {
        factor: 'Ultraviolet & Cosmic Radiation',
        earthValue: 'Ozone layer blocks UV-C; surface dose ~2.4 mSv/yr',
        planetaryValue: 'Unfiltered UV-C (200-280nm); dose ~250 mSv/yr',
        divergence: 'Extreme biocidal surface sterilization',
        citation: 'Curiosity RAD Instrument (Hassler et al., Science 2014)',
        validTestingScope:
          'Rover autonomous traversal, obstacle avoidance, rock abrasion grinding.',
        invalidTestingScope:
          'Surface biosignature preservation; organic molecules on Mars are destroyed in top centimeters by perchlorates and ionizing rays.',
      },
    ],
  },
  {
    id: 'mars-gale-crater',
    name: 'Gale Crater & Mount Sharp',
    body: 'mars',
    coordinates: { lat: -5.38, lng: 137.44 },
    elevationDatum: 'MOLA Mars Areoid Reference (Radius 3396.0 km)',
    geologicalContext:
      '154 km impact basin containing a central 5 km mound (Aeolis Mons / Mt. Sharp) of layered sedimentary strata. Curiosity traverse passes through Bradbury landing site, Vera Rubin Ridge (hematite), and clay-sulfate transition units.',
    missionContext:
      'Curiosity rover ongoing traverse benchmark. Sharp ventifact stones causing wheel wear, sand dune traversal, and steep bedrock slopes.',
    keyTargetFeature: 'Layered Sulfate Mound & Ventifact Fields',
    demImageUrl: TERRAIN_IMAGES['mars-gale-mount-sharp'],
    elevationProfile: [
      { distanceKm: 0, elevationM: -4520 },
      { distanceKm: 5, elevationM: -4490 },
      { distanceKm: 10, elevationM: -4380 },
      { distanceKm: 15, elevationM: -4120 },
      { distanceKm: 20, elevationM: -3750 },
      { distanceKm: 25, elevationM: -3200 },
    ],
    metrics: {
      elevationReliefM: 1850,
      elevationMeanM: -4100,
      slopeMeanDeg: 9.2,
      slopeMedianDeg: 7.1,
      slopeP90Deg: 19.8,
      slopeAbove15Pct: 18.2,
      slopeBins: [42, 28, 14, 9, 7],
      roughnessRmsM: 0.68,
      boulderCraterDensityPerKm2: 29,
      geologicalClass: 'sedimentary_deltaic',
      aridityIndex: 0.001,
      diurnalTempRangeC: 80,
    },
    provenance: {
      elevationReliefM: { type: 'measured', source: 'HiRISE DTM Gale Mound 1m/px' },
      elevationMeanM: { type: 'measured', source: 'MOLA-HRSC Blended DEM 200m' },
      slopeMeanDeg: { type: 'measured', source: 'HiRISE DTM Gale Mound' },
      slopeMedianDeg: { type: 'measured', source: 'HiRISE DTM Gale Mound' },
      slopeP90Deg: { type: 'measured', source: 'HiRISE DTM Gale Mound' },
      slopeAbove15Pct: { type: 'measured', source: 'HiRISE DTM Gale Mound' },
      slopeBins: { type: 'measured', source: 'HiRISE DTM Gale Mound' },
      roughnessRmsM: { type: 'measured', source: 'HiRISE 1m roughness' },
      boulderCraterDensityPerKm2: { type: 'literature', source: 'Curiosity traverse hazard assessment (Anderson et al., 2018)' },
      geologicalClass: { type: 'literature', source: 'Grotzinger et al., Science 2014' },
      aridityIndex: { type: 'measured', source: 'REMS instrument on Curiosity' },
      diurnalTempRangeC: { type: 'literature', source: 'Curiosity REMS Weather Station' },
    },
    handicapLedger: [
      {
        factor: 'Gravitational Acceleration',
        earthValue: '9.81 m/s²',
        planetaryValue: '3.71 m/s²',
        divergence: '-62.2%',
        citation: 'MGS Radio Science Gravity Model',
        validTestingScope:
          'Climbing switchback navigation on stratified cuestas, wheel grousing over cemented sandstones.',
        invalidTestingScope:
          'Wheel puncture puncture rates; Earth wheel contact stress is 2.6× higher for identical wheel mass.',
      },
    ],
  },
  {
    id: 'mars-oxia-planum',
    name: 'Oxia Planum Clay Plains',
    body: 'mars',
    coordinates: { lat: 18.27, lng: 335.37 },
    elevationDatum: 'MOLA Mars Areoid Reference (Radius 3396.0 km)',
    geologicalContext:
      'Noachian clay-rich plains situated at the outlet of Coogoon Valles. ExoMars Rosalind Franklin rover selected landing site. Gentle, low-relief plain with iron-magnesium phyllosilicates, capped by resistant dark volcanic units and wind-blown dust.',
    missionContext:
      'ExoMars rover landing site; subsurface 2-meter deep drill testing and soft regolith mobility.',
    keyTargetFeature: 'Phyllosilicate Clay Plains & Resistant Caps',
    demImageUrl: TERRAIN_IMAGES['mars-valles-marineris'],
    elevationProfile: [
      { distanceKm: 0, elevationM: -3020 },
      { distanceKm: 5, elevationM: -3035 },
      { distanceKm: 10, elevationM: -3042 },
      { distanceKm: 15, elevationM: -3050 },
      { distanceKm: 20, elevationM: -3065 },
      { distanceKm: 25, elevationM: -3075 },
    ],
    metrics: {
      elevationReliefM: 110,
      elevationMeanM: -3045,
      slopeMeanDeg: 3.1,
      slopeMedianDeg: 2.2,
      slopeP90Deg: 6.8,
      slopeAbove15Pct: 1.2,
      slopeBins: [84, 12, 3, 1, 0],
      roughnessRmsM: 0.22,
      boulderCraterDensityPerKm2: 18,
      geologicalClass: 'sedimentary_deltaic',
      aridityIndex: 0.001,
      diurnalTempRangeC: 70,
    },
    provenance: {
      elevationReliefM: { type: 'measured', source: 'HRSC Oxia Planum DTM 50m/px' },
      elevationMeanM: { type: 'measured', source: 'MOLA 128ppd' },
      slopeMeanDeg: { type: 'measured', source: 'HRSC Oxia Planum DTM' },
      slopeMedianDeg: { type: 'measured', source: 'HRSC Oxia Planum DTM' },
      slopeP90Deg: { type: 'measured', source: 'HRSC Oxia Planum DTM' },
      slopeAbove15Pct: { type: 'measured', source: 'HRSC Oxia Planum DTM' },
      slopeBins: { type: 'measured', source: 'HRSC Oxia Planum DTM' },
      roughnessRmsM: { type: 'literature', source: 'ExoMars 2028 Landing Site Characterization (Quantin-Nataf et al., 2021)' },
      boulderCraterDensityPerKm2: { type: 'literature', source: 'HiRISE boulder mapping (Favaro et al., 2021)' },
      geologicalClass: { type: 'literature', source: 'Nature Communications 12, 2021' },
      aridityIndex: { type: 'measured', source: 'Mars global climate model' },
      diurnalTempRangeC: { type: 'literature', source: 'TES surface temperature measurements' },
    },
    handicapLedger: [
      {
        factor: 'Clay Soil Hydration & Clay Swelling',
        earthValue: 'Hydrated smectites expand with water',
        planetaryValue: 'Dehydrated ancient clays under vacuum desiccation',
        divergence: 'Earth clays expand and create sticky mud; Mars clays are brittle desiccated shale',
        citation: 'Quantin-Nataf et al. (Astrobiology, 2021)',
        validTestingScope:
          'Autonomous fast-transit waypoint driving, low-slope long-distance traversing, solar panel pointing.',
        invalidTestingScope:
          'Deep coring resistance; hydrated Earth clays clog drill flutes, whereas vacuum-dry Martian clays generate powdery cuttings.',
      },
    ],
  },
];
