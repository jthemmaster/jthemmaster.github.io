import puppeteer from 'puppeteer';

const WAIT = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getState(page) {
  try {
    return await page.evaluate(() => {
      const metrics = {};
      for (const card of document.querySelectorAll('div')) {
        const label = card.querySelector('span[class*="uppercase"][class*="tracking"]');
        const value = card.querySelector('span[class*="font-mono"][class*="font-semibold"][class*="tabular"]');
        if (label && value) {
          const l = label.textContent.trim();
          if (['Temperature', 'Energy', 'Bonds', 'Atoms'].includes(l))
            metrics[l] = value.textContent.trim();
        }
      }

      const sh = Array.from(document.querySelectorAll('span')).find(el => el.textContent.trim() === 'Species');
      let species = 'N/A';
      if (sh) {
        const c = sh.closest('div[class*="space-y"]');
        if (c) {
          const rows = c.querySelectorAll('div[class*="py-1"]');
          const sp = [];
          for (const row of rows) {
            const f = row.querySelector('.font-mono');
            const cnt = row.querySelector('span[class*="tabular-nums"][class*="w-6"]');
            if (f && cnt) sp.push(`${f.textContent.trim()}:${cnt.textContent.trim()}`);
          }
          if (sp.length) species = sp.join(', ');
        }
      }

      // Also get confinement force value
      let confinementForce = 'N/A';
      const labels = document.querySelectorAll('span.text-xs.font-medium');
      for (const l of labels) {
        if (l.textContent.includes('Confinement Force')) {
          const parent = l.closest('.space-y-2');
          if (parent) {
            const valSpan = parent.querySelector('.font-mono.font-medium.tabular-nums, span.font-mono');
            if (valSpan) confinementForce = valSpan.textContent.trim();
          }
        }
      }

      return {
        Temperature: metrics.Temperature || '?',
        Energy: metrics.Energy || '?',
        Bonds: metrics.Bonds || '?',
        Atoms: metrics.Atoms || '?',
        species,
        confinementForce,
      };
    });
  } catch (e) {
    return null;
  }
}

async function clickButton(page, label) {
  return page.evaluate((lbl) => {
    for (const btn of document.querySelectorAll('button')) {
      if (btn.textContent.includes(lbl) && !btn.disabled) { btn.click(); return true; }
    }
    return false;
  }, label);
}

