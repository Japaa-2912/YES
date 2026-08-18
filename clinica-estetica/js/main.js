/* ============================================================
   main.js — Comportamentos globais do template
   ------------------------------------------------------------
   - Animação de revelação ao rolar (IntersectionObserver)
   - Validação do formulário de contato
   - Ano dinâmico no rodapé
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. Revelação ao rolar ---------- */
  var revealTargets = document.querySelectorAll(
    '.section-header, .category-grid, .catalog, .topic-chips, .catalog-dots, .blog-toolbar, .blog-grid, .blog-empty, .contact-grid, .page-hero'
  );

  revealTargets.forEach(function (el) {
    el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: mostra tudo imediatamente
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- 2. Formulário de contato ---------- */
  var form = document.querySelector('.contact-form');

  function setInvalid(field, invalid) {
    field.closest('.form-field').classList.toggle('is-invalid', invalid);
  }

  if (form) {
    var errorBox = form.querySelector('.form-error');
    var successBox = form.querySelector('.form-success');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (successBox) successBox.hidden = true;
      if (errorBox) errorBox.hidden = true;

      var valid = true;
      var firstInvalid = null;

      form.querySelectorAll('[required]').forEach(function (field) {
        var ok = field.value.trim() !== '';
        if (field.type === 'checkbox') ok = field.checked;
        if (field.type === 'email') {
          ok = ok && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }
        setInvalid(field, !ok);
        if (!ok) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!valid) {
        if (errorBox) {
          errorBox.textContent = 'Preencha corretamente os campos obrigatórios para enviar sua mensagem.';
          errorBox.hidden = false;
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Limpa estados visuais e simula o envio (sem backend no template)
      form.querySelectorAll('.is-invalid').forEach(function (el) {
        el.classList.remove('is-invalid');
      });
      if (successBox) successBox.hidden = false;
      form.reset();
    });

    // Remove o estado de erro assim que o usuário volta a digitar
    form.addEventListener('input', function (event) {
      if (event.target.closest('.form-field.is-invalid')) {
        setInvalid(event.target, false);
      }
    });
  }

  /* ---------- 3. Ano dinâmico no rodapé ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
