/* ============================================================
   catalog.js — Carrossel de procedimentos (uma página por categoria)
   ------------------------------------------------------------
   - Renderiza os cards da categoria (CATALOG_DATA) no track
   - "Partes móveis por tópico": chips clicáveis acima do
     carrossel deslizam até o procedimento correspondente
   - Setas laterais + bolinhas de paginação
   - Deep-link: #servico-xxx ao abrir a página já posiciona
     o carrossel no procedimento (usado pelos menus do header)
   ============================================================ */
(function () {
  'use strict';

  var GAP = 16; // deve espelhar o --gap do .catalog-track

  /* Nº de cards visíveis conforme o breakpoint (espelha o CSS) */
  function getPerView() {
    var w = window.innerWidth;
    if (w >= 1025) return 3;
    if (w >= 641) return 2;
    return 1;
  }

  function initCatalog(root) {
    var track = root.querySelector('[data-catalog-track]');
    var doc = root.ownerDocument || document;
    /* Chips e dots ficam no mesmo container da seção (irmãos do
       carrossel); busca no documento como fallback */
    var chipsBox = root.querySelector('[data-catalog-chips]') || doc.querySelector('[data-catalog-chips]');
    var dotsBox = root.querySelector('[data-catalog-dots]') || doc.querySelector('[data-catalog-dots]');
    var prevBtn = root.querySelector('[data-catalog-prev]');
    var nextBtn = root.querySelector('[data-catalog-next]');
    var categoryKey = root.getAttribute('data-category');

    var category = window.CATALOG_DATA[categoryKey];
    if (!category || !track) return;

    var items = category.items;
    var index = 0;
    var perView = getPerView();
    var cardGap = GAP;

    /* ---------- Renderiza os cards ---------- */
    items.forEach(function (item, i) {
      var card = document.createElement('article');
      card.className = 'catalog-card';
      card.id = item.id;

      var thumb = document.createElement('div');
      thumb.className = 'catalog-thumb';

      var body = document.createElement('div');
      body.className = 'catalog-body';

      var h3 = document.createElement('h3');
      h3.textContent = item.name;

      var p = document.createElement('p');
      p.textContent = item.desc;

      var link = document.createElement('a');
      link.className = 'catalog-link';
      link.href = 'index.html#contato';
      link.textContent = 'Agendar consulta';
      link.setAttribute('aria-label', 'Agendar consulta: ' + item.name);

      body.appendChild(h3);
      body.appendChild(p);
      body.appendChild(link);
      card.appendChild(thumb);
      card.appendChild(body);
      track.appendChild(card);
    });

    /* ---------- Chips de tópicos (navegação direta) ---------- */
    if (chipsBox) {
      items.forEach(function (item, i) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'topic-chip';
        chip.textContent = item.name;
        chip.setAttribute('aria-label', 'Ir para ' + item.name);
        chip.addEventListener('click', function () {
          goTo(i);
        });
        chipsBox.appendChild(chip);
      });
    }

    /* ---------- Bolinhas de paginação ---------- */
    function buildDots() {
      if (!dotsBox) return;
      dotsBox.innerHTML = '';
      var pages = items.length - perView + 1;
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'catalog-dot';
        dot.setAttribute('aria-label', 'Ir para a página ' + (i + 1));
        dot.addEventListener('click', function () {
          goTo(Number(this.getAttribute('data-page')));
        });
        dot.setAttribute('data-page', String(i));
        dotsBox.appendChild(dot);
      }
    }

    /* ---------- Movimento ---------- */
    function maxIndex() {
      return items.length - perView;
    }

    function goTo(target, instant) {
      index = Math.max(0, Math.min(target, maxIndex()));
      var card = track.querySelector('.catalog-card');
      var step = card ? card.getBoundingClientRect().width + cardGap : 0;
      if (instant) {
        track.classList.add('no-anim');
      }
      track.style.transform = 'translateX(-' + (index * step) + 'px)';
      if (instant) {
        // Força o reflow para aplicar o salto sem transição
        void track.offsetWidth;
        track.classList.remove('no-anim');
      }
      sync();
    }

    function sync() {
      if (prevBtn) prevBtn.classList.toggle('is-disabled', index === 0);
      if (nextBtn) nextBtn.classList.toggle('is-disabled', index >= maxIndex());

      if (dotsBox) {
        var dots = dotsBox.children;
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.toggle('is-active', i === index);
        }
      }

      if (chipsBox) {
        var chips = chipsBox.children;
        for (var j = 0; j < chips.length; j++) {
          chips[j].classList.toggle('is-active', j === index);
        }
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });

    /* ---------- Responsivo: recalcula ao redimensionar ---------- */
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var nextPerView = getPerView();
        if (nextPerView !== perView) {
          perView = nextPerView;
          buildDots();
        }
        goTo(index, true);
      }, 150);
    });

    /* ---------- Deep-link vindo dos menus (#servico-xxx) ----------
       Cobre dois cenários: navegação inicial com hash e troca de
       hash sem recarregar a página (hashchange). */
    function applyHash() {
      var targetIndex = -1;
      items.forEach(function (item, i) {
        if (location.hash === '#' + item.id) targetIndex = i;
      });
      if (targetIndex >= 0) goTo(targetIndex, true);
    }

    if (document.readyState === 'complete') {
      applyHash();
    } else {
      window.addEventListener('load', applyHash);
    }
    window.addEventListener('hashchange', applyHash);

    buildDots();
    goTo(0, true);
  }

  /* Inicializa todos os carrosséis presentes na página */
  document.addEventListener('DOMContentLoaded', function () {
    var roots = document.querySelectorAll('[data-catalog]');
    roots.forEach(initCatalog);
  });
})();
