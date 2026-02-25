import puppeteer from 'puppeteer-core';
import fs from 'fs';

const SCREENSHOTS_DIR = '/workspace/screenshots';
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/local/bin/google-chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();

  const consoleMessages = [];
  const consoleErrors = [];
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`[PAGE ERROR] ${err.message}`);
  });

  console.log('=== STEP 1: Navigate to http://localhost:5173 ===');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('Page loaded successfully');

  // Wait a moment for React to render and 3D scene to initialize
  await sleep(3000);

  console.log('\n=== STEP 2: Take initial full-page screenshot ===');
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-initial-load.png`, fullPage: false });
  console.log('Screenshot saved: 01-initial-load.png');

  console.log('\n=== STEP 3: Check 3D viewer (canvas) ===');
  const canvasEl = await page.$('canvas');
  if (canvasEl) {
    const canvasBox = await canvasEl.boundingBox();
    console.log(`Canvas found: ${canvasBox.width}x${canvasBox.height} at (${canvasBox.x}, ${canvasBox.y})`);
    
    // Check if canvas has rendered content (non-blank)
    const canvasDataURL = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return null;
      try {
        return c.toDataURL().substring(0, 100);
      } catch(e) {
        return 'cross-origin-blocked';
      }
    });
    console.log(`Canvas data: ${canvasDataURL}`);
  } else {
    console.log('WARNING: No canvas element found - 3D viewer may not be rendering');
  }

  console.log('\n=== STEP 4: Check sidebar controls ===');
  
  // Check for sidebar
  const sidebarTexts = await page.evaluate(() => {
    const body = document.body.innerText;
    const checks = {
      hasTemperature: body.includes('Temperature') || body.includes('temperature'),
      hasRadius: body.includes('Radius') || body.includes('radius'),
      hasForce: body.includes('Force') || body.includes('force'),
      hasPreset: body.includes('Preset') || body.includes('preset') || body.includes('PRESET'),
      hasRun: body.includes('Run'),
      hasPause: body.includes('Pause'),
      hasReset: body.includes('Reset'),
      hasSimulation: body.includes('Simulation') || body.includes('SIMULATION'),
    };
    return checks;
  });
  console.log('Sidebar elements found:', JSON.stringify(sidebarTexts, null, 2));

  // Check for sliders
  const sliders = await page.$$('input[type="range"]');
  console.log(`Number of range sliders found: ${sliders.length}`);

  // Check for buttons
  const buttons = await page.$$('button');
  const buttonTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t);
  });
  console.log(`Buttons found (${buttons.length}):`, buttonTexts);

  console.log('\n=== STEP 5: Check right stats panel ===');
  const statsChecks = await page.evaluate(() => {
    const body = document.body.innerText;
    return {
      hasEnergy: body.includes('Energy') || body.includes('energy'),
      hasMetrics: body.includes('Metric') || body.includes('metric') || body.includes('Step') || body.includes('step'),
      hasSpecies: body.includes('Species') || body.includes('species'),
      hasPotential: body.includes('Potential') || body.includes('potential'),
      hasKinetic: body.includes('Kinetic') || body.includes('kinetic'),
      hasTotal: body.includes('Total') || body.includes('total'),
    };
  });
  console.log('Stats panel elements found:', JSON.stringify(statsChecks, null, 2));

  console.log('\n=== STEP 6: Click Run button ===');
  // Find and click the Run button
  const runButton = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent.includes('Run'));
  });
  
  if (runButton) {
    const isDisabled = await page.evaluate(el => el?.disabled, runButton);
    console.log(`Run button disabled: ${isDisabled}`);
    
    if (!isDisabled) {
      await runButton.asElement().click();
      console.log('Clicked Run button');
    } else {
      console.log('Run button is disabled - simulation may not be initialized yet');
      // Wait more and try again
      await sleep(3000);
      const stillDisabled = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Run'));
        return btn?.disabled;
      });
      if (!stillDisabled) {
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Run'));
          btn?.click();
        });
        console.log('Clicked Run button after waiting');
      } else {
        console.log('Run button still disabled after waiting');
      }
    }
  } else {
    console.log('WARNING: Run button not found');
  }

  // Check if the button changed to Pause
  await sleep(1000);
  const afterClickText = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pauseBtn = btns.find(b => b.textContent.includes('Pause'));
    return pauseBtn ? 'Simulation is running (Pause button visible)' : 'Simulation may not have started';
  });
  console.log(afterClickText);

  console.log('\n=== STEP 7: Wait and take screenshot after running ===');
  await sleep(5000);
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-after-running.png`, fullPage: false });
  console.log('Screenshot saved: 02-after-running.png');

  // Get updated page state
  const runningState = await page.evaluate(() => {
    const body = document.body.innerText;
    return {
      bodyTextSample: body.substring(0, 2000),
    };
  });
  console.log('\nPage text after simulation run:');
  console.log(runningState.bodyTextSample);

  // Take a closer look at different sections
  await sleep(1000);
  
  // Screenshot of just the sidebar area (left ~300px)
  await page.screenshot({ 
    path: `${SCREENSHOTS_DIR}/03-sidebar-detail.png`,
    clip: { x: 0, y: 0, width: 320, height: 1080 }
  });
  console.log('\nScreenshot saved: 03-sidebar-detail.png');

  // Screenshot of the stats panel (right ~360px)
  await page.screenshot({ 
    path: `${SCREENSHOTS_DIR}/04-stats-detail.png`,
    clip: { x: 1560, y: 0, width: 360, height: 1080 }
  });
  console.log('Screenshot saved: 04-stats-detail.png');

  console.log('\n=== STEP 8: Console errors summary ===');
  if (consoleErrors.length > 0) {
    console.log(`Found ${consoleErrors.length} console errors/warnings:`);
    consoleErrors.forEach(e => console.log(`  ${e}`));
  } else {
    console.log('No console errors or warnings found');
  }

  console.log('\n=== All console messages ===');
  consoleMessages.slice(0, 50).forEach(m => console.log(`  ${m}`));
  if (consoleMessages.length > 50) {
    console.log(`  ... and ${consoleMessages.length - 50} more messages`);
  }

  await browser.close();
  console.log('\n=== Test complete ===');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
