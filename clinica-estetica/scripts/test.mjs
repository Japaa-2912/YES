/* ============================================================
   test.mjs — Teste funcional com Puppeteer (puppeteer-core + Edge)
   ------------------------------------------------------------
   1. Menu de procedimentos: tempo de fechamento ao retirar o mouse
   2. Carrossel: clique nas setas (transição fluida) e chips
   3. Blog: renderização, filtro, busca, "Ler mais" (modal)
   4. Responsivo: sem scroll horizontal no viewport de celular
   5. Formulário de contato (validação)
   Uso: node scripts/test.mjs
   ============================================================ */
import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const page = (f) => pathToFileURL(join(root, f)).href;

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let passed = 0;
let failed = 0;

function ok(name, cond, detail) {
  if (cond) {
    passed++;
    console.log('  PASS  ' + name);
  } else {
    failed++;
    console.log('  FAIL  ' + name + (detail ? ' -> ' + detail : ''));
  }
}

/* puppeteer-core mais recente removeu Page.waitForTimeout */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1280,900']
});

try {
  const p = await browser.newPage();
  await p.setViewport({ width: 1280, height: 900 });

  /* ============ 1. MENU DE PROCEDIMENTOS ============ */
  console.log('\n[1] Menu de procedimentos (tempo de fechamento)');
  await p.goto(page('index.html'), { waitUntil: 'networkidle0' });

  const toggle = await p.$('.nav-item.has-submenu .nav-link--toggle');
  const box = await toggle.boundingBox();
  const menuCenter = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  // Hover no botão "Pele"
  await p.mouse.move(menuCenter.x, menuCenter.y);
  await sleep(300);

  const submenuVisible = await p.evaluate(() => {
    const sm = document.querySelector('.has-submenu .submenu');
    return getComputedStyle(sm).visibility === 'visible';
  });
  ok('Abre ao passar o mouse (hover)', submenuVisible);

  // Afasta o mouse para o canto da logo
  await p.mouse.move(30, 20);
  await sleep(250); // dentro da janela de atraso (400ms)
  const stillOpen = await p.evaluate(() => {
    const sm = document.querySelector('.has-submenu .submenu');
    return getComputedStyle(sm).visibility === 'visible';
  });
  ok('Permanece aberto 250ms após sair (atraso de fechamento)', stillOpen);

  await sleep(500); // aguarda o fechamento completo
  const closed = await p.evaluate(() => {
    const sm = document.querySelector('.has-submenu .submenu');
    return getComputedStyle(sm).visibility === 'hidden';
  });
  ok('Fecha sozinho após o atraso', closed);

  // Itens do submenu possuem href preenchido
  const hrefs = await p.evaluate(() =>
    Array.from(document.querySelectorAll('.has-submenu .submenu-link')).map((a) => a.getAttribute('href'))
  );
  ok('Itens do submenu possuem href', hrefs.length >= 9 && hrefs.every((h) => h && h.length > 1), JSON.stringify(hrefs.slice(0, 3)));

  /* ============ 2. CARROSSEL (pele.html) ============ */
  console.log('\n[2] Carrossel de procedimentos (setas + chips)');
  await p.goto(page('pele.html'), { waitUntil: 'networkidle0' });
  await sleep(400);

  const trackInfo = await p.evaluate(() => {
    const track = document.querySelector('[data-catalog-track]');
    const card = track.querySelector('.catalog-card');
    return {
      cards: track.children.length,
      cardWidth: card.getBoundingClientRect().width,
      transform: getComputedStyle(track).transform
    };
  });
  ok('Renderiza os 9 procedimentos de pele', trackInfo.cards === 9, 'cards=' + trackInfo.cards);
  ok('Cards renderizados no track', trackInfo.cardWidth > 200);

  const nextBtn = await p.$('.catalog-arrow--next');

  // Amostra a transformação durante a transição (fluidez)
  const samples = [];
  await nextBtn.click();
  for (let i = 0; i < 8; i++) {
    const t = await p.evaluate(() => getComputedStyle(document.querySelector('[data-catalog-track]')).transform);
    samples.push(t);
    await sleep(70);
  }
  const distinct = new Set(samples.map((s) => s.split('(')[1] || s)).size;
  const finalTransform = samples[samples.length - 1];
  ok('Transição fluida (valores intermediários distintos)', distinct >= 3, 'amostras distintas=' + distinct);

  const endX = parseFloat((finalTransform.match(/matrix\(1, 0, 0, 1, ([-\d.]+)/) || [])[1] || 0);
  const expected = trackInfo.cardWidth + 16;
  ok('Seta "próximo" avança 1 slide', Math.abs(endX + expected) < 2, 'offset=' + endX + ' esperado=' + -expected);

  // Chips: clicar no 5º tópico pula para o slide correspondente
  await p.evaluate(() => document.querySelectorAll('.topic-chip')[4].click());
  await sleep(600);
  const chipState = await p.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.topic-chip'));
    return {
      ativo: chips.findIndex((c) => c.classList.contains('is-active')),
      translate: getComputedStyle(document.querySelector('[data-catalog-track]')).transform
    };
  });
  ok('Chip do 5º tópico ativa o slide 5', chipState.ativo === 4, 'ativo=' + chipState.ativo);

  // Seta "anterior" volta
  await p.$eval('.catalog-arrow--prev', (b) => b.click());
  await sleep(600);
  const backState = await p.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('.catalog-dot'));
    return dots.findIndex((d) => d.classList.contains('is-active'));
  });
  ok('Seta "anterior" volta 1 slide (dot 4 ativo)', backState === 3, 'dot=' + backState);

  // Deep-link vindo do menu (troca de hash sem recarregar)
  await p.goto(page('pele.html'), { waitUntil: 'networkidle0' });
  await sleep(400);
  await p.evaluate(() => { location.hash = 'servico-preenchimento'; });
  await sleep(600);
  await sleep(600);
  const deepLink = await p.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.topic-chip'));
    return chips.findIndex((c) => c.classList.contains('is-active'));
  });
  ok('Deep-link #servico-preenchimento posiciona o slide 2', deepLink === 2, 'ativo=' + deepLink);

  /* ============ 3. BLOG ============ */
  console.log('\n[3] Blog (renderização, filtro, busca, modal)');
  await p.goto(page('blog.html'), { waitUntil: 'networkidle0' });
  await sleep(400);

  const initialCards = await p.$$eval('.blog-card', (els) => els.length);
  ok('Renderiza 6 artigos inicialmente (paginação)', initialCards === 6, 'cards=' + initialCards);

  await p.evaluate(() => document.querySelector('[data-blog-filter="Cabelo"]').click());
  await sleep(300);
  const filtered = await p.$$eval('.blog-card', (els) => els.length);
  const tags = await p.$$eval('.blog-card .blog-tag', (els) => els.map((e) => e.textContent));
  ok('Filtro "Cabelo" mostra só artigos de cabelo', filtered === 3 && tags.every((t) => t === 'Cabelo'), JSON.stringify(tags));

  await p.evaluate(() => document.querySelector('[data-blog-filter="Todos"]').click());
  await p.evaluate(() => {
    const input = document.querySelector('[data-blog-search]');
    input.value = 'minim veniam';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await sleep(300);
  const searched = await p.$$eval('.blog-card', (els) => els.length);
  ok('Busca encontra 1 artigo', searched === 1, 'resultados=' + searched);

  await p.evaluate(() => {
    const input = document.querySelector('[data-blog-search]');
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('[data-blog-more]').click();
  });
  await sleep(300);
  const afterMore = await p.$$eval('.blog-card', (els) => els.length);
  ok('"Carregar mais" adiciona artigos (6 -> 9)', afterMore === 9, 'cards=' + afterMore);

  await p.evaluate(() => document.querySelector('.blog-card .blog-more').click());
  await sleep(400);
  const modalOpen = await p.evaluate(() => !document.querySelector('[data-blog-modal]').hidden);
  const modalTitle = await p.evaluate(() => document.querySelector('[data-blog-modal-title]').textContent.length);
  ok('"Ler mais" abre o modal com o artigo', modalOpen && modalTitle > 20, 'titulo_len=' + modalTitle);

  await p.keyboard.press('Escape');
  await sleep(300);
  const modalClosed = await p.evaluate(() => document.querySelector('[data-blog-modal]').hidden);
  ok('Escape fecha o modal', modalClosed);

  /* ============ 4. RESPONSIVO (sem scroll horizontal) ============ */
  console.log('\n[4] Responsivo — viewport de celular (375px)');
  const m = await browser.newPage();
  await m.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  for (const f of ['index.html', 'pele.html', 'blog.html']) {
    await m.goto(page(f), { waitUntil: 'networkidle0' });
    await sleep(400);
    const overflow = await m.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    ok('Sem scroll horizontal em ' + f, overflow <= 0, 'overflow=' + overflow);
  }

  /* ============ 5. FORMULÁRIO ============ */
  console.log('\n[5] Formulário de contato (validação)');
  const f = await browser.newPage();
  await f.setViewport({ width: 1280, height: 900 });
  await f.goto(page('index.html') + '#contato', { waitUntil: 'networkidle0' });
  await sleep(400);
  await f.click('.form-submit');
  await sleep(300);
  const errorShown = await f.evaluate(() => !document.querySelector('.form-error').hidden);
  ok('Envio vazio exibe mensagem de erro', errorShown);
  await f.type('#f-nome', 'Nome Teste');
  await f.type('#f-email', 'teste@exemplo.com');
  await f.type('#f-mensagem', 'Olá, gostaria de agendar.');
  await f.click('.form-field--check input');
  await f.click('.form-submit');
  await sleep(300);
  const successShown = await f.evaluate(() => !document.querySelector('.form-success').hidden);
  ok('Formulário válido exibe confirmação', successShown);

  /* ============ RESUMO ============ */
  console.log('\n===========================');
  console.log('Resultado: ' + passed + ' passou, ' + failed + ' falhou');
  process.exitCode = failed > 0 ? 1 : 0;
} finally {
  await browser.close();
}
