/* ============================================================
   blog.js — Página do Blog (funcional)
   ------------------------------------------------------------
   - Renderiza os cards de artigos a partir de BLOG_DATA
   - Filtro por categoria (Todos / Pele / Cabelo / Clínica)
   - Busca por texto (título + resumo)
   - Paginação "Carregar mais artigos"
   - Modal de leitura com o conteúdo completo do artigo
   ============================================================ */
(function () {
  'use strict';

  var PER_PAGE = 6;      // artigos exibidos inicialmente
  var LOAD_MORE = 3;     // quantos entram por clique em "carregar mais"

  var grid = document.querySelector('.blog-grid');
  var toolbar = document.querySelector('.blog-toolbar');
  if (!grid || !toolbar) return;

  var articles = (window.BLOG_DATA || []).slice();

  var state = {
    filter: 'Todos',
    search: '',
    visible: PER_PAGE
  };

  var modal = document.querySelector('[data-blog-modal]');
  var lastFocused = null;

  /* ---------- Cria o card de um artigo ---------- */
  function renderCard(article, i) {
    var card = document.createElement('article');
    card.className = 'blog-card';
    card.dataset.article = article.id;

    var thumb = document.createElement('div');
    thumb.className = 'blog-thumb';
    thumb.style.setProperty('--thumb', 'var(--thumb-' + ((i % 6) + 1) + ')');

    var tag = document.createElement('span');
    tag.className = 'blog-tag';
    tag.textContent = article.cat;
    thumb.appendChild(tag);

    var body = document.createElement('div');
    body.className = 'blog-body';

    var meta = document.createElement('p');
    meta.className = 'blog-meta';
    meta.textContent = article.date + ' · ' + article.minutes + ' min de leitura';

    var title = document.createElement('h3');
    title.className = 'blog-title';
    title.textContent = article.title;

    var excerpt = document.createElement('p');
    excerpt.className = 'blog-excerpt';
    excerpt.textContent = article.excerpt;

    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'blog-more';
    more.dataset.blogOpen = '';
    more.setAttribute('aria-label', 'Ler artigo: ' + article.title);
    more.textContent = 'Ler mais';
    more.innerHTML += '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';

    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(excerpt);
    body.appendChild(more);
    card.appendChild(thumb);
    card.appendChild(body);
    return card;
  }

  /* ---------- Filtro + busca ---------- */
  function matches(article) {
    var okFilter = state.filter === 'Todos' || article.cat === state.filter;
    var haystack = (article.title + ' ' + article.excerpt).toLowerCase();
    var okSearch = !state.search || haystack.indexOf(state.search) !== -1;
    return okFilter && okSearch;
  }

  function rerender() {
    var list = articles.filter(matches);
    grid.innerHTML = '';

    list.slice(0, state.visible).forEach(function (article, i) {
      grid.appendChild(renderCard(article, articles.indexOf(article)));
    });

    var empty = document.querySelector('.blog-empty');
    if (empty) empty.hidden = list.length !== 0;

    var loadMoreBtn = document.querySelector('[data-blog-more]');
    if (loadMoreBtn) {
      var remaining = list.length - state.visible;
      loadMoreBtn.hidden = remaining <= 0;
      loadMoreBtn.textContent = 'Carregar mais artigos (' + remaining + ')';
    }
  }

  /* ---------- Filtros por categoria ---------- */
  toolbar.querySelectorAll('[data-blog-filter]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      toolbar.querySelectorAll('[data-blog-filter]').forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      state.filter = tab.dataset.blogFilter;
      state.visible = PER_PAGE;
      rerender();
    });
  });

  /* ---------- Busca ---------- */
  var searchInput = toolbar.querySelector('[data-blog-search]');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.search = searchInput.value.trim().toLowerCase();
      state.visible = PER_PAGE;
      rerender();
    });
  }

  /* ---------- "Carregar mais" ---------- */
  var loadMoreBtn = document.querySelector('[data-blog-more]');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      state.visible += LOAD_MORE;
      rerender();
    });
  }

  /* ---------- Modal de leitura ---------- */
  function openModal(article) {
    if (!modal) return;
    lastFocused = document.activeElement;

    modal.querySelector('[data-blog-modal-tag]').textContent = article.cat;
    modal.querySelector('[data-blog-modal-title]').textContent = article.title;
    modal.querySelector('[data-blog-modal-meta]').textContent =
      article.date + ' · ' + article.minutes + ' min de leitura';

    var body = modal.querySelector('[data-blog-modal-body]');
    body.innerHTML = '';
    article.body.forEach(function (paragraph) {
      var p = document.createElement('p');
      p.textContent = paragraph;
      body.appendChild(p);
    });

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('[data-blog-close]');
    closeBtn.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  grid.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-blog-open]');
    if (!btn) return;
    var card = btn.closest('.blog-card');
    var article = articles.find(function (a) { return a.id === card.dataset.article; });
    if (article) openModal(article);
  });

  modal.querySelectorAll('[data-blog-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* ---------- Início ---------- */
  rerender();
})();
