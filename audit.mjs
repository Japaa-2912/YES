import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import puppeteer from 'puppeteer';

const ROOT = normalize('D:/modelos/YES').toLowerCase();
const PORT = 4731;
const BASE = `http://127.0.0.1:${PORT}`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, BASE).pathname);
    if (pathname === '/') pathname = '/index.html';
    const filePath = normalize(join(ROOT, pathname));
    if (!filePath.toLowerCase().startsWith(ROOT)) {
      res.writeHead(403);
      return res.end('forbidden');
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch {
    const notFound = await readFile(join(ROOT, '404.html')).catch(() => null);
    if (notFound) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(notFound);
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  }
});

const PAGES = [
  '/index.html',
  '/modelos.html',
  '/planos.html',
  '/salao-beleza/index.html',
  '/petshop/index.html',
  '/dentista/index.html',
  '/advogado/index.html',
  '/consultoria/index.html',
  '/estetica/index.html',
  '/autoescola/index.html',
  '/clinica-estetica/index.html',
  '/studio-de-cabelo/index.html',
];

const VIEWPORTS = [
  320, 360, 375, 390, 412, 430, 1280, 1440, 1920,
];

const results = [];
const screenshotDir = join(ROOT, 'audit', 'screenshots');

function log(...args) {
  const line = args.join(' ');
  results.push(line);
  console.log(line);
}

function collectIssues(page, issues) {
  page.on('pageerror', (err) => issues.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) {
      issues.push(`console.error: ${msg.text()}`);
    }
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (url.startsWith(BASE) && !url.endsWith('/favicon.ico')) {
      issues.push(`requestfailed: ${url} (${req.failure()?.errorText || 'unknown'})`);
    }
  });
  page.on('response', (res) => {
    const url = res.url();
    if (res.status() >= 400 && url.startsWith(BASE) && !url.endsWith('/favicon.ico')) {
      issues.push(`http ${res.status()}: ${url}`);
    }
  });
}

async function fileExists(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  const filePath = normalize(join(ROOT, pathname === '/' ? '/index.html' : pathname));
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkPage(browser, pathname, viewport, screenshot) {
  const page = await browser.newPage();
  await page.setViewport({ width: viewport, height: viewport >= 1000 ? 900 : 844 });
  const issues = [];
  collectIssues(page, issues);
  await page.goto(BASE + pathname, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page
    .waitForFunction(
      () =>
        !document.querySelector('#intro-overlay') ||
        getComputedStyle(document.querySelector('#intro-overlay')).visibility === 'hidden',
      { timeout: 8000 }
    )
    .catch(() => {});
  await new Promise((r) => setTimeout(r, 900));

  const brokenImages = await page.$$eval('img', (imgs) =>
    imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src)
  );

  const internalLinks = await page.$$eval(
    'a[href]',
    (as, base) =>
      as
        .map((a) => a.href)
        .filter(
          (h) =>
            h.startsWith(base) &&
            !h.includes('#') &&
            !h.startsWith('mailto:') &&
            !h.startsWith('tel:')
        )
        .filter((h, i, arr) => arr.indexOf(h) === i),
    BASE
  );
  const brokenLinks = [];
  for (const link of internalLinks) {
    if (!(await fileExists(link))) brokenLinks.push(link);
  }

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  if (screenshot) {
    await page.evaluate(async () => {
      const step = Math.max(200, window.innerHeight * 0.8);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 120));
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: join(screenshotDir, `${viewport}-${pathname.replace(/\//g, '_')}.png`),
      fullPage: true,
    });
  }

  await page.close();
  return { pathname, issues, brokenImages, brokenLinks, overflow, viewport };
}

async function checkIntro(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const issues = [];
  collectIssues(page, issues);

  await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: join(screenshotDir, 'intro-1-letters.png') });

  await page
    .waitForFunction(
      () => document.querySelector('#intro-overlay')?.classList.contains('is-out'),
      { timeout: 8000 }
    )
    .catch(() => issues.push('intro: overlay nunca finalizou'));
  await page.screenshot({ path: join(screenshotDir, 'intro-2-done.png') });

  await page.reload({ waitUntil: 'load', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 400));
  const skipped = await page
    .$eval('#intro-overlay', (el) => el.classList.contains('is-out'))
    .catch(() => true);

  const sessionKey = await page.evaluate(() => sessionStorage.getItem('yes_intro_seen'));
  await page.close();
  return { issues, skipped, sessionKey };
}

