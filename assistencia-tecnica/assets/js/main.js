(() => {
  'use strict';

  const WHATSAPP_NUMBER = '5511999999999';
  const waLink = (message) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeaderScroll();
    initReveal();
    initWizard();
    initFaq();
    initScrollSpy();
    initYear();
  });

  /* ---------- Menu mobile ---------- */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', open);
    };

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (isOpen() && !event.target.closest('.site-header')) setOpen(false);
    });

    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 900px)').matches && isOpen()) setOpen(false);
    });
  }

  /* ---------- Header ao rolar ---------- */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let ticking = false;
    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    update();
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('reveal-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((item) => observer.observe(item));
  }

  /* ---------- Wizard de orçamento ---------- */
  function initWizard() {
    const builder = document.querySelector('.quote-builder');
    if (!builder) return;

    const steps = [...builder.querySelectorAll('.quote-step')];
    const dots = [...builder.querySelectorAll('.quote-progress-dot')];
    const deviceButtons = [...builder.querySelectorAll('.choice[data-device]')];
    const problemButtons = [...builder.querySelectorAll('.chip-choice[data-problem]')];
    const brandSelect = document.getElementById('quote-brand');
    const modelInput = document.getElementById('quote-model');
    const detailsInput = document.getElementById('quote-details');
    const review = document.getElementById('quote-review');
    const submitBtn = document.getElementById('quote-submit');
    const errorEl = document.getElementById('quote-error');
    const sumDevice = document.getElementById('sum-device');
    const sumBrand = document.getElementById('sum-brand');
    const sumProblems = document.getElementById('sum-problems');
    const sumModel = document.getElementById('sum-model');

    if (!steps.length || !brandSelect || !modelInput || !detailsInput || !review || !submitBtn) return;

    const state = { device: '', brand: '', problems: new Set(), model: '', details: '' };
    let current = 0;

    const setSummary = (el, value) => {
      if (!el) return;
      el.textContent = value || '—';
      el.classList.toggle('is-empty', !value);
    };

    const renderSummary = () => {
      setSummary(sumDevice, state.device);
      setSummary(sumBrand, state.brand);
      setSummary(sumProblems, [...state.problems].join(', '));
      setSummary(sumModel, state.model);
    };

    const renderProgress = () => {
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === current);
        dot.classList.toggle('is-done', index < current);
      });
    };

    const renderReview = () => {
      review.innerHTML = '';
      const rows = [
        ['Aparelho', state.device],
        ['Marca', state.brand],
        ['Problemas', [...state.problems].join(', ')],
        ['Modelo', state.model],
        ['Detalhes', state.details],
      ];

      rows.forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'review-row';
        const span = document.createElement('span');
        span.textContent = label;
        const strong = document.createElement('strong');
        strong.textContent = value || '—';
        row.append(span, strong);
        review.appendChild(row);
      });
    };

    const showStep = (index) => {
      current = Math.max(0, Math.min(steps.length - 1, index));
      steps.forEach((step, i) => {
        step.hidden = i !== current;
      });
      renderProgress();
      if (current === 3) renderReview();

      if (index > 0 && window.innerWidth < 980) {
        const card = builder.querySelector('.quote-card');
        if (card) {
          const rect = card.getBoundingClientRect();
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };

    deviceButtons.forEach((button) => {
      button.addEventListener('click', () => {
        state.device = button.getAttribute('data-device') || '';
        deviceButtons.forEach((other) => other.classList.toggle('is-active', other === button));
        renderSummary();
        showStep(1);
      });
    });

    brandSelect.addEventListener('change', () => {
      state.brand = brandSelect.value;
      renderSummary();
    });

    problemButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const problem = button.getAttribute('data-problem') || '';
        if (state.problems.has(problem)) {
          state.problems.delete(problem);
          button.classList.remove('is-active');
        } else {
          state.problems.add(problem);
          button.classList.add('is-active');
        }
        if (errorEl) errorEl.hidden = true;
        renderSummary();
      });
    });

    modelInput.addEventListener('input', () => {
      state.model = modelInput.value.trim();
      renderSummary();
    });

    detailsInput.addEventListener('input', () => {
      state.details = detailsInput.value.trim();
    });

    builder.querySelectorAll('[data-next]').forEach((button) => {
      button.addEventListener('click', () => {
        if (current === 1 && !state.brand) {
          brandSelect.reportValidity();
          return;
        }
        if (current === 2 && state.problems.size === 0) {
          if (errorEl) errorEl.hidden = false;
          return;
        }
        showStep(current + 1);
      });
    });

    builder.querySelectorAll('[data-back]').forEach((button) => {
      button.addEventListener('click', () => showStep(current - 1));
    });

    submitBtn.addEventListener('click', () => {
      const lines = [
        '*ORÇAMENTO — FIXLAB*',
        '',
        `*Aparelho:* ${state.device}`,
        `*Marca:* ${state.brand}`,
        `*Problemas:* ${[...state.problems].join(', ')}`,
        state.model ? `*Modelo:* ${state.model}` : null,
        state.details ? `*Detalhes:* ${state.details}` : null,
        '',
        'Gostaria de receber um orçamento.',
      ];

      const message = lines.filter((line) => line !== null).join('\n');

      const original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Abrindo o WhatsApp...';
      window.setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
      }, 2500);

      window.open(waLink(message), '_blank', 'noopener');
    });

    renderSummary();
    renderProgress();
  }

  /* ---------- FAQ (accordion exclusivo) ---------- */
  function initFaq() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach((item) => {
      const button = item.querySelector('.faq-question');
      if (!button) return;

      button.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach((other) => {
          other.classList.remove('is-open');
          const otherButton = other.querySelector('.faq-question');
          if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------- Scrollspy do menu ---------- */
  function initScrollSpy() {
    const links = [...document.querySelectorAll('.nav ul a[href^="#"]')];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- Ano no rodapé ---------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }
})();
