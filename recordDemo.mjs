import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function record4KWalkthrough() {
  const videoDir = path.resolve('./videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  console.log('Launching 4K UHD browser session (3840x2160)...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--enable-webgl2',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--window-size=3840,2160',
      '--high-dpi-support=1'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 3840, height: 2160 },
    deviceScaleFactor: 1.25,
    recordVideo: {
      dir: videoDir,
      size: { width: 3840, height: 2160 }
    }
  });

  const page = await context.newPage();

  // Helper for safe clicking with fallback
  const safeClick = async (locator, waitMs = 1500) => {
    try {
      await locator.first().waitFor({ state: 'visible', timeout: 5000 });
      await locator.first().click({ timeout: 5000 });
      await page.waitForTimeout(waitMs);
      return true;
    } catch (e) {
      console.log('Notice: click skipped or already active:', e.message);
      return false;
    }
  };

  // Helper for smooth mouse dragging
  const smoothDrag = async (startX, startY, endX, endY, steps = 40, delay = 15) => {
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
  console.log('[0:00 - 0:25] SCENE 1: 4K 3D Celestial Hero & Baselines');
  console.log('=====================================================');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(6000); // Admire initial orbits, satellites, night city lights

  // Interactive 3D Orbit Rotations
  const canvas = page.locator('canvas').first();
  const cBox = await canvas.boundingBox();
  if (cBox) {
    const cx = cBox.x + cBox.width * 0.62;
    const cy = cBox.y + cBox.height * 0.45;
    // Rotate right
    await smoothDrag(cx, cy, cx - 450, cy + 50, 45, 20);
    await page.waitForTimeout(3000);
    // Rotate left and tilt
    await smoothDrag(cx - 300, cy, cx + 300, cy - 70, 45, 20);
    await page.waitForTimeout(3000);
  }

  // Smooth scroll down to Signature Proving Ground Baselines
  await smoothScroll(850, 3500);

  // Hover over the signature pair cards
  const pairCards = page.locator('section div[class*="rounded-2xl"]').all();
  const pairs = await pairCards;
  for (let i = 0; i < Math.min(3, pairs.length); i++) {
    try {
      await pairs[i].hover();
      await page.waitForTimeout(1500);
    } catch (_) {}
  }
  await page.waitForTimeout(2000);

  console.log('=====================================================');
  console.log('[0:25 - 0:52] SCENE 2: Explore Atlas & Global Candidates');
  console.log('=====================================================');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  // Navigate to Explore Atlas
  const exploreNav = page.locator('button:has-text("Explore Atlas")');
  await safeClick(exploreNav, 3000);

  // Switch between Moon and Mars target body in Explore view
  const moonBodyBtn = page.locator('button:has-text("Moon")');
  await safeClick(moonBodyBtn, 3000);

  const marsBodyBtn = page.locator('button:has-text("Mars")');
  await safeClick(marsBodyBtn, 3000);

  // Scroll down to examine candidate cards
  await smoothScroll(450, 3000);

  // Click on a candidate card
  const siteCard = page.locator('div:has-text("Atacama")').first();
  await safeClick(siteCard, 4000);

  console.log('=====================================================');
  console.log('[0:52 - 1:24] SCENE 3: Dual-World Comparator & 1:1 Scrubber');
  console.log('=====================================================');
  const compareNav = page.locator('button:has-text("Compare")');
  await safeClick(compareNav, 3500);

  // 1. Jezero Delta <-> Atacama Preset
  const jezeroPreset = page.locator('button:has-text("Jezero Delta")');
  await safeClick(jezeroPreset, 2500);

  // Scrub back and forth across 1:1 topography
  const scrubber = page.locator('div[style*="cursor: ew-resize"], div[role="slider"]').first();
  const sBox = await scrubber.boundingBox().catch(() => null);
  if (sBox) {
    const midX = sBox.x + sBox.width / 2;
    const midY = sBox.y + sBox.height / 2;
    // Drag left
    await smoothDrag(midX, midY, midX - 500, midY, 40, 20);
    await page.waitForTimeout(2000);
    // Drag right
    await smoothDrag(midX - 500, midY, midX + 500, midY, 50, 20);
    await page.waitForTimeout(2000);
    // Return to center
    await smoothDrag(midX + 500, midY, midX, midY, 35, 20);
    await page.waitForTimeout(1800);
  }

  // 2. Shackleton Rim <-> Haughton Preset
  const shackletonPreset = page.locator('button:has-text("Shackleton Rim")');
  await safeClick(shackletonPreset, 3000);

  // Scroll down to Topographic Fingerprint & Handicap Ledger
  await smoothScroll(650, 4000);

  console.log('=====================================================');
  console.log('[1:24 - 1:52] SCENE 4: Rankings Leaderboard & Playground');
  console.log('=====================================================');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  const rankingsNav = page.locator('button:has-text("Rankings")');
  await safeClick(rankingsNav, 3500);

  // Toggle Moon Leaderboard
  const moonRank = page.locator('button:has-text("Moon")');
  await safeClick(moonRank, 3000);

  // Toggle Mars Leaderboard
  const marsRank = page.locator('button:has-text("Mars")');
  await safeClick(marsRank, 3000);

  // Search Filter Interaction
  const searchInput = page.locator('input[placeholder*="Filter candidates"]').first();
  try {
    if (await searchInput.isVisible()) {
      await searchInput.fill('crater');
      await page.waitForTimeout(2000);
      await searchInput.fill('');
      await page.waitForTimeout(1500);
    }
  } catch (_) {}

  // Adjust Weight Sliders in Playground
  const sliders = page.locator('input[type="range"]').all();
  const sliderList = await sliders;
  if (sliderList.length >= 2) {
    try {
      await sliderList[0].fill('50');
      await page.waitForTimeout(2000);
      await sliderList[1].fill('40');
      await page.waitForTimeout(2500);
    } catch (_) {}
  }

  // Check 2 Candidates for Dual Comparison
  const checkboxes = page.locator('button[aria-label*="Select"]').all();
  const cList = await checkboxes;
  if (cList.length >= 2) {
    try {
      await cList[0].click();
      await page.waitForTimeout(1000);
      await cList[1].click();
      await page.waitForTimeout(3000); // Showcase floating bottom drawer
    } catch (_) {}
  }

  console.log('=====================================================');
  console.log('[1:52 - 2:05] SCENE 5: Cinematic Outro Return to Hero');
  console.log('=====================================================');
  const homeLogo = page.locator('button:has-text("XORA")').first();
  await safeClick(homeLogo, 2000);
  await page.waitForTimeout(7000); // Final orbital rotation beauty shot

  console.log('Finalizing 4K video recording...');
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    const finalDest = path.join(videoDir, 'xora_prototype_4k_walkthrough.webm');
    fs.copyFileSync(videoPath, finalDest);
    console.log('SUCCESS! 4K Prototype Video recorded and saved to:', finalDest);
  }
}

record4KWalkthrough().catch((err) => {
  console.error('Recording error:', err);
  process.exit(1);
});
