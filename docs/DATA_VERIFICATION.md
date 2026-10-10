# Analog Atlas - Data Verification & Provenance Catalog

All parameters within Analog Atlas carry explicit provenance metadata to maintain scientific rigor.

## Provenance Tiers
- **`measured`**: Directly calculated from public planetary or terrestrial DEM / remote sensing grids (e.g. LOLA 100m, MOLA 128px/deg, HRSC 50m, Copernicus DEM 30m, SRTM 30m) over standardized $25\text{ km} \times 25\text{ km}$ spatial bounding windows.
- **`literature`**: Extracted from cited, peer-reviewed scientific planetary literature and NASA/USGS mission publications (e.g., Apollo surface geology reports, Mars 2020 landing site papers, Artemis candidate site studies).
- **`illustrative`**: Synthesized proxy parameter where sensor coverage is missing or undergoing calibration; labeled prominently on screen.

## Verified Planetary Datasets
1. **Lunar Reconnaissance Orbiter (LRO) LOLA**:
   - Instrument: Lunar Orbiter Laser Altimeter (Goddard Space Flight Center / NASA)
   - Product: Polar Stereographic Digital Elevation Model (LOLA RDR)
   - Resolution: 20m - 100m/pixel (polar regions)
   - Access: NASA Planetary Data System (PDS) Geosciences Node / Moon Trek
2. **Mars Global Surveyor MOLA & Mars Express HRSC**:
   - Instrument: Mars Orbiter Laser Altimeter & High Resolution Stereo Camera
   - Product: Blended MOLA-HRSC Global DEM (Fergason et al., 2018)
   - Resolution: 200m/pixel (global), HRSC regional 50m/pixel
   - Access: USGS Astrogeology / Mars Trek
3. **Copernicus DEM GLO-30 / SRTM**:
   - Product: Global 30-meter Digital Surface Model
   - Resolution: 30m (1 arc-second)
   - Coverage: Global terrestrial landmass
   - Access: European Space Agency / OpenTopography
4. **WorldClim v2.1 Climate & Aridity**:
   - Resolution: 30 arc-seconds (~1 km)
   - Parameters: Mean annual precipitation, aridity index, diurnal temperature range
   - Access: Fick & Hijmans (2017)

## Planetary Reference Sites Catalog (Verified Coordinates)
- **Shackleton Crater Rim (Moon)**: $89.9^\circ\text{S}, 0.0^\circ\text{E}$ (Artemis polar exploration candidate, permanent shadow adjacent to peaks of eternal light)
- **Taurus-Littrow Valley (Moon)**: $20.19^\circ\text{N}, 30.77^\circ\text{E}$ (Apollo 17 landing site, mare-highlands boundary, pyroclastic deposits)
- **Mare Tranquillitatis Pit (Moon)**: $8.33^\circ\text{N}, 33.22^\circ\text{E}$ (Lava-tube collapse skylight, subsurface habitat candidate)
- **Descartes Highlands (Moon)**: $8.97^\circ\text{S}, 15.50^\circ\text{E}$ (Apollo 16 landing site, heavily cratered anorthositic crust)
- **Jezero Crater (Mars)**: $18.38^\circ\text{N}, 77.58^\circ\text{E}$ (Perseverance rover, ancient river delta, lacustrine clays, Jezero delta fan)
- **Gale Crater & Mt. Sharp (Mars)**: $5.38^\circ\text{S}, 137.44^\circ\text{E}$ (Curiosity rover, layered sulfate and hematite strata, Aeolis Mons)
- **Oxia Planum (Mars)**: $18.27^\circ\text{N}, 335.37^\circ\text{E}$ (ExoMars Rosalyn Franklin candidate, phyllosilicate clay plains)
- **Pavonis Mons Lava Tubes (Mars)**: $0.8^\circ\text{N}, 246.6^\circ\text{E}$ (Tharsis volcanic province, pit chains and candidate lava tubes)
