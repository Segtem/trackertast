/* Functional checks of the served documentation, with real Chromium.
   npm install --no-save playwright (or provide NODE_PATH).
   Screenshots: SITE_SHOTS=/tmp/site-shots node tools/test_site.cjs */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..', 'docs');
const task = fs.existsSync(path.join(root, 'assets/portada.js'));
const mode = task ? 'task' : 'clue';
const s = task ? {next:'#btn-siguiente', prev:'#btn-anterior', play:'#btn-play', reset:'#btn-reiniciar', counter:'#contador-etapas', stages:'[data-etapa]', canvas:'#escena-canvas', guide:'guia.html', count:5, wait:5600} : {next:'#next', prev:'#previous', play:'#play', reset:'#restart', counter:'#counter', stages:'[data-stage]', canvas:'#clue-scene', guide:'desde-cero.html', count:7, wait:4600};
const checks = [];
const errors = [];
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
const server = http.createServer((req,res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end('missing'); return;
  }
  res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream'});
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000}, colorScheme:'light'});
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {value:{writeText:async value => {window.__copied = value;}}});
      const original = window.requestAnimationFrame.bind(window);
      const cancel = window.cancelAnimationFrame.bind(window);
      window.__frames = new Set();
      window.requestAnimationFrame = cb => {
        const id = original(now => {window.__frames.delete(id); cb(now);});
        window.__frames.add(id); return id;
      };
      window.cancelAnimationFrame = id => {window.__frames.delete(id); cancel(id);};
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {if(response.status() >= 400) errors.push(response.status() + ' ' + response.url());});
    await context.route('**/*', route => {
      if (!route.request().url().startsWith(base)) {
        errors.push('external dependency: ' + route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    await page.goto(base);
    assert.equal(await page.locator(s.stages).count(), s.count);
    assert.equal(await page.locator(s.prev).isDisabled(), true);
    const counter = () => page.locator(s.counter).innerText();
    const initial = await counter();
    const art = await page.locator(s.canvas).evaluate(c => {
      const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      return d.some((v,i) => i%4===3 && v>0);
    });
    assert(art, 'canvas must render visible pixels'); checks.push('canvas');
    for(let i=1; i<s.count; i++) await page.locator(s.next).click();
    assert.equal(await page.locator(s.next).isDisabled(), true);
    assert.equal(await page.locator(`${s.stages}[aria-current="step"]`).count(), 1);
    await page.locator(s.reset).click(); assert.equal(await counter(), initial);
    checks.push('all steps and boundaries');
    if(task) await page.locator('#taller-escena').focus();
    await page.keyboard.press('ArrowRight'); assert.notEqual(await counter(), initial);
    await page.keyboard.press(task ? 'Home' : 'r'); assert.equal(await counter(), initial);
    checks.push('keyboard');
    if(task) {
      await page.locator('#btn-copiar-etapa').click();
      assert.equal(await page.evaluate(() => window.__copied), await page.locator('#etapa-comando').innerText());
    } else {
      await page.locator('.action-pill').first().click();
      assert((await page.locator('#decision-feedback').innerText()).includes('CLUE:'));
    }
    checks.push(task ? 'copy matches command' : 'simulation feedback');
    await page.locator(s.play).click();
    await page.waitForTimeout(s.wait);
    assert.notEqual(await counter(), initial);
    assert.equal(await page.evaluate(() => window.__frames.size), 1, 'one animation loop');
    await page.locator(s.play).click();
    assert.equal(await page.evaluate(() => window.__frames.size), 0, 'pause stops all frames');
    const paused = await counter();
    await page.waitForTimeout(s.wait);
    assert.equal(await counter(), paused); checks.push('autoplay and pause');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(selector => document.querySelector(selector).disabled, s.play);
    await page.waitForTimeout(s.wait); assert.equal(await counter(), paused);
    checks.push('reduced motion');
    // All local links, fragments and resources must resolve from each served page.
    const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
    for(const name of pages) {
      await page.goto(base + name);
      const links = await page.locator('a[href],link[href],script[src],img[src]').evaluateAll(els => els.map(el => el.href || el.src));
      for(const link of new Set(links)) {
        const url = new URL(link);
        if(url.origin !== new URL(base).origin) continue;
        const response = await context.request.get(url.href);
        assert.equal(response.status(), 200, link);
        if(url.hash && url.pathname.endsWith('.html')) {
          const html = await response.text();
          const id = decodeURIComponent(url.hash.slice(1));
          assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), 'missing fragment: ' + link);
        }
      }
    }
    checks.push('local links, anchors and resources');
    for(const name of ['index.html', s.guide]) for(const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900}); await page.goto(base + name);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name} overflows at ${width}`);
    }
    checks.push('responsive layout');
    await page.goto(base + s.guide);
    if (!task) await page.locator('details summary').first().click();
    const copy = page.locator(task ? '.copiar' : '.copy-code:visible').first();
    if(await copy.count()) {
      const expected = await copy.evaluate((button, isTask) => (isTask ? button.parentElement.querySelector('code') : button.parentElement.querySelector('pre')).innerText, task);
      await copy.click();
      assert.equal(await page.evaluate(() => window.__copied), expected);
    }
    checks.push('guide clipboard');
    const nojs = await browser.newContext({javaScriptEnabled:false, viewport:{width:390,height:900}});
    const fallback = await nojs.newPage();
    for(const name of ['index.html', s.guide]) {
      await fallback.goto(base + name);
      assert((await fallback.locator('h1').innerText()).trim().length > 0);
      assert((await fallback.locator('body').innerText()).includes(task ? 'tasks' : 'oracle-clue'));
    }
    await nojs.close(); checks.push('without JavaScript');
    if(process.env.SITE_SHOTS) {
      const dest = path.join(process.env.SITE_SHOTS,mode); fs.mkdirSync(dest,{recursive:true});
      for(const scheme of ['light','dark']) {
        await page.emulateMedia({colorScheme:scheme}); await page.setViewportSize({width:1440,height:1000}); await page.goto(base);
        await page.screenshot({path:path.join(dest,`portada-${scheme}.png`),fullPage:true});
      }
      await page.setViewportSize({width:390,height:900}); await page.goto(base);
      await page.screenshot({path:path.join(dest,'movil.png'),fullPage:true});
      await page.goto(base + s.guide);
      await page.screenshot({path:path.join(dest,'guia-mobile.png')});
    }
    assert.deepEqual(errors, []); checks.push('no errors or external dependencies');
    console.log(JSON.stringify({site:mode, checks, result:'OK'},null,2));
  } finally {await browser.close(); server.close();}
})().catch(error => {console.error(error); server.close(); process.exitCode=1;});
