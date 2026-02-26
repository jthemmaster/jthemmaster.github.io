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
      return { Temperature: metrics.Temperature || '?', Energy: metrics.Energy || '?', Bonds: metrics.Bonds || '?', Atoms: metrics.Atoms || '?', species };
    });
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log('Launching Chrome for Hydrogen Combustion test...');
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 120000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await WAIT(5000);

  let s = await getState(page);
  console.log(`[t=0s] Temp=${s?.Temperature}K  Energy=${s?.Energy}eV  Bonds=${s?.Bonds}  Atoms=${s?.Atoms}  Species=${s?.species}`);

  console.log('Clicking Run...');
  await page.evaluate(() => {
    for (const btn of document.querySelectorAll('button')) {
      if (btn.textContent.includes('Run') && !btn.disabled) { btn.click(); return; }
    }
  });

  for (const [wait, label] of [[5000, '5s'], [10000, '15s'], [10000, '25s']]) {
    await WAIT(wait);
    s = await getState(page);
    if (s) {
      console.log(`[t=${label}] Temp=${s.Temperature}K  Energy=${s.Energy}eV  Bonds=${s.Bonds}  Atoms=${s.Atoms}  Species=${s.species}`);
    } else {
      console.log(`[t=${label}] Page unresponsive`);
    }
  }

  await browser.close();
  console.log('Done.');
}

run().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
