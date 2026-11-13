/**
 * Dynamic Planetary & Terrestrial Terrain Registry
 * 100% Dynamic - Zero static image dependencies.
 * Powered by OpenPlanetary (USGS/NASA) and Copernicus/Esri orbital tile services.
 */

// Dynamic OpenPlanetary tile baselines for Moon & Mars
const OPM_MOON_BASE = 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-moon-basemap-v0-1/all';
const OPM_MARS_BASE = 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all';
const ESRI_EARTH_BASE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile';

export const TERRAIN_IMAGES: Record<string, string> = {
  // Planetary Reference Sites (Moon - OpenPlanetary LRO LOLA WAC Tiles)
  'lunar-shackleton-rim': `${OPM_MOON_BASE}/2/1/1.png`,
  'shackleton-rim': `${OPM_MOON_BASE}/2/1/1.png`,
  'moon_south_pole': `${OPM_MOON_BASE}/2/1/1.png`,
  'lunar-taurus-littrow': `${OPM_MOON_BASE}/2/2/1.png`,
  'taurus-littrow': `${OPM_MOON_BASE}/2/2/1.png`,
  'moon_hadley': `${OPM_MOON_BASE}/2/2/1.png`,
  'lunar-tranquillitatis-pit': `${OPM_MOON_BASE}/2/2/1.png`,
  'tranquillitatis-pit': `${OPM_MOON_BASE}/2/2/1.png`,
  'moon_maria': `${OPM_MOON_BASE}/2/2/1.png`,
  'lunar-marius-hills': `${OPM_MOON_BASE}/2/1/1.png`,
  'moon_marius': `${OPM_MOON_BASE}/2/1/1.png`,
  'lunar-oceanus-procellarum': `${OPM_MOON_BASE}/2/0/1.png`,

  // Planetary Reference Sites (Mars - OpenPlanetary Viking MDIM Tiles)
  'mars-jezero-crater': `${OPM_MARS_BASE}/2/2/1.png`,
  'jezero-crater': `${OPM_MARS_BASE}/2/2/1.png`,
  'mars_jezero': `${OPM_MARS_BASE}/2/2/1.png`,
  'mars-gale-crater': `${OPM_MARS_BASE}/2/3/2.png`,
  'mars-gale-mount-sharp': `${OPM_MARS_BASE}/2/3/2.png`,
  'gale-mount-sharp': `${OPM_MARS_BASE}/2/3/2.png`,
  'mars_gale': `${OPM_MARS_BASE}/2/3/2.png`,
  'mars-oxia-planum': `${OPM_MARS_BASE}/2/1/1.png`,
  'oxia-planum': `${OPM_MARS_BASE}/2/1/1.png`,
  'mars_utopia': `${OPM_MARS_BASE}/2/1/1.png`,
  'mars-valles-marineris': `${OPM_MARS_BASE}/2/1/2.png`,
  'mars_pavonis_skylight': `${OPM_MARS_BASE}/2/1/2.png`,

  // Terrestrial Analog Sites (Esri World Imagery Regional Tiles)
  'atacama-yungay': `${ESRI_EARTH_BASE}/5/10/18`,
  'haughton-crater': `${ESRI_EARTH_BASE}/5/3/10`,
  'lanzarote-tubes': `${ESRI_EARTH_BASE}/6/30/15`,
  'death-valley-mars-hill': `${ESRI_EARTH_BASE}/6/11/24`,
  'death-valley-fans': `${ESRI_EARTH_BASE}/6/11/24`,
  'iceland-askja-holuhraun': `${ESRI_EARTH_BASE}/6/8/30`,
  'askja-holuhraun': `${ESRI_EARTH_BASE}/6/8/30`,
  'hawaii-mauna-kea': `${ESRI_EARTH_BASE}/6/10/31`,
  'california-coso-volcanic': `${ESRI_EARTH_BASE}/6/11/24`,
  'coso-volcanic': `${ESRI_EARTH_BASE}/6/11/24`,
  'spain-rio-tinto': `${ESRI_EARTH_BASE}/6/31/15`,
  'rio-tinto': `${ESRI_EARTH_BASE}/6/31/15`,
  'svalbard-spitsbergen': `${ESRI_EARTH_BASE}/5/2/16`,
  'svalbard-polygons': `${ESRI_EARTH_BASE}/5/2/16`,
  'utah-hanksville-mdrs': `${ESRI_EARTH_BASE}/6/12/24`,
  'hanksville-mdrs': `${ESRI_EARTH_BASE}/6/12/24`,
  'arizona-meteor-crater': `${ESRI_EARTH_BASE}/6/12/25`,
  'meteor-crater': `${ESRI_EARTH_BASE}/6/12/25`,
  'antarctica-mcmurdo-dry-valleys': `${ESRI_EARTH_BASE}/4/2/14`,
  'mcmurdo-dry-valleys': `${ESRI_EARTH_BASE}/4/2/14`,
  'kilbourne-hole': `${ESRI_EARTH_BASE}/6/13/26`,
};

export function getTerrainImage(
  siteId: string,
  defaultFallback?: string,
  geologicalClass?: string
): string {
  if (defaultFallback && (defaultFallback.startsWith('http') || defaultFallback.startsWith('data:'))) {
    return defaultFallback;
  }
  if (TERRAIN_IMAGES[siteId]) {
    return TERRAIN_IMAGES[siteId];
  }

  // Dynamic fallback based on ID or geological class
  const lowerId = siteId.toLowerCase();
  if (lowerId.includes('moon') || lowerId.includes('lunar') || lowerId.includes('shackleton') || lowerId.includes('tranquillitatis') || lowerId.includes('marius') || lowerId.includes('hadley')) {
    return `${OPM_MOON_BASE}/2/1/1.png`;
  }
  if (lowerId.includes('mars') || lowerId.includes('jezero') || lowerId.includes('gale') || lowerId.includes('utopia') || lowerId.includes('pavonis')) {
    return `${OPM_MARS_BASE}/2/2/1.png`;
  }

  if (geologicalClass) {
    const geo = geologicalClass.toLowerCase();
    if (geo.includes('moon') || geo.includes('lunar')) return `${OPM_MOON_BASE}/2/1/1.png`;
    if (geo.includes('mars')) return `${OPM_MARS_BASE}/2/2/1.png`;
    if (geo.includes('crater')) return `${ESRI_EARTH_BASE}/6/12/25`;
    if (geo.includes('volcanic') || geo.includes('basalt')) return `${ESRI_EARTH_BASE}/6/8/30`;
    if (geo.includes('polar') || geo.includes('ice')) return `${ESRI_EARTH_BASE}/4/2/14`;
  }

  return `${ESRI_EARTH_BASE}/5/10/18`;
}
