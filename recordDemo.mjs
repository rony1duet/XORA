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
    fs.unlinkSync(path.join(videoDir, f));
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
  console.log('[0:00 - 0:25] SCENE 1: 3D Celestial Hero & Controls');
  console.log('=====================================================');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000); // 3D planetary orbits & satellites

  // Test Simulation Pause & Resume Controls
  const pauseBtn = page.locator('button[title*="Pause"]').first();
  if (await pauseBtn.isVisible()) {
    await safeClick(pauseBtn, 1500);
    const resumeBtn = page.locator('button[title*="Resume"]').first();
    await safeClick(resumeBtn, 1500);
  }

  // Interactive 3D Orbit Rotations
  const canvas = page.locator('canvas').first();
  const cBox = await canvas.boundingBox();
  if (cBox) {
    const cx = cBox.x + cBox.width * 0.65;
    const cy = cBox.y + cBox.height * 0.48;
    // Rotate right
    await smoothDrag(cx, cy, cx - 350, cy + 40, 40, 20);
    await page.waitForTimeout(2000);
    // Rotate left and tilt
    await smoothDrag(cx - 200, cy, cx + 250, cy - 50, 40, 20);
    await page.waitForTimeout(2000);
  }

  // Smooth scroll down to Signature Proving Ground Baselines
  await smoothScroll(750, 3000);

  // Hover over the signature pair cards
  const pairCards = page.locator('section div[class*="rounded-2xl"]').all();
  const pairs = await pairCards;
  for (let i = 0; i < Math.min(3, pairs.length); i++) {
    try {
      await pairs[i].hover();
      await page.waitForTimeout(1400);
    } catch (_) {}
  }
  await page.waitForTimeout(1500);

  console.log('=====================================================');
  console.log('[0:25 - 0:52] SCENE 2: Explore Atlas & Deep Site Dossier');
  console.log('=====================================================');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1200);

  // Navigate to Explore Atlas
  const exploreNav = page.locator('button:has-text("Explore Atlas")');
  await safeClick(exploreNav, 3000);

  // Switch between Moon and Mars target body in Explore view
  const moonBodyBtn = page.locator('button:has-text("Moon")');
  await safeClick(moonBodyBtn, 2500);

  const marsBodyBtn = page.locator('button:has-text("Mars")');
  await safeClick(marsBodyBtn, 2500);

  // Scroll down to examine candidate cards
  await smoothScroll(450, 2500);

  // Click on a candidate card to open Site Profile View
  const profileLink = page.locator('button:has-text("View Site Profile"), div:has-text("Atacama") button:has-text("Profile")').first();
  if (await profileLink.isVisible()) {
    await safeClick(profileLink, 3500);
    // Scroll through the detailed Site Dossier
    await smoothScroll(600, 3000);
    // Return to Explore
    const backBtn = page.locator('button:has-text("Back to Explorer"), button:has-text("Back to Atlas")').first();
    await safeClick(backBtn, 2000);
  }

  console.log('=====================================================');
  console.log('[0:52 - 1:24] SCENE 3: Dual-World Comparator & Scrubber');
  console.log('=====================================================');
  const compareNav = page.locator('button:has-text("Compare")');
  await safeClick(compareNav, 3000);

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
    await smoothDrag(midX, midY, midX - 400, midY, 35, 20);
    await page.waitForTimeout(1800);
    // Drag right
    await smoothDrag(midX - 400, midY, midX + 400, midY, 45, 20);
    await page.waitForTimeout(1800);
    // Return to center
    await smoothDrag(midX + 400, midY, midX, midY, 30, 20);
    await page.waitForTimeout(1500);
  }

  // Toggle between Imagery and Elevation Profile view modes
  const elevProfileToggle = page.locator('button:has-text("Elevation Profile")').first();
  if (await elevProfileToggle.isVisible()) {
    await safeClick(elevProfileToggle, 2500);
    const imageryToggle = page.locator('button:has-text("Imagery")').first();
    await safeClick(imageryToggle, 1800);
  }

  // 2. Shackleton Rim <-> Haughton Preset
  const shackletonPreset = page.locator('button:has-text("Shackleton Rim")');
  await safeClick(shackletonPreset, 3000);

  // Scroll down to Topographic Fingerprint & Handicap Ledger
  await smoothScroll(550, 3500);

  // Expand Handicap Ledger item
  const ledgerItem = page.locator('div:has-text("The Handicap Ledger")').locator('div[class*="cursor-pointer"]').nth(1);
  if (await ledgerItem.isVisible()) {
    await safeClick(ledgerItem, 2500);
  }

  console.log('=====================================================');
  console.log('[1:24 - 1:52] SCENE 4: Rankings Leaderboard & Playground');
  console.log('=====================================================');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1200);

  const rankingsNav = page.locator('button:has-text("Rankings")');
  await safeClick(rankingsNav, 3000);

  // Toggle Moon Leaderboard
  const moonRank = page.locator('button:has-text("Moon")');
  await safeClick(moonRank, 2500);

  // Toggle Mars Leaderboard
  const marsRank = page.locator('button:has-text("Mars")');
  await safeClick(marsRank, 2500);

  // Search Filter Interaction
  const searchInput = page.locator('input[placeholder*="Filter candidates"]').first();
  try {
    if (await searchInput.isVisible()) {
      await searchInput.fill('crater');
      await page.waitForTimeout(1800);
      await searchInput.fill('');
      await page.waitForTimeout(1200);
    }
  } catch (_) {}

  // Adjust Weight Sliders in Playground
  const sliders = page.locator('input[type="range"]').all();
  const sliderList = await sliders;
  if (sliderList.length >= 2) {
    try {
      await sliderList[0].fill('50');
      await page.waitForTimeout(1800);
      await sliderList[1].fill('40');
      await page.waitForTimeout(2000);
    } catch (_) {}
  }

  // Check 2 Candidates for Dual Comparison
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
  await page.waitForTimeout(6000); // Final orbital rotation beauty shot

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