async function checkHamburger(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const issues = [];
  collectIssues(page, issues);
  await page.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem('yes_intro_seen', '1');
    } catch {}
  });
  await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 800));

  const toggleVisible = await page.$eval('.nav-toggle', (el) => {
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden';
  });

  await page.click('.nav-toggle');
  await new Promise((r) => setTimeout(r, 600));
  const opened = await page.$eval('.nav-toggle', (el) => ({
    expanded: el.getAttribute('aria-expanded'),
    menuOpen: document.getElementById('nav-menu').classList.contains('is-open'),
  }));

  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 600));
  const closedByEsc = await page.$eval('.nav-toggle', (el) => ({
    expanded: el.getAttribute('aria-expanded'),
    menuOpen: document.getElementById('nav-menu').classList.contains('is-open'),
  }));

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );

  await page.close();
  return { toggleVisible, opened, closedByEsc, overflow, issues };
}

async function checkFilters(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(BASE + '/modelos.html', { waitUntil: 'load', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));

  const total = await page.$$eval('.model-card', (els) => els.length);

  await page.click('.filter-btn[data-filter="beleza"]');
  await new Promise((r) => setTimeout(r, 300));
  const beleza = await page.$$eval(
    '.model-card:not(.is-hidden)',
    (els) => els.length
  );

  await page.click('.filter-btn[data-filter="todas"]');
  await new Promise((r) => setTimeout(r, 300));
  const todas = await page.$$eval(
    '.model-card:not(.is-hidden)',
    (els) => els.length
  );

  await page.close();
  return { total, beleza, todas };
}

async function checkPlanCtas(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.evaluateOnNewDocument(() => {
    window.__auditUrls = [];
    window.open = (url) => {
      window.__auditUrls.push(url);
      return null;
    };
  });
  await page.goto(BASE + '/planos.html', { waitUntil: 'load', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));

  const buttons = await page.$$('.assinar-btn');
  for (const btn of buttons) {
    await btn.click().catch(() => {});
    await new Promise((r) => setTimeout(r, 150));
  }
  const opened = await page.evaluate(() => window.__auditUrls);

  const compareTable = await page.$eval(
    '.compare-table',
    (el) => el.rows.length > 0
  ).catch(() => false);

  await page.close();
  return { buttons: buttons.length, opened, compareTable };
}

async function checkV3(browser) {
  const out = {};
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 15000 });
  await page
    .waitForFunction(
      () =>
        !document.querySelector('#intro-overlay') ||
        getComputedStyle(document.querySelector('#intro-overlay')).visibility === 'hidden',
      { timeout: 9000 }
    )
    .catch(() => {});

  out.heroWords = await page.$$eval('.hero-word', (els) => els.length);
  out.heroReady = await page.evaluate(() => document.body.classList.contains('hero-ready'));
  out.heroRevealed = await page
    .$eval('.hero-word-inner', (el) => {
      const t = getComputedStyle(el).transform;
      return t === 'none' || t.includes('matrix(1, 0, 0, 1, 0, 0)');
    })
    .catch(() => false);

  out.marquee = await page
    .$eval('.marquee-track', (el) => {
      const s = getComputedStyle(el);
      return s.animationName !== 'none' && parseFloat(s.animationDuration) > 1;
    })
    .catch(() => false);
  out.marqueeLists = await page.$$eval('.marquee-list', (els) => els.length);

  await page.click('#faq-q-1');
  await new Promise((r) => setTimeout(r, 600));
  const first = await page.$eval('#faq-q-1', (b) => ({
    expanded: b.getAttribute('aria-expanded'),
    open: b.closest('.faq-item').classList.contains('is-open'),
  }));

  await page.click('#faq-q-2');
  await new Promise((r) => setTimeout(r, 600));
  const second = await page.$eval('#faq-q-2', (b) => ({
    expanded: b.getAttribute('aria-expanded'),
    open: b.closest('.faq-item').classList.contains('is-open'),
  }));
  const firstAfter = await page.$eval('#faq-q-1', (b) => ({
    expanded: b.getAttribute('aria-expanded'),
    open: b.closest('.faq-item').classList.contains('is-open'),
  }));
  out.faq = { first, second, firstAfter };

  await page.evaluate(() => {
    document.querySelector('.trustbar-stats').scrollIntoView({ block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 1900));
  out.counters = await page.$$eval('[data-count]', (els) =>
    els.map((el) => ({
      target: el.getAttribute('data-count'),
      text: el.textContent.trim(),
    }))
  );

  await page.evaluate(() => window.scrollTo(0, 600));
  await new Promise((r) => setTimeout(r, 400));
  out.headerScrolled = await page.evaluate(() =>
    document.querySelector('.navbar').classList.contains('is-scrolled')
  );

  await page.click('.to-top');
  await new Promise((r) => setTimeout(r, 1600));
  out.scrolledTop = await page.evaluate(() => window.scrollY);

  await page.close();
  return out;
}

async function checkSiteWide(browser) {
  const out = {};
  for (const [key, path] of [
    ['modelos', '/modelos.html'],
    ['planos', '/planos.html'],
  ]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));
    out[key] = await page.evaluate(() => ({
      progressBar: !!document.querySelector('.scroll-progress'),
      marquee: !!document.querySelector('.marquee-track'),
      faqItems: document.querySelectorAll('.faq-item').length,
      toTop: !!document.querySelector('.to-top'),
      splitWords: document.querySelectorAll('[data-split] .hero-word').length,
      revealGroups: document.querySelectorAll('[data-reveal-stagger]').length,
    }));
    await page.close();
  }
  return out;
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });
  await new Promise((resolve) => server.listen(PORT, resolve));
  log(`servidor local em ${BASE}`);

  const browser = await puppeteer.launch({ headless: true });

  log('\n=== 1. Intro (sessionStorage) ===');
  const intro = await checkIntro(browser);
  log(`overlay pulado no reload: ${intro.skipped ? 'SIM' : 'NAO (FALHA)'}`);
  log(`sessionStorage 'yes_intro_seen': ${intro.sessionKey}`);
  if (intro.issues.length) log(`issues: ${intro.issues.join(' | ')}`);

  log('\n=== 2. Matriz de viewports (overflow + erros) ===');
  for (const p of ['/index.html', '/modelos.html', '/planos.html']) {
    for (const w of VIEWPORTS) {
      const r = await checkPage(browser, p, w, false);
      const problems = [];
      if (r.overflow.scrollWidth > r.overflow.clientWidth) {
        problems.push(`OVERFLOW ${r.overflow.scrollWidth}px`);
      }
      if (r.issues.length) problems.push(r.issues.join(' | '));
      if (r.brokenImages.length) problems.push(`imagem quebrada: ${r.brokenImages.join(', ')}`);
      if (r.brokenLinks.length) problems.push(`link quebrado: ${r.brokenLinks.join(', ')}`);
      log(`[${p}] ${w}px -> ${problems.length ? problems.join(' ; ') : 'ok'}`);
    }
  }

  log('\n=== 3. Menu hamburguer (mobile) ===');
  const burger = await checkHamburger(browser);
  log(`toggle visivel em 390px: ${burger.toggleVisible ? 'SIM' : 'NAO (FALHA)'}`);
  log(`abriu (aria-expanded=${burger.opened.expanded}, menu=${burger.opened.menuOpen}): ${burger.opened.expanded === 'true' && burger.opened.menuOpen ? 'OK' : 'FALHA'}`);
  log(`fechou com Esc (aria-expanded=${burger.closedByEsc.expanded}, menu=${burger.closedByEsc.menuOpen}): ${burger.closedByEsc.expanded === 'false' && !burger.closedByEsc.menuOpen ? 'OK' : 'FALHA'}`);
  log(`overflow com menu aberto: ${burger.overflow ? 'SIM (FALHA)' : 'nao'}`);
  if (burger.issues.length) log(`issues: ${burger.issues.join(' | ')}`);

  log('\n=== 4. Filtros de modelos ===');
  const filters = await checkFilters(browser);
  log(`total de cards: ${filters.total}`);
  log(`filtro 'Beleza' -> ${filters.beleza} visiveis (esperado 3): ${filters.beleza === 3 ? 'OK' : 'FALHA'}`);
  log(`filtro 'Todas' -> ${filters.todas} visiveis (esperado 9): ${filters.todas === 9 ? 'OK' : 'FALHA'}`);

  log('\n=== 5. CTAs de planos (WhatsApp) ===');
  const plans = await checkPlanCtas(browser);
  log(`botoes 'Quero este plano': ${plans.buttons} (esperado 4): ${plans.buttons === 4 ? 'OK' : 'FALHA'}`);
  log(`whatsapps abertos: ${plans.opened.length}`);
  const waOk = plans.opened.every(
    (u) => u.startsWith('https://wa.me/5511994782909') && u.includes('plano')
  );
  log(`mensagens contextuais (wa.me/5511994782909 + plano): ${waOk ? 'OK' : 'FALHA'}`);
  log(`tabela comparativa presente: ${plans.compareTable ? 'SIM' : 'NAO (FALHA)'}`);

  log('\n=== 6. Links de WhatsApp na home ===');
  const pageHome = await browser.newPage();
  await pageHome.setViewport({ width: 1440, height: 900 });
  await pageHome.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 800));
  const waLinks = await pageHome.$$eval('a[href^="https://wa.me/"]', (as) => as.length);
  const waValid = await pageHome.$$eval(
    'a[href^="https://wa.me/"]',
    (as) => as.every((a) => a.href.startsWith('https://wa.me/5511994782909'))
  );
  log(`total de links wa.me: ${waLinks} | numero correto em todos: ${waValid ? 'SIM' : 'NAO (FALHA)'}`);
  await pageHome.close();

  log('\n=== 7. Sites demo (rotas Vercel) ===');
  for (const p of PAGES.slice(3)) {
    const r = await checkPage(browser, p, 1440, false);
    const problems = [];
    if (r.issues.length) problems.push(r.issues.join(' | '));
    if (r.brokenImages.length) problems.push(`imagem quebrada: ${r.brokenImages.join(', ')}`);
    if (r.brokenLinks.length) problems.push(`link quebrado: ${r.brokenLinks.join(', ')}`);
    if (r.overflow.scrollWidth > r.overflow.clientWidth) problems.push('OVERFLOW');
    log(`[${p}] -> ${problems.length ? problems.join(' ; ') : 'ok'}`);
  }

  log('\n=== 8. Pagina 404 ===');
  const page404 = await browser.newPage();
  await page404.setViewport({ width: 1440, height: 900 });
  await page404.goto(BASE + '/caminho-inexistente', { waitUntil: 'load', timeout: 15000 });
  const title404 = await page404.title();
  const body404 = await page404.evaluate(() => document.body.innerText.includes('404'));
  const btnHome = await page404.$eval('a[href="/index.html"]', (a) => a.textContent.trim()).catch(() => '');
  log(`titulo: ${title404}`);
  log(`conteudo 404: ${body404 ? 'SIM' : 'NAO (FALHA)'}`);
  log(`botao 'Voltar para a YES': ${btnHome === 'Voltar para a YES' ? 'SIM' : `NAO (${btnHome})`}`);
  await page404.close();

  log('\n=== 9. Interacoes V3 (hero, marquee, FAQ, contadores, topo) ===');
  const v3 = await checkV3(browser);
  log(`hero word spans: ${v3.heroWords} | hero-ready: ${v3.heroReady ? 'SIM' : 'NAO'} | reveal concluido: ${v3.heroRevealed ? 'SIM' : 'NAO'}`);
  log(`marquee animando: ${v3.marquee ? 'SIM' : 'NAO (FALHA)'} | listas duplicadas: ${v3.marqueeLists} (esperado 2)`);
  log(`FAQ abre (q1): ${v3.faq.first.expanded === 'true' && v3.faq.first.open ? 'OK' : 'FALHA'}`);
  log(`FAQ exclusivo (q2 abre, q1 fecha): ${v3.faq.second.expanded === 'true' && !v3.faq.firstAfter.open && v3.faq.firstAfter.expanded === 'false' ? 'OK' : 'FALHA'}`);
  const countersOk = v3.counters.every(
    (c) => c.text === c.target + (c.target === '100' ? '%' : '')
  );
  log(`contadores finais: ${v3.counters.map((c) => c.text).join(' / ')} -> ${countersOk ? 'OK' : 'FALHA'}`);
  log(`header is-scrolled ao rolar: ${v3.headerScrolled ? 'SIM' : 'NAO (FALHA)'}`);
  log(`voltar ao topo -> scrollY=${Math.round(v3.scrolledTop)}: ${v3.scrolledTop < 40 ? 'OK' : 'FALHA'}`);

  log('\n=== 10. Animacoes site-wide (modelos, planos) ===');
  const sw = await checkSiteWide(browser);
  for (const key of ['modelos', 'planos']) {
    const r = sw[key];
    log(`[${key}] progresso=${r.progressBar ? 'ok' : 'FALHA'} | split=${r.splitWords} palavras | reveal-groups=${r.revealGroups} | to-top=${r.toTop ? 'ok' : 'FALHA'} | marquee=${r.marquee ? 'sim' : 'nao'} | faq=${r.faqItems}`);
  }

  log('\n=== 11. Screenshots (desktop 1440 + mobile 390) ===');
  await browser.close();
  const shotBrowser = await puppeteer.launch({ headless: true });
  for (const p of ['/index.html', '/modelos.html', '/planos.html']) {
    await checkPage(shotBrowser, p, 1440, true);
    await checkPage(shotBrowser, p, 390, true);
  }
  await shotBrowser.close();
  log('ok');

  const ogExists = await fileExists(BASE + '/img/og-image.jpg');
  log(`og-image.jpg presente: ${ogExists ? 'SIM' : 'NAO (FALHA)'}`);

  server.close();

  await writeFile(join(ROOT, 'audit', 'audit-report.txt'), results.join('\n'), 'utf8');
  console.log(`\nrelatorio salvo em audit/audit-report.txt e screenshots em audit/screenshots/`);
}

main().catch((err) => {
  console.error('falha na auditoria:', err);
  server.close();
  process.exit(1);
});