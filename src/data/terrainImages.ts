/**
 * Terrain and Planetary Imagery Registry
 * Ensures high-resolution, verified imagery for every planetary reference
 * and terrestrial analog site with zero broken assets.
 */

import atacamaImg from '../assets/images/atacama_analog_terrain_1791609843049.jpg';
import deathValleyImg from '../assets/images/death_valley_mars_analog_1791615682959.jpg';
import haughtonImg from '../assets/images/haughton_analog_terrain_1791609856537.jpg';
import jezeroImg from '../assets/images/jezero_crater_dem_1791609820711.jpg';
import lanzaroteImg from '../assets/images/lanzarote_lava_tubes_1791615653928.jpg';
import lunarMareImg from '../assets/images/lunar_mare_valley_dem_1791614326798.jpg';
import mariusHillsImg from '../assets/images/lunar_marius_skylight_1791615641068.jpg';
import galeMountSharpImg from '../assets/images/mars_gale_mount_sharp_1791615594805.jpg';
import vallesMarinerisImg from '../assets/images/mars_valles_marineris_1791615607455.jpg';
import mcmurdoImg from '../assets/images/mcmurdo_dry_valleys_1791615737910.jpg';
import meteorCraterImg from '../assets/images/meteor_crater_analog_1791615694897.jpg';
import oceanusProcellarumImg from '../assets/images/oceanus_procellarum_mare_1791615748708.jpg';
import rioTintoImg from '../assets/images/rio_tinto_mars_analog_1791615810477.jpg';
import shackletonImg from '../assets/images/shackleton_rim_dem_1791609831609.jpg';
import svalbardImg from '../assets/images/svalbard_permafrost_polygons_1791615823822.jpg';
import basaltImg from '../assets/images/volcanic_basalt_terrain_1791614313177.jpg';

export const TERRAIN_IMAGES: Record<string, string> = {
  // Planetary Reference Sites
  // Planetary Reference Sites (Canonical IDs & Aliases)
  'lunar-shackleton-rim': shackletonImg,
  'shackleton-rim': shackletonImg,
  'lunar-taurus-littrow': lunarMareImg,
  'taurus-littrow': lunarMareImg,
  'lunar-tranquillitatis-pit': mariusHillsImg,
  'tranquillitatis-pit': mariusHillsImg,
  'lunar-marius-hills': mariusHillsImg,
  'lunar-oceanus-procellarum': oceanusProcellarumImg,
  'mars-jezero-crater': jezeroImg,
  'jezero-crater': jezeroImg,
  'mars-gale-crater': galeMountSharpImg,
  'mars-gale-mount-sharp': galeMountSharpImg,
  'gale-mount-sharp': galeMountSharpImg,
  'mars-oxia-planum': vallesMarinerisImg,
  'oxia-planum': vallesMarinerisImg,
  'mars-valles-marineris': vallesMarinerisImg,

  // Terrestrial Analog Sites (full and canonical IDs)
  'atacama-yungay': atacamaImg,
  'haughton-crater': haughtonImg,
  'lanzarote-tubes': lanzaroteImg,
  'death-valley-mars-hill': deathValleyImg,
  'death-valley-fans': deathValleyImg,
  'iceland-askja-holuhraun': basaltImg,
  'askja-holuhraun': basaltImg,
  'hawaii-mauna-kea': basaltImg,
  'california-coso-volcanic': basaltImg,
  'coso-volcanic': basaltImg,
  'spain-rio-tinto': rioTintoImg,
  'rio-tinto': rioTintoImg,
  'svalbard-spitsbergen': svalbardImg,
  'svalbard-polygons': svalbardImg,
  'utah-hanksville-mdrs': deathValleyImg,
  'hanksville-mdrs': deathValleyImg,
  'arizona-meteor-crater': meteorCraterImg,
  'meteor-crater': meteorCraterImg,
  'antarctica-mcmurdo-dry-valleys': mcmurdoImg,
  'mcmurdo-dry-valleys': mcmurdoImg,
  'kilbourne-hole': lunarMareImg,
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

  // Smart geological class fallback for dynamically fetched API sites
  if (geologicalClass) {
    const geo = geologicalClass.toLowerCase();
    if (geo.includes('impact') || geo.includes('crater')) return meteorCraterImg;
    if (geo.includes('lava') || geo.includes('tube') || geo.includes('cave')) return lanzaroteImg;
    if (geo.includes('volcanic') || geo.includes('basalt') || geo.includes('ophiolite')) return basaltImg;
    if (geo.includes('polar') || geo.includes('ice') || geo.includes('glacier')) return mcmurdoImg;
    if (geo.includes('permafrost') || geo.includes('polygon')) return svalbardImg;
    if (geo.includes('hydrothermal') || geo.includes('acid') || geo.includes('iron')) return rioTintoImg;
    if (geo.includes('playa') || geo.includes('salt') || geo.includes('dune') || geo.includes('aeolian')) return deathValleyImg;
  }

  return defaultFallback && TERRAIN_IMAGES[defaultFallback] ? TERRAIN_IMAGES[defaultFallback] : atacamaImg;
}
