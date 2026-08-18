/* ============================================================
   build-pages.mjs — Gera cabelo.html e cirurgias.html a partir
   de pele.html (as três páginas de tratamento compartilham a
   mesma estrutura; só mudam dados, navegação ativa e categoria).
   Uso: node scripts/build-pages.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pele = readFileSync(join(root, 'pele.html'), 'utf8');

/* ---------- cabelo.html ---------- */
let cabelo = pele
  // Título e descrição
  .replace('<title>Tratamentos para Pele — Luminae Estética</title>', '<title>Tratamentos para Cabelo — Luminae Estética</title>')
  .replace(
    '<meta name="description" content="Procedimentos para pele: toxina botulínica, bioestimuladores, preenchimento, peelings e mais.">',
    '<meta name="description" content="Tratamentos capilares: terapia capilar, MMP, intradermoterapia capilar e laser LLLT.">'
  )
  // Navegação ativa: move o destaque do item "Pele" para "Cabelos"
  .replace('<li class="nav-item has-submenu is-active">', '<li class="nav-item has-submenu">')
  .replace(
    'Cabelos\n              <svg class="nav-chevron"',
    'Cabelos\n              <svg class="nav-chevron"' // placeholder, substituído abaixo
  )
  // No cabelo.html o dropdown "Pele" aponta para pele.html e o "Cabelos" vira local
  .replaceAll('href="#servico-toxina" class="submenu-link"', 'href="pele.html#servico-toxina" class="submenu-link"')
  .replaceAll('href="#servico-bioestimuladores" class="submenu-link"', 'href="pele.html#servico-bioestimuladores" class="submenu-link"')
  .replaceAll('href="#servico-preenchimento" class="submenu-link"', 'href="pele.html#servico-preenchimento" class="submenu-link"')
  .replaceAll('href="#servico-skinbooster" class="submenu-link"', 'href="pele.html#servico-skinbooster" class="submenu-link"')
  .replaceAll('href="#servico-fios" class="submenu-link"', 'href="pele.html#servico-fios" class="submenu-link"')
  .replaceAll('href="#servico-peelings" class="submenu-link"', 'href="pele.html#servico-peelings" class="submenu-link"')
  .replaceAll('href="#servico-ultrassom" class="submenu-link"', 'href="pele.html#servico-ultrassom" class="submenu-link"')
  .replaceAll('href="#servico-laser" class="submenu-link"', 'href="pele.html#servico-laser" class="submenu-link"')
  .replaceAll('href="#servico-limpeza" class="submenu-link"', 'href="pele.html#servico-limpeza" class="submenu-link"')
  .replaceAll('href="cabelo.html#servico-terapia-capilar" class="submenu-link"', 'href="#servico-terapia-capilar" class="submenu-link"')
  .replaceAll('href="cabelo.html#servico-mmp" class="submenu-link"', 'href="#servico-mmp" class="submenu-link"')
  .replaceAll('href="cabelo.html#servico-mesoterapia" class="submenu-link"', 'href="#servico-mesoterapia" class="submenu-link"')
  .replaceAll('href="cabelo.html#servico-lllt" class="submenu-link"', 'href="#servico-lllt" class="submenu-link"')
  // Ativa o dropdown "Cabelos" (segundo li com has-submenu)
  .replace(
    '<li class="nav-item has-submenu">\n            <button type="button" class="nav-link nav-link--toggle" aria-expanded="false" aria-haspopup="true">\n              Cabelos',
    '<li class="nav-item has-submenu is-active">\n            <button type="button" class="nav-link nav-link--toggle" aria-expanded="false" aria-haspopup="true">\n              Cabelos'
  )
  // Page-hero e categoria do carrossel
  .replace('<h1>Tratamentos para <em>Pele</em></h1>', '<h1>Tratamentos para <em>Cabelo</em></h1>')
  .replace('data-catalog data-category="pele"', 'data-catalog data-category="cabelo"')
  // Faixa CTA
  .replace('Pronta para cuidar da sua pele?', 'Pronta para cuidar dos seus fios?');

writeFileSync(join(root, 'cabelo.html'), cabelo, 'utf8');

/* ---------- cirurgias.html ---------- */
let cirurgias = pele
  .replace('<title>Tratamentos para Pele — Luminae Estética</title>', '<title>Cirurgias — Luminae Estética</title>')
  .replace(
    '<meta name="description" content="Procedimentos para pele: toxina botulínica, bioestimuladores, preenchimento, peelings e mais.">',
    '<meta name="description" content="Procedimentos cirúrgicos: blefaroplastia, otoplastia, rinoplastia, exérese de lesões e enxerto capilar.">'
  )
  // Navegação ativa: item "Cirurgias"
  .replace('<li class="nav-item has-submenu is-active">', '<li class="nav-item has-submenu">')
  .replaceAll('href="#servico-toxina" class="submenu-link"', 'href="pele.html#servico-toxina" class="submenu-link"')
  .replaceAll('href="#servico-bioestimuladores" class="submenu-link"', 'href="pele.html#servico-bioestimuladores" class="submenu-link"')
  .replaceAll('href="#servico-preenchimento" class="submenu-link"', 'href="pele.html#servico-preenchimento" class="submenu-link"')
  .replaceAll('href="#servico-skinbooster" class="submenu-link"', 'href="pele.html#servico-skinbooster" class="submenu-link"')
  .replaceAll('href="#servico-fios" class="submenu-link"', 'href="pele.html#servico-fios" class="submenu-link"')
  .replaceAll('href="#servico-peelings" class="submenu-link"', 'href="pele.html#servico-peelings" class="submenu-link"')
  .replaceAll('href="#servico-ultrassom" class="submenu-link"', 'href="pele.html#servico-ultrassom" class="submenu-link"')
  .replaceAll('href="#servico-laser" class="submenu-link"', 'href="pele.html#servico-laser" class="submenu-link"')
  .replaceAll('href="#servico-limpeza" class="submenu-link"', 'href="pele.html#servico-limpeza" class="submenu-link"')
  .replaceAll('href="cabelo.html#servico-terapia-capilar" class="submenu-link"', 'href="cabelo.html#servico-terapia-capilar" class="submenu-link"')
  .replace(
    '<li class="nav-item">\n            <a href="cirurgias.html" class="nav-link">Cirurgias</a>',
    '<li class="nav-item is-active">\n            <a href="cirurgias.html" class="nav-link">Cirurgias</a>'
  )
  // Page-hero e categoria do carrossel
  .replace('<h1>Tratamentos para <em>Pele</em></h1>', '<h1>Cirurgias <em>Especiais</em></h1>')
  .replace(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.'
  )
  .replace('data-catalog data-category="pele"', 'data-catalog data-category="cirurgias"')
  // Faixa CTA
  .replace('Pronta para cuidar da sua pele?', 'Agende a sua avaliação cirúrgica?')
  .replace('Agende uma avaliação e receba um plano personalizado para o seu caso.', 'Converse com a nossa equipe e entenda o procedimento ideal para você.');

writeFileSync(join(root, 'cirurgias.html'), cirurgias, 'utf8');

console.log('Páginas geradas: cabelo.html e cirurgias.html');