async function setConfinementForce(page, targetValue) {
  return page.evaluate((val) => {
    const labels = document.querySelectorAll('span');
    for (const l of labels) {
      if (l.textContent.includes('Confinement Force')) {
        const parent = l.closest('.space-y-2') || l.closest('div');
        if (parent) {
          const slider = parent.querySelector('input[type="range"]');
          if (slider) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(slider, val);
            slider.dispatchEvent(new Event('input', { bubbles: true }));
            slider.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
      }
    }
    return false;
  }, targetValue);
}

const results = [];

async function capture(page, label) {
  const state = await getState(page);
  if (state) {
    console.log(`[${label}] T=${state.Temperature}  E=${state.Energy}  Bonds=${state.Bonds}  Atoms=${state.Atoms}  Species=${state.species}  Confinement=${state.confinementForce}`);
    results.push({ label, ...state });
  } else {
    console.log(`[${label}] Failed to extract state`);
    results.push({ label, Temperature: '?', Energy: '?', Bonds: '?', Atoms: '?', species: '?', confinementForce: '?' });
  }
}

async function run() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 120000,
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
      '--disable-dev-shm-usage', '--disable-software-rasterizer',
      '--disable-accelerated-2d-canvas',
    ],
    defaultViewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  [BROWSER ERROR] ${msg.text()}`);
  });
  page.on('pageerror', err => console.log(`  [PAGE ERROR] ${err.message}`));

  console.log('Opening http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await WAIT(5000);

  // Step 2: Note initial values
  console.log('\n========== STEP 1-2: Initial State ==========');
  await capture(page, 't=0s (initial)');

  // Step 3: Click Run
  console.log('\n========== STEP 3: Starting Simulation ==========');
  const clicked = await clickButton(page, 'Run');
  console.log(`Run button clicked: ${clicked}`);

  // Step 4: Wait 5 seconds
  console.log('\n========== STEP 4: Wait 5s ==========');
  await WAIT(5000);
  await capture(page, 't=5s');

  // Step 5: Wait 10 more seconds (15s total)
  console.log('\n========== STEP 5: Wait to 15s ==========');
  await WAIT(10000);
  await capture(page, 't=15s');

  // Step 6: Wait 10 more seconds (25s total)
  console.log('\n========== STEP 6: Wait to 25s ==========');
  await WAIT(10000);
  await capture(page, 't=25s');

  // Step 7: Increase Confinement Force to ~25
  console.log('\n========== STEP 7: Increase Confinement Force to 25 ==========');
  const sliderSet = await setConfinementForce(page, 25);
  console.log(`Confinement Force slider set: ${sliderSet}`);
  await WAIT(2000);
  await capture(page, 't=27s (confinement=25)');

  await WAIT(5000);
  await capture(page, 't=32s (confinement=25, +5s)');

  await WAIT(5000);
  await capture(page, 't=37s (confinement=25, +10s)');

  // Pause
  try { await clickButton(page, 'Pause'); } catch(e) {}

  // Print results table
  console.log('\n\n================================================================');
  console.log('                    RESULTS TABLE');
  console.log('================================================================');
  console.log('Time Label                    | Temp (K)  | Energy (eV) | Bonds | Atoms | Species');
  console.log('-----------------------------|-----------|-------------|-------|-------|--------');
  for (const r of results) {
    const lbl = (r.label || '').padEnd(28);
    const t = (r.Temperature || '?').toString().padEnd(9);
    const e = (r.Energy || '?').toString().padEnd(11);
    const b = (r.Bonds || '?').toString().padEnd(5);
    const a = (r.Atoms || '?').toString().padEnd(5);
    console.log(`${lbl} | ${t} | ${e} | ${b} | ${a} | ${r.species}`);
  }

  // Analysis
  console.log('\n================================================================');
  console.log('                    STABILITY ANALYSIS');
  console.log('================================================================');

  const mainData = results.filter(r => !r.label.includes('confinement'));
  const confData = results.filter(r => r.label.includes('confinement'));

  for (const [name, data] of [['Main Run (0-25s)', mainData], ['With Confinement=25 (post-25s)', confData]]) {
    console.log(`\n${name}:`);
    const temps = data.map(d => parseFloat(d.Temperature)).filter(v => !isNaN(v));
    const energies = data.map(d => parseFloat(d.Energy)).filter(v => !isNaN(v));
    const bonds = data.map(d => parseInt(d.Bonds)).filter(v => !isNaN(v));

    if (temps.length === 0) { console.log('  No numeric data collected.'); continue; }

    console.log(`  Temperature range: ${Math.min(...temps).toFixed(0)} - ${Math.max(...temps).toFixed(0)} K`);
    console.log(`  Energy range:      ${Math.min(...energies).toFixed(2)} - ${Math.max(...energies).toFixed(2)} eV`);
    console.log(`  Bonds range:       ${Math.min(...bonds)} - ${Math.max(...bonds)}`);

    const tOK = temps.every(t => t >= 100 && t <= 1000);
    const eOK = energies.every(e => e >= -500 && e <= 500);
    const bOK = bonds.every(b => b > 0);

    console.log(`  Temperature 100-1000K:  ${tOK ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`  Energy within ±500eV:   ${eOK ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`  Bonds > 0:              ${bOK ? 'PASS ✓' : 'FAIL ✗'}`);

    if (!tOK) console.log(`  ⚠ Out-of-range temps: ${data.filter(d => { const t = parseFloat(d.Temperature); return !isNaN(t) && (t < 100 || t > 1000); }).map(d => `${d.label}=${d.Temperature}K`).join(', ')}`);
    if (!eOK) console.log(`  ⚠ Out-of-range energies: ${data.filter(d => { const e = parseFloat(d.Energy); return !isNaN(e) && (e < -500 || e > 500); }).map(d => `${d.label}=${d.Energy}eV`).join(', ')}`);
  }

  // Species analysis
  console.log('\n================================================================');
  console.log('                    SPECIES ANALYSIS');
  console.log('================================================================');
  for (const r of results) {
    console.log(`[${r.label}] ${r.species}`);
    if (r.species && r.species !== 'N/A') {
      const items = r.species.split(',').map(s => s.trim());
      for (const item of items) {
        const [formula] = item.split(':');
        const atomCount = (formula.match(/\d+/g) || []).reduce((sum, n) => sum + parseInt(n), 0);
        if (atomCount > 10) {
          console.log(`  ⚠ SUSPICIOUS mega-molecule: ${formula} (${atomCount} atoms in formula)`);
        }
      }
    }
  }

  await browser.close();
  console.log('\nDone.');
}

run().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
