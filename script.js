(() => {
  'use strict';

  const INTRO_KEY = 'yes_intro_seen';
  const WHATSAPP_NUMBER = '5511994782909';

  document.addEventListener('DOMContentLoaded', () => {
    initIntro();
    initPlanButtons();
  });

  /* ========== INTRO (roda apenas na 1ª visita da sessão) ========== */
  function initIntro() {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadySeen = sessionStorage.getItem(INTRO_KEY) === '1';

    if (reducedMotion || alreadySeen) {
      overlay.classList.add('is-out');
      return;
    }

    sessionStorage.setItem(INTRO_KEY, '1');
    document.body.classList.add('intro-active');

    const letters = overlay.querySelectorAll('.intro-letter');
    const yesLetters = overlay.querySelectorAll('.intro-letter.intro-yes');

    letters.forEach((el, i) => {
      el.style.transitionDelay = `${i * 70}ms`;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('is-in'));
    });

    setTimeout(() => overlay.classList.add('is-dissolve'), 1150);
    setTimeout(() => flyToLogo(overlay, yesLetters), 1300);
    setTimeout(() => {
      overlay.classList.add('is-out');
      document.body.classList.remove('intro-active');
    }, 2350);
  }

  /* Leva Y, E e S até a logo da navbar */
  function flyToLogo(overlay, yesLetters) {
    const targets = ['logo-y', 'logo-e', 'logo-s']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!targets.length || yesLetters.length !== targets.length) return;

    yesLetters.forEach((letter, i) => {
      const from = letter.getBoundingClientRect();
      const to = targets[i].getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(letter).fontSize) || 48;

      const clone = letter.cloneNode(true);
      clone.classList.remove('intro-letter', 'intro-yes');
      clone.classList.add('fly-letter');
      clone.style.left = `${from.left + from.width / 2}px`;
      clone.style.top = `${from.top + from.height / 2}px`;
      clone.style.fontSize = `${fontSize}px`;
      clone.style.transform = 'translate(-50%, -50%)';
      overlay.appendChild(clone);

      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      const scale = Math.max(0.3, Math.min(0.55, to.height / fontSize));

      clone.style.transitionDelay = '0s, 0.95s';
      void clone.offsetWidth;

      clone.style.transform =
        `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;
      clone.style.opacity = '0';

      letter.style.transition = 'opacity 0.35s ease';
      letter.style.opacity = '0';
    });
  }

  /* ========== BOTÕES DE PLANOS (WhatsApp) ========== */
  function initPlanButtons() {
    const buttons = document.querySelectorAll('.assinar-btn');
    if (!buttons.length) return;

    const messages = {
      'Básico':
        'Olá! Tenho interesse no *Plano Básico* (R$ 250 — até 2 páginas, ideal para presença digital rápida). Pode me passar mais informações?',
      'Iniciante':
        'Olá! Tenho interesse no *Plano Iniciante* (R$ 350 — de 1 a 3 páginas, com acompanhamento passo a passo do projeto).',
      'Intermediário':
        'Olá! Tenho interesse no *Plano Intermediário* (R$ 450 — de 1 a 5 páginas, com SEO básico e 6 meses de manutenção inclusa).',
      'Premium':
        'Olá! Tenho interesse no *Plano Premium* (R$ 800 — de 1 a 8 páginas, solução completa com SEO avançado e 12 meses de manutenção premium).',
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const plano = btn.getAttribute('data-plano');
        const msg =
          messages[plano] ||
          'Olá! Gostaria de saber mais sobre os planos de criação de sites da YES.';
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
          '_blank',
          'noopener'
        );
      });
    });
  }
})();