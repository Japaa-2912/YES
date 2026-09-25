(() => {
  'use strict';

  const INTRO_KEY = 'yes_intro_seen';
  const WHATSAPP_NUMBER = '5511994782909';
  const prefersReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initWordReveal();
    initReveal();
    initFilters();
    initPlanButtons();
    initCounters();
    initFaq();
    initHeaderScroll();
    initBackToTop();
    initParallax();
    initScrollProgress();
    initIntro(() => document.body.classList.add('hero-ready'));
  });

  /* ========== REVEAL PALAVRA A PALAVRA (hero + títulos das seções) ========== */
  function initWordReveal() {
    const targets = document.querySelectorAll('#hero-title, [data-split]');
    if (!targets.length) return;

    targets.forEach((el) => {
      const words = [];
      for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent
            .split(/\s+/)
            .filter(Boolean)
            .forEach((w) => words.push({ w, em: false }));
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'EM') {
          node.textContent
            .split(/\s+/)
            .filter(Boolean)
            .forEach((w) => words.push({ w, em: true }));
        }
      }

      if (!words.length) return;
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());

      el.innerHTML = words
        .map(({ w, em }) => {
          const inner = em ? `<em>${w}</em>` : w;
          return `<span class="hero-word"><span class="hero-word-inner">${inner}</span></span>`;
        })
        .join(' ');

      if (prefersReduced()) {
        el.classList.add('is-split-revealed');
        if (el.id === 'hero-title') document.body.classList.add('hero-ready');
        return;
      }

      el.querySelectorAll('.hero-word-inner').forEach((inner, i) => {
        inner.style.transitionDelay = `${i * 55}ms`;
      });

      if (el.id === 'hero-title') return;

      if (!('IntersectionObserver' in window)) {
        el.classList.add('is-split-revealed');
        return;
      }

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            el.classList.add('is-split-revealed');
            io.disconnect();
          });
        },
        { threshold: 0.35 }
      );
      io.observe(el);
    });
  }

  /* ========== INTRO (roda apenas na 1ª visita da sessão) ========== */
  function initIntro(onReveal) {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) {
      if (onReveal) onReveal();
      return;
    }

    const alreadySeen = sessionStorage.getItem(INTRO_KEY) === '1';

    if (prefersReduced() || alreadySeen) {
      overlay.classList.add('is-out');
      if (onReveal) onReveal();
      return;
    }

    sessionStorage.setItem(INTRO_KEY, '1');
    document.body.classList.add('intro-active');

    spawnParticles();

    const letters = overlay.querySelectorAll('.intro-letter');
    const yesLetters = overlay.querySelectorAll('.intro-letter.intro-yes');

    letters.forEach((el, i) => {
      el.style.transitionDelay = `${120 + i * 40}ms`;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('is-in'));
    });

    setTimeout(() => overlay.classList.add('is-shine'), 900);
    setTimeout(() => {
      overlay.classList.add('is-dissolve');
      flyToLogo(overlay, yesLetters);
    }, 1300);
    setTimeout(() => {
      const logo = document.getElementById('logo-e') || document.getElementById('logo-y');
      if (logo) {
        const r = logo.getBoundingClientRect();
        overlay.style.setProperty('--lens-x', `${r.left + r.width / 2}px`);
        overlay.style.setProperty('--lens-y', `${r.top + r.height / 2}px`);
      }
      overlay.classList.add('is-out');
      if (onReveal) onReveal();
      setTimeout(() => document.body.classList.remove('intro-active'), 300);
    }, 2150);
  }

  function spawnParticles() {
    const host = document.getElementById('intro-particles');
    if (!host || prefersReduced()) return;

    for (let i = 0; i < 10; i++) {
      const p = document.createElement('span');
      const size = 2 + Math.random() * 2.5;
      p.className = 'intro-particle';
      p.style.left = `${6 + Math.random() * 88}%`;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.setProperty('--p-opacity', (0.12 + Math.random() * 0.22).toFixed(2));
      p.style.animationDuration = `${2 + Math.random() * 1.6}s`;
      p.style.animationDelay = `${Math.random() * 500}ms`;
      host.appendChild(p);
    }
  }

  /* Leva Y, E e S até a logo da navbar, com rastro de luz */
  function flyToLogo(overlay, yesLetters) {
    const targets = ['logo-y', 'logo-e', 'logo-s']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!targets.length || yesLetters.length !== targets.length) return;

    yesLetters.forEach((letter, i) => {
      const from = letter.getBoundingClientRect();
      const to = targets[i].getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(letter).fontSize) || 48;
      const fromX = from.left + from.width / 2;
      const fromY = from.top + from.height / 2;
      const dx = to.left + to.width / 2 - fromX;
      const dy = to.top + to.height / 2 - fromY;
      const scale = Math.max(0.3, Math.min(0.55, to.height / fontSize));
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      const clone = letter.cloneNode(true);
      clone.classList.remove('intro-letter', 'intro-yes');
      clone.classList.add('fly-letter');
      clone.style.left = `${fromX}px`;
      clone.style.top = `${fromY}px`;
      clone.style.fontSize = `${fontSize}px`;
      clone.style.transform = 'translate(-50%, -50%)';
      overlay.appendChild(clone);

      const trail = document.createElement('span');
      trail.className = 'fly-trail';
      trail.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateX(-108%)`;
      clone.appendChild(trail);

      clone.style.transitionDelay = '0s, 0.62s';
      void clone.offsetWidth;

      clone.style.transform =
        `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;
      clone.style.opacity = '0';

      letter.style.transition = 'opacity 0.3s ease';
      letter.style.opacity = '0';
    });
  }

  /* ========== NAVEGAÇÃO MOBILE (hambúrguer acessível) ========== */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menu.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
      if (open) {
        menu.querySelector('a')?.focus();
      } else {
        toggle.focus();
      }
    });

    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (
        toggle.getAttribute('aria-expanded') === 'true' &&
        !e.target.closest('.navbar')
      ) {
        setOpen(false);
      }
    });
  }

  /* ========== REVEAL ON SCROLL ========== */
  function initReveal() {
    if (prefersReduced()) return;

    const targets = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
    if (!targets.length || !('IntersectionObserver' in window)) return;

    document.body.classList.add('reveal-enabled');

    document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
      group.querySelectorAll(':scope > *').forEach((el, i) => {
        el.style.transitionDelay = `${i * 80}ms`;
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.hasAttribute('data-reveal-stagger')) {
            el.querySelectorAll(':scope > *').forEach((child) => {
              child.classList.add('is-revealed');
            });
          } else {
            el.classList.add('is-revealed');
          }
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => io.observe(el));
  }

  /* ========== FILTROS DE MODELOS ========== */
  function initFilters() {
    const bar = document.querySelector('.model-filters');
    if (!bar) return;

    const buttons = bar.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.model-card');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        cards.forEach((card) => {
          const show =
            filter === 'todas' || card.getAttribute('data-category') === filter;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ========== BOTÕES DE PLANOS (WhatsApp) ========== */
  function initPlanButtons() {
    const buttons = document.querySelectorAll('.assinar-btn');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const plano = btn.getAttribute('data-plano');
        const msg = `Olá! Vim pelo site da YES e tenho interesse no plano *${plano}*.`;
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
          '_blank',
          'noopener'
        );
      });
    });
  }

  /* ========== CONTADORES ANIMADOS ========== */
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (prefersReduced() || !('IntersectionObserver' in window)) return;

    const render = (el, value) => {
      el.textContent = value + (el.getAttribute('data-suffix') || '');
    };

    const animate = (el) => {
      const target = parseFloat(el.getAttribute('data-count')) || 0;
      const duration = 1100;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        render(el, Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    els.forEach((el) => io.observe(el));
  }

  /* ========== FAQ (accordion exclusivo) ========== */
  function initFaq() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach((item) => {
      const btn = item.querySelector('.faq-question');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach((other) => {
          other.classList.remove('is-open');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ========== HEADER: estado compacto ao rolar ========== */
  function initHeaderScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let ticking = false;
    const update = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    update();
  }

  /* ========== VOLTAR AO TOPO ========== */
  function initBackToTop() {
    const btn = document.querySelector('.to-top');
    if (!btn) return;

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
    });
  }

  /* ========== BARRA DE PROGRESSO DE SCROLL ========== */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    update();
  }

  /* ========== PARALLAX SUTIL NO HERO ========== */
  function initParallax() {
    const visual = document.querySelector('.hero-visual');
    if (!visual || prefersReduced()) return;
    if (window.matchMedia('(max-width: 980px)').matches) return;

    let ticking = false;
    const update = () => {
      const y = Math.min(window.scrollY, 900);
      visual.style.transform = `translateY(${(y * 0.05).toFixed(1)}px)`;
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
  }
})();