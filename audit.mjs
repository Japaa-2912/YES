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
    if (url.startsWith(BASE) && !url.endsWith('/favicon.ico')) issues.push(`requestfailed: ${url} (${req.failure()?.errorText || 'unknown'})`);
  });
  page.on('response', (res) => {
    const url = res.url();
    if (res.status() >= 400 && url.startsWith(BASE) && !url.endsWith('/favicon.ico')) issues.push(`http ${res.status()}: ${url}`);
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

async function checkPage(browser, pathname, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const issues = [];
  collectIssues(page, issues);
  await page.goto(BASE + pathname, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 900));

  const brokenImages = await page.$$eval('img', (imgs) =>
    imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src)
  );

  const internalLinks = await page.$$eval('a[href]', (as, base) =>
    as.map((a) => a.href).filter((h) => h.startsWith(base) && !h.includes('#') && !h.startsWith('mailto:') && !h.startsWith('tel:'))
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

  await page.waitForFunction(
    () => document.querySelector('#intro-overlay')?.classList.contains('is-out'),
    { timeout: 9000 }
  ).catch(() => issues.push('intro: overlay nunca finalizou'));
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

async function main() {
  await mkdir(screenshotDir, { recursive: true });
  await new Promise((resolve) => server.listen(PORT, resolve));
  log(`servidor local em ${BASE}`);

  const browser = await puppeteer.launch({ headless: true });

  const desktop = { width: 1440, height: 900 };
  const mobile = { width: 390, height: 844 };

  log('\n=== 1. Intro (sessionStorage) ===');
  const intro = await checkIntro(browser);
  log(`overlay pulado no reload: ${intro.skipped ? 'SIM' : 'NAO (FALHA)'}`);
  log(`sessionStorage 'yes_intro_seen': ${intro.sessionKey}`);
  if (intro.issues.length) log(`issues: ${intro.issues.join(' | ')}`);

  log('\n=== 2. Paginas principais ===');
  for (const p of ['/index.html', '/modelos.html', '/planos.html']) {
    const r = await checkPage(browser, p, desktop);
    log(`\n[${p}] desktop 1440px`);
    log(`  console/network issues: ${r.issues.length ? r.issues.join(' | ') : 'nenhum'}`);
    log(`  imagens quebradas: ${r.brokenImages.length ? r.brokenImages.join(', ') : 'nenhuma'}`);
    log(`  links internos quebrados: ${r.brokenLinks.length ? r.brokenLinks.join(', ') : 'nenhum'}`);
    log(`  overflow horizontal: ${r.overflow.scrollWidth > r.overflow.clientWidth ? `SIM (${r.overflow.scrollWidth}px > ${r.overflow.clientWidth}px)` : 'nao'}`);
    const page = await browser.newPage();
    await page.setViewport(desktop);
    await page.goto(BASE + p, { waitUntil: 'load', timeout: 15000 });
    await new Promise((r2) => setTimeout(r2, 900));
    await page.screenshot({ path: join(screenshotDir, `desktop-${p.replace(/\//g, '_')}.png`), fullPage: true });
    await page.close();
  }

  log('\n=== 3. Responsivo mobile ===');
  for (const p of ['/index.html', '/modelos.html', '/planos.html']) {
    const r = await checkPage(browser, p, mobile);
    log(`[${p}] mobile 390px`);
    log(`  issues: ${r.issues.length ? r.issues.join(' | ') : 'nenhum'}`);
    log(`  overflow horizontal: ${r.overflow.scrollWidth > r.overflow.clientWidth ? `SIM (${r.overflow.scrollWidth}px > ${r.overflow.clientWidth}px)` : 'nao'}`);
    const page = await browser.newPage();
    await page.setViewport(mobile);
    await page.goto(BASE + p, { waitUntil: 'load', timeout: 15000 });
    await new Promise((r2) => setTimeout(r2, 900));
    await page.screenshot({ path: join(screenshotDir, `mobile-${p.replace(/\//g, '_')}.png`), fullPage: true });
    await page.close();
  }

  log('\n=== 4. Sites demo (rotas Vercel) ===');
  for (const p of PAGES.slice(3)) {
    const r = await checkPage(browser, p, desktop);
    log(`[${p}]`);
    log(`  issues: ${r.issues.length ? r.issues.join(' | ') : 'nenhum'}`);
    log(`  imagens quebradas: ${r.brokenImages.length ? r.brokenImages.join(', ') : 'nenhuma'}`);
    log(`  links internos quebrados: ${r.brokenLinks.length ? r.brokenLinks.join(', ') : 'nenhum'}`);
    log(`  overflow 1440px: ${r.overflow.scrollWidth > r.overflow.clientWidth ? 'SIM' : 'nao'}`);
  }

  log('\n=== 5. Página 404 ===');
  const page404 = await browser.newPage();
  await page404.setViewport(desktop);
  await page404.goto(BASE + '/caminho-inexistente', { waitUntil: 'load', timeout: 15000 });
  const title404 = await page404.title();
  await page404.screenshot({ path: join(screenshotDir, 'desktop-404.png') });
  log(`titulo: ${title404}`);
  const body404 = await page404.evaluate(() => document.body.innerText.includes('404'));
  log(`conteudo 404 exibido: ${body404 ? 'SIM' : 'NAO (FALHA)'}`);
  await page404.close();

  await browser.close();
  server.close();

  await writeFile(join(ROOT, 'audit', 'audit-report.txt'), results.join('\n'), 'utf8');
  console.log(`\nrelatorio salvo em audit/audit-report.txt e screenshots em audit/screenshots/`);
}

main().catch((err) => {
  console.error('falha na auditoria:', err);
  server.close();
  process.exit(1);
});