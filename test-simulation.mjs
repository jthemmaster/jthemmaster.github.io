import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'fs';

const SCREENSHOT_DIR = '/workspace/screenshots';

async function takeScreenshot(page, path) {
  const buf = await page.screenshot({ encoding: 'binary' });
  writeFileSync(path, buf);
  console.log(`  -> Screenshot saved: ${path}`);
}

async function extractMetrics(page) {
  return await page.evaluate(() => {
    const metrics = {};
    const allText = document.body.innerText;
    
    const metricLabels = ['TEMPERATURE', 'ENERGY', 'BONDS', 'ATOMS'];
    for (const label of metricLabels) {
      const regex = new RegExp(label + '\\s*\\n\\s*([\\d.,\\-+eE]+)', 'i');
      const match = allText.match(regex);
      if (match) {
        metrics[label.toLowerCase()] = match[1];
      }
    }

    const stepMatch = allText.match(/Step\s+([\d,]+)/);
    if (stepMatch) metrics.step = stepMatch[1];

    const statusMatch = allText.match(/(Running|Paused|Ready)/);
    if (statusMatch) metrics.status = statusMatch[1];

    const spsMatch = allText.match(/([\d,]+)\s*steps\/s/);
    if (spsMatch) metrics.stepsPerSecond = spsMatch[1];

    return metrics;
  });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/local/bin/google-chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1600,1000',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  console.log('=== Step 1: Opening http://localhost:5173 ===');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await delay(5000);

  // Screenshot 1: Initial state
  console.log('\n=== Step 2: Screenshot 1 - Initial State ===');
  await takeScreenshot(page, `${SCREENSHOT_DIR}/01-initial-state.png`);
  let metrics = await extractMetrics(page);
  console.log('Initial metrics:', JSON.stringify(metrics, null, 2));

  // Step 3: Click Run button
  console.log('\n=== Step 3: Clicking Run button ===');
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const runBtn = buttons.find(b => b.textContent.includes('Run'));
    if (runBtn) runBtn.click();
  });
  console.log('Run button clicked, waiting 10 seconds...');

  await delay(10000);

  // Screenshot 2: After 10s running
  console.log('\n=== Step 4: Screenshot 2 - After 10s running ===');
  metrics = await extractMetrics(page);
  console.log('After 10s metrics:', JSON.stringify(metrics, null, 2));
  await takeScreenshot(page, `${SCREENSHOT_DIR}/02-after-10s-running.png`);

  // Wait another 15 seconds (25 total)
  console.log('\n=== Step 5: Waiting 15 more seconds (25 total) ===');
  await delay(15000);

  // Screenshot 3: After 25s total
  console.log('\n=== Step 5: Screenshot 3 - After 25s total ===');
  metrics = await extractMetrics(page);
  console.log('After 25s metrics:', JSON.stringify(metrics, null, 2));
  await takeScreenshot(page, `${SCREENSHOT_DIR}/03-after-25s-running.png`);

  // Step 6: Stability check
  const temp25 = parseFloat((metrics.temperature || '0').replace(/,/g, ''));
  const energy25 = parseFloat((metrics.energy || '0').replace(/,/g, ''));
  console.log('\n=== Step 6: Stability Check ===');
  console.log(`Temperature: ${temp25}K - ${temp25 > 0 && temp25 < 100000 ? 'STABLE' : 'POSSIBLY EXPLODED'}`);
  console.log(`Energy: ${energy25}eV - ${Math.abs(energy25) < 10000 ? 'STABLE' : 'POSSIBLY EXPLODED'}`);

  // Step 7: Pause, switch to Methane Combustion preset
  console.log('\n=== Step 7: Switching to Methane Combustion preset ===');
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const pauseBtn = buttons.find(b => b.textContent.includes('Pause'));
    if (pauseBtn) pauseBtn.click();
  });
  await delay(500);

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const methaneBtn = buttons.find(b => b.textContent.includes('Methane Combustion'));
    if (methaneBtn) methaneBtn.click();
  });
  console.log('Methane Combustion selected');
  await delay(1000);

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const runBtn = buttons.find(b => b.textContent.includes('Run'));
    if (runBtn) runBtn.click();
  });
  console.log('Run button clicked, waiting 5 seconds...');
  await delay(5000);

  // Screenshot 4: Methane Combustion
  console.log('\n=== Step 7: Screenshot 4 - Methane Combustion ===');
  metrics = await extractMetrics(page);
  console.log('Methane Combustion metrics:', JSON.stringify(metrics, null, 2));
  await takeScreenshot(page, `${SCREENSHOT_DIR}/04-methane-combustion.png`);

  // Step 8: Increase Confinement Force to ~30
  console.log('\n=== Step 8: Increasing Confinement Force to ~30 ===');
  const sliderInfo = await page.evaluate(() => {
    const sliders = [...document.querySelectorAll('input[type="range"]')];
    return sliders.map((s, i) => ({ index: i, max: s.max, step: s.step, value: s.value }));
  });
  console.log('All sliders:', JSON.stringify(sliderInfo));

  await page.evaluate(() => {
    const sliders = [...document.querySelectorAll('input[type="range"]')];
    const forceSlider = sliders.find(s => s.max === '50' && s.step === '0.5');
    if (forceSlider) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(forceSlider, 30);
      forceSlider.dispatchEvent(new Event('input', { bubbles: true }));
      forceSlider.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  console.log('Confinement Force set to 30, waiting 5 seconds...');
  await delay(5000);

  // Screenshot 5: After force increase
  console.log('\n=== Step 8: Screenshot 5 - After Confinement Force ~30 ===');
  metrics = await extractMetrics(page);
  console.log('After Force=30 metrics:', JSON.stringify(metrics, null, 2));
  await takeScreenshot(page, `${SCREENSHOT_DIR}/05-confinement-force-30.png`);

  console.log('\n=== All tests complete! ===');
  await browser.close();
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
