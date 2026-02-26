import puppeteer from 'puppeteer';

const WAIT = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getStoreState(page) {
  try {
    return await page.evaluate(() => {
      // Access Zustand store from React internals
      const root = document.getElementById('root');
      if (!root || !root._reactRootContainer && !root.__reactFiber) {
        // Fallback: read from DOM
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
        // Species
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
        return { Temperature: metrics.Temperature || '?', Energy: metrics.Energy || '?', Bonds: metrics.Bonds || '?', Atoms: metrics.Atoms || '?', species };
      }
    });
  } catch (e) {
    return { Temperature: 'ERR', Energy: 'ERR', Bonds: 'ERR', Atoms: 'ERR', species: 'ERR' };
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

const allResults = { test1: [], test2: [] };

async function capture(page, key, label, time) {
  const state = await getStoreState(page);
  if (state) {
    console.log(`[${label}] Temp=${state.Temperature}K  Energy=${state.Energy}eV  Bonds=${state.Bonds}  Atoms=${state.Atoms}  Species=${state.species}`);
    allResults[key].push({ time, ...state });
  } else {
    console.log(`[${label}] Failed to extract state`);
    allResults[key].push({ time, Temperature: '?', Energy: '?', Bonds: '?', Atoms: '?', species: '?' });
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
  
  console.log('Opening http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await WAIT(5000);

  // TEST 1
  console.log('\n=== TEST 1: HYDROGEN COMBUSTION (Default) ===');
  await capture(page, 'test1', 't=0s', '0s');

  console.log('Starting simulation...');
  await clickButton(page, 'Run');

  for (const [wait, label, time] of [[5000, 't=5s', '5s'], [10000, 't=15s', '15s'], [10000, 't=25s', '25s']]) {
    await WAIT(wait);
    await capture(page, 'test1', label, time);
  }

  try { await clickButton(page, 'Pause'); } catch(e) {}
  await WAIT(1000);

  // TEST 2
  console.log('\n=== TEST 2: METHANE COMBUSTION ===');
  try { await clickButton(page, 'Methane Combustion'); } catch(e) { console.log('Failed to click preset'); }
  await WAIT(4000);
  await capture(page, 'test2', 't=0s', '0s');

  console.log('Starting simulation...');
  try { await clickButton(page, 'Run'); } catch(e) {}

  for (const [wait, label, time] of [[5000, 't=5s', '5s'], [5000, 't=10s', '10s']]) {
    await WAIT(wait);
    await capture(page, 'test2', label, time);
  }

  // PRINT RESULTS
  console.log('\n\n============================================================');
  console.log('RESULTS TABLE: Hydrogen Combustion');
  console.log('============================================================');
  console.log('Time  | Temp (K)   | Energy (eV)  | Bonds | Atoms | Species');
  console.log('------|------------|--------------|-------|-------|--------');
  for (const r of allResults.test1) {
    console.log(`${(r.time||'').padEnd(5)} | ${(r.Temperature||'?').padEnd(10)} | ${(r.Energy||'?').padEnd(12)} | ${(r.Bonds||'?').padEnd(5)} | ${(r.Atoms||'?').padEnd(5)} | ${r.species}`);
  }

  console.log('\n============================================================');
  console.log('RESULTS TABLE: Methane Combustion');
  console.log('============================================================');
  console.log('Time  | Temp (K)   | Energy (eV)  | Bonds | Atoms | Species');
  console.log('------|------------|--------------|-------|-------|--------');
  for (const r of allResults.test2) {
    console.log(`${(r.time||'').padEnd(5)} | ${(r.Temperature||'?').padEnd(10)} | ${(r.Energy||'?').padEnd(12)} | ${(r.Bonds||'?').padEnd(5)} | ${(r.Atoms||'?').padEnd(5)} | ${r.species}`);
  }

  // ANALYSIS
  console.log('\n============================================================');
  console.log('STABILITY ANALYSIS');
  console.log('============================================================');
  for (const [name, data] of [['Hydrogen Combustion', allResults.test1], ['Methane Combustion', allResults.test2]]) {
    console.log(`\n${name}:`);
    const temps = data.map(d => parseFloat(d.Temperature)).filter(v => !isNaN(v));
    const energies = data.map(d => parseFloat(d.Energy)).filter(v => !isNaN(v));
    if (temps.length === 0) { console.log('  No data.'); continue; }
    console.log(`  Temp range:   ${Math.min(...temps).toFixed(0)} - ${Math.max(...temps).toFixed(0)} K`);
    console.log(`  Energy range: ${Math.min(...energies).toFixed(2)} - ${Math.max(...energies).toFixed(2)} eV`);
    const tOK = temps.every(t => t >= 100 && t <= 1000);
    const eOK = energies.every(e => e >= -500 && e <= 500);
    console.log(`  Temp 100-1000K:  ${tOK ? 'PASS' : 'FAIL'}`);
    console.log(`  Energy ±500eV:   ${eOK ? 'PASS' : 'FAIL'}`);
    if (!tOK) console.log(`  Out-of-range temps: ${data.filter(d => { const t = parseFloat(d.Temperature); return !isNaN(t) && (t < 100 || t > 1000); }).map(d => `${d.time}=${d.Temperature}K`).join(', ')}`);
    if (!eOK) console.log(`  Out-of-range energies: ${data.filter(d => { const e = parseFloat(d.Energy); return !isNaN(e) && (e < -500 || e > 500); }).map(d => `${d.time}=${d.Energy}eV`).join(', ')}`);
  }

  await browser.close();
  console.log('\nDone.');
}

run().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
