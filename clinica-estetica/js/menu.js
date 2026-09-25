/* ============================================================
   menu.js — Navegação principal
   ------------------------------------------------------------
   Comportamento dos dropdowns ("Pele" / "Cabelos"):
   - Desktop: abre no HOVER (com atraso de fechamento via CSS)
     e também por CLICK no botão (híbrido). Fecha ao clicar
     fora ou pressionar Esc.
   - Mobile: acordeão por click dentro do drawer.
   ============================================================ */
(function () {
  'use strict';

  var menuToggle = document.querySelector('.menu-toggle');
  var mainNav = document.querySelector('.main-nav');
  var backdrop = document.querySelector('.nav-backdrop');
  var submenuToggles = document.querySelectorAll('.nav-link--toggle');
  var MOBILE_BP = 1024;

  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  /* ---- Drawer mobile ---- */
  function openMenu() {
    menuToggle.classList.add('is-active');
    mainNav.classList.add('is-open');
    backdrop.hidden = false;
    backdrop.classList.add('is-visible');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuToggle.classList.remove('is-active');
    mainNav.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = '';

    setTimeout(function () {
      if (!mainNav.classList.contains('is-open')) {
        backdrop.hidden = true;
      }
    }, 250);

    closeAllSubmenus();
  }

  function closeAllSubmenus() {
    document.querySelectorAll('.has-submenu.is-open').forEach(function (item) {
      item.classList.remove('is-open');
      var btn = item.querySelector('.nav-link--toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleSubmenu(toggle) {
    var parent = toggle.closest('.has-submenu');
    if (!parent) return;
    // Fecha os demais dropdowns antes de abrir este
    closeAllSubmenus();
    var isOpen = parent.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      if (mainNav.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (!isMobile()) closeMenu();
    });
  }

  /* ---- Dropdowns: click abre/fecha em qualquer viewport ---- */
  submenuToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      toggleSubmenu(toggle);
    });
  });

  /* ---- Click fora do header fecha os dropdowns abertos ---- */
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.has-submenu')) {
      closeAllSubmenus();
    }
  });

  /* ---- Links do menu fecham o drawer no mobile (inclusive
         links para outras páginas do template) ---- */
  document.querySelectorAll('.main-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (isMobile()) closeMenu();
    });
  });
})();
