import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { execSync } from 'child_process';

async function recordComprehensive1080p60fps() {
  const videoDir = path.resolve('./videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  // Clear previous videos
  const existingFiles = fs.readdirSync(videoDir);
  for (const f of existingFiles) {
    try {
      fs.unlinkSync(path.join(videoDir, f));
    } catch (_) {}
  }

  console.log('Launching 1080p browser session with hardware WebGL flags...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--enable-webgl2',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--window-size=1920,1080'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  // Helper for safe clicking
  const safeClick = async (locator, waitMs = 1500) => {
    try {
      await locator.first().waitFor({ state: 'visible', timeout: 5000 });
      await locator.first().click({ timeout: 5000 });
      await page.waitForTimeout(waitMs);
      return true;
    } catch (e) {
      console.log('Notice: step skipped:', e.message);
      return false;
    }
  };

  // Helper for smooth mouse dragging
  const smoothDrag = async (startX, startY, endX, endY, steps = 35, delay = 15) => {
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    const dx = (endX - startX) / steps;
    const dy = (endY - startY) / steps;
    for (let i = 1; i <= steps; i++) {
      await page.mouse.move(startX + dx * i, startY + dy * i);
      await page.waitForTimeout(delay);
    }
    await page.mouse.up();
  };

  // Helper for smooth scrolling
  const smoothScroll = async (y, waitMs = 2000) => {
    await page.evaluate((top) => window.scrollBy({ top, behavior: 'smooth' }), y);
    await page.waitForTimeout(waitMs);
  };

  console.log('=====================================================');
  console.log('[0:00 - 0:18] SCENE 1: 3D Celestial Hero & Controls');
  console.log('=====================================================');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000); // Orbiting planetary system & telemetry satellites

  // Test Simulation Pause & Resume Controls
  const pauseBtn = page.locator('button[title*="Pause"]').first();
  if (await pauseBtn.isVisible()) {
    await safeClick(pauseBtn, 1400);
    const resumeBtn = page.locator('button[title*="Resume"]').first();
    await safeClick(resumeBtn, 1400);
  }

  // Interactive 3D Orbit Rotations
  const canvas = page.locator('canvas').first();
  const cBox = await canvas.boundingBox();
  if (cBox) {
    const cx = cBox.x + cBox.width * 0.65;
    const cy = cBox.y + cBox.height * 0.48;
    await smoothDrag(cx, cy, cx - 280, cy + 30, 30, 20);
    await page.waitForTimeout(1400);
    await smoothDrag(cx - 150, cy, cx + 200, cy - 30, 30, 20);
    await page.waitForTimeout(1400);
  }

  // Smooth scroll down to Signature Proving Ground Baselines
  await smoothScroll(650, 2500);

  // Hover over the signature pair cards
  const pairCards = page.locator('section div[class*="rounded-2xl"]').all();
  const pairs = await pairCards;
  for (let i = 0; i < Math.min(3, pairs.length); i++) {
    try {
      await pairs[i].hover();
      await page.waitForTimeout(1100);
    } catch (_) {}
  }
  await page.waitForTimeout(1000);

  console.log('=====================================================');
  console.log('[0:18 - 0:48] SCENE 2: Atlas Explorer, Map Views, Jumps & Candidates');
  console.log('=====================================================');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // Navigate to Explore Atlas
  const exploreNav = page.locator('button:has-text("Explore Atlas")');
  await safeClick(exploreNav, 2500);

  // Select Mars body and Jezero Crater as reference
  const marsBodyBtn = page.locator('button:has-text("Mars")').first();
  await safeClick(marsBodyBtn, 1800);

  // Select reference dropdown: Jezero Crater (Delta and Floor)
  const refSelect = page.locator('select').first();
  try {
    await refSelect.selectOption({ label: 'Jezero Crater (Delta & Floor) (Perseverance Landing Ellipse & River Delta Fan)' });
    await page.waitForTimeout(1500);
  } catch (_) {
    try {
      await refSelect.selectOption('mars-jezero-crater');
      await page.waitForTimeout(1500);
    } catch (_) {}
  }

  // 1. Showcase Different Map Views: Satellite, Topographic, Dark Matter
  console.log('Demonstrating Map Views: Satellite, Topographic, Dark Matter...');
  const satBtn = page.locator('button:has-text("Satellite")').first();
  await safeClick(satBtn, 2400);

  const topoBtn = page.locator('button:has-text("Topographic")').first();
  await safeClick(topoBtn, 2400);

  const darkBtn = page.locator('button:has-text("Dark Matter")').first();
  await safeClick(darkBtn, 2000);

  // 2. Showcase Different Quick Region Jumps: Atacama, Lanzarote, Haughton, World
  console.log('Demonstrating Region Jumps: Atacama, Lanzarote, Haughton, World...');
  const jumpAtacama = page.locator('button:has-text("Atacama")').first();
  await safeClick(jumpAtacama, 2200);

  const jumpLanzarote = page.locator('button:has-text("Lanzarote")').first();
  await safeClick(jumpLanzarote, 2200);

  const jumpHaughton = page.locator('button:has-text("Haughton")').first();
  await safeClick(jumpHaughton, 2200);

  const jumpWorld = page.locator('button:has-text("World")').first();
  await safeClick(jumpWorld, 1800);

  // 3. Showcase Candidate Changes in "Ranked Terrestrial Candidates for Jezero Crater"
  console.log('Demonstrating Candidate selection updates for Jezero Crater...');
  await smoothScroll(420, 1800);

  // Click Candidate #1 (Atacama)
  const candidate1 = page.locator('div:has-text("Ranked Terrestrial Candidates")').locator('div[class*="cursor-pointer"]').nth(0);
  if (await candidate1.isVisible()) {
    await safeClick(candidate1, 1800);
  }

  // Click Candidate #2 (Death Valley)
  const candidate2 = page.locator('div:has-text("Ranked Terrestrial Candidates")').locator('div[class*="cursor-pointer"]').nth(1);
  if (await candidate2.isVisible()) {
    await safeClick(candidate2, 1800);
  }

  // Click Candidate #3 (Haughton or Lanzarote)
  const candidate3 = page.locator('div:has-text("Ranked Terrestrial Candidates")').locator('div[class*="cursor-pointer"]').nth(2);
  if (await candidate3.isVisible()) {
    await safeClick(candidate3, 2000);
  }

  console.log('=====================================================');
  console.log('[0:48 - 1:24] SCENE 3: Dual-World Comparator, Fixed Slider, Elevation Transect & Glyph');
  console.log('=====================================================');
  const compareNav = page.locator('button:has-text("Compare")');
  await safeClick(compareNav, 2500);

  // Configure exact requested selectors:
  // 1. Planetary Target: Jezero Crater (Delta & Floor) (Mars)
  console.log('Setting 1. Planetary Target to Jezero Crater...');
  const targetSelect = page.locator('div:has(label:has-text("1. Planetary Target")) select').first();
  if (await targetSelect.isVisible()) {
    try {
      await targetSelect.selectOption('mars-jezero-crater');
    } catch (e) {
      console.log('Target select fallback:', e.message);
    }
    await page.waitForTimeout(1500);
  }

  // 2. Earth Analog Twin: Lanzarote Volcanic Caves (Corona System) (Spain)
  console.log('Setting 2. Earth Analog Twin to Lanzarote Volcanic Caves...');
  const earthSelect = page.locator('div:has(label:has-text("2. Earth Analog Twin")) select').first();
  if (await earthSelect.isVisible()) {
    try {
      await earthSelect.selectOption('lanzarote-tubes');
    } catch (e) {
      console.log('Earth twin select fallback:', e.message);
    }
    await page.waitForTimeout(1800);
  }

  // 3. Rehearsal Objective: Weight Preset dropdown
  console.log('Setting 3. Rehearsal Objective dropdown...');
  const activitySelect = page.locator('div:has(label:has-text("3. Rehearsal Objective")) select').first();
  if (await activitySelect.isVisible()) {
    try {
      await activitySelect.selectOption('lava-tube');
      await page.waitForTimeout(1800);
      await activitySelect.selectOption('rover-traverse');
      await page.waitForTimeout(1800);
    } catch (e) {
      console.log('Activity select fallback:', e.message);
    }
  }

  // Smoothly move the fixed Split-World Comparison slider left and right
  console.log('Testing fixed Split-World Comparison Slider (left and right)...');
  const scrubberContainer = page.locator('div.cursor-ew-resize').first();
  const sBox = await scrubberContainer.boundingBox().catch(() => null);
  if (sBox) {
    const midX = sBox.x + sBox.width * 0.5;
    const midY = sBox.y + sBox.height * 0.5;
    
    // Drag smoothly left to 22%
    await page.mouse.move(midX, midY);
    await page.mouse.down();
    for (let p = 0.5; p >= 0.22; p -= 0.02) {
      await page.mouse.move(sBox.x + sBox.width * p, midY);
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(1200);

    // Drag smoothly right to 78%
    for (let p = 0.22; p <= 0.78; p += 0.02) {
      await page.mouse.move(sBox.x + sBox.width * p, midY);
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(1200);

    // Return smoothly to center 50%
    for (let p = 0.78; p >= 0.5; p -= 0.02) {
      await page.mouse.move(sBox.x + sBox.width * p, midY);
      await page.waitForTimeout(25);
    }
    await page.mouse.up();
    await page.waitForTimeout(1200);
  }

  // Switch between Topographic Imagery and Elevation Transect
  console.log('Switching to Elevation Transect...');
  const elevTransectBtn = page.locator('button:has-text("Elevation Transect")').first();
  if (await elevTransectBtn.isVisible()) {
    await safeClick(elevTransectBtn, 3000);
    console.log('Switching back to Topographic Imagery...');
    const topoImageryBtn = page.locator('button:has-text("Topographic Imagery")').first();
    await safeClick(topoImageryBtn, 2000);
  }

  // Scroll down to Radial Glyph and Metric Correlation Table
  console.log('Highlighting Radial Glyph (Topographic Fingerprint) & Correlation Table...');
  await smoothScroll(500, 3000);

  // Expand Handicap Ledger physical boundaries
  const ledgerItem = page.locator('div:has-text("The Handicap Ledger")').locator('div[class*="cursor-pointer"]').nth(1);
  if (await ledgerItem.isVisible()) {
    await safeClick(ledgerItem, 2500);
  }

  console.log('=====================================================');
  console.log('[1:24 - 1:52] SCENE 4: Leaderboard, Data Table, Presets & Weight Sliders');
  console.log('=====================================================');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  const rankingsNav = page.locator('button:has-text("Rankings")');
  await safeClick(rankingsNav, 2500);

  // Toggle Moon & Mars Leaderboard
  const moonRank = page.locator('button:has-text("Moon")').first();
  await safeClick(moonRank, 2000);

  const marsRank = page.locator('button:has-text("Mars")').first();
  await safeClick(marsRank, 2000);

  // Showcase Mission Activity Presets in Weight Playground
  console.log('Testing Mission Activity Presets in Weight Playground...');
  const roverPreset = page.locator('div:has-text("Mission Activity Presets") button:has-text("Rover Traverse")').first();
  if (await roverPreset.isVisible()) await safeClick(roverPreset, 1500);

  const lavaPreset = page.locator('div:has-text("Mission Activity Presets") button:has-text("Lava Tube")').first();
  if (await lavaPreset.isVisible()) await safeClick(lavaPreset, 1800);

  const icePreset = page.locator('div:has-text("Mission Activity Presets") button:has-text("Polar Ice")').first();
  if (await icePreset.isVisible()) await safeClick(icePreset, 1800);

  const isruPreset = page.locator('div:has-text("Mission Activity Presets") button:has-text("Excavation & ISRU")').first();
  if (await isruPreset.isVisible()) await safeClick(isruPreset, 1800);

  // Adjust Range Sliders in Weight Playground
  console.log('Adjusting Weight Playground sliders...');
  const sliders = page.locator('input[type="range"]').all();
  const sliderList = await sliders;
  if (sliderList.length >= 3) {
    try {
      await sliderList[0].fill('50');
      await page.waitForTimeout(1400);
      await sliderList[1].fill('45');
      await page.waitForTimeout(1400);
      await sliderList[2].fill('35');
      await page.waitForTimeout(1800);
    } catch (_) {}
  }

  // Search Filter Interaction in Candidates Data Table
  console.log('Filtering Candidates Data Table...');
  const searchInput = page.locator('input[placeholder*="Filter candidates"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('caves');
    await page.waitForTimeout(1600);
    await searchInput.fill('');
    await page.waitForTimeout(1200);
  }

  // Select 2 candidates to showcase the floating comparison drawer
  const checkboxes = page.locator('button[aria-label*="Select"]').all();
  const cList = await checkboxes;
  if (cList.length >= 2) {
    try {
      await cList[0].click();
      await page.waitForTimeout(800);
      await cList[1].click();
      await page.waitForTimeout(2500); // Showcase floating bottom drawer
    } catch (_) {}
  }

  console.log('=====================================================');
  console.log('[1:52 - 2:05] SCENE 5: Cinematic Outro Return to Hero');
  console.log('=====================================================');
  const homeLogo = page.locator('button:has-text("XORA")').first();
  await safeClick(homeLogo, 1500);
  await page.waitForTimeout(5500); // Concluding orbital beauty shot

  console.log('Finalizing raw browser recording...');
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const rawPath = await video.path();
    const finalMp4Path = path.join(videoDir, 'xora_prototype_1080p_60fps.mp4');

    console.log('Converting to 1920x1080 60fps MP4 (H.264 visually lossless)...');
    const ffmpegCmd = `"${ffmpeg.path}" -y -i "${rawPath}" -r 60 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "${finalMp4Path}"`;
    execSync(ffmpegCmd, { stdio: 'inherit' });

    // Clean up temporary raw webm file so only the high-quality MP4 remains
    if (fs.existsSync(rawPath)) {
      try {
        fs.unlinkSync(rawPath);
      } catch (_) {}
    }

    console.log('SUCCESS! Master 1080p 60fps MP4 Video recorded and saved to:');
    console.log(finalMp4Path);
  }
}

recordComprehensive1080p60fps().catch((err) => {
  console.error('Recording error:', err);
  process.exit(1);
});
