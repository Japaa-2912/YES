// ==================== PARTÍCULAS DE FUNDO ====================
function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#e91e63', '#f48fb1', '#f8bbd0', '#f4c2c2', '#fce4ec', '#ffb3c1'];
  
  function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 8 + 3;
    const startX = Math.random() * 100;
    const duration = Math.random() * 10 + 6;
    const delay = Math.random() * 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${startX}%;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 2}px ${color};
    `;
    
    container.appendChild(particle);
    
    // Remove partícula após animação
    setTimeout(() => {
      particle.remove();
    }, (duration + delay) * 1000);
  }
  
  // Criar partículas continuamente
  setInterval(createParticle, 400);
  
  // Criar algumas iniciais
  for (let i = 0; i < 15; i++) {
    setTimeout(createParticle, i * 200);
  }
}

// ==================== SLIDER DE DEPOIMENTOS ====================
function initDepoimentosSlider() {
  const cards = document.querySelectorAll('.depoimento-card');
  const dots = document.querySelectorAll('.dot');
  let currentIndex = 0;
  let interval;
  
  function showSlide(index) {
    cards.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    cards[index].classList.add('active');
    dots[index].classList.add('active');
    currentIndex = index;
  }
  
  function nextSlide() {
    const next = (currentIndex + 1) % cards.length;
    showSlide(next);
  }
  
  // Event listeners nos dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'));
      showSlide(index);
      resetInterval();
    });
  });
  
  function startInterval() {
    interval = setInterval(nextSlide, 4000);
  }
  
  function resetInterval() {
    clearInterval(interval);
    startInterval();
  }
  
  // Iniciar
  showSlide(0);
  startInterval();
  
  // Pausar no hover
  const slider = document.getElementById('depoimentosSlider');
  slider.addEventListener('mouseenter', () => clearInterval(interval));
  slider.addEventListener('mouseleave', startInterval);
}

// ==================== ANIMAÇÃO SCROLL REVEAL ====================
function initScrollReveal() {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Elementos para animar
  const animatableElements = document.querySelectorAll(`
    .dif-card,
    .card-imagem,
    .proposito-content,
    .cta-content,
    .section-title
  `);
  
  animatableElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
  });
}

// ==================== EFEITO HOVER NOS CARDS ====================
function initCardEffects() {
  const cards = document.querySelectorAll('.card-imagem');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
  });
}

// ==================== EFEITO DIGITAÇÃO NO HERO ====================
function initTypingEffect() {
  const badge = document.querySelector('.badge');
  const originalText = badge.textContent;
  badge.textContent = '';
  
  let i = 0;
  function typeWriter() {
    if (i < originalText.length) {
      badge.textContent += originalText.charAt(i);
      i++;
      setTimeout(typeWriter, 50);
    }
  }
  
  setTimeout(typeWriter, 500);
}

// ==================== EFEITO PARALLAX SUAVE ====================
function initParallax() {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
      const beforeEl = hero.querySelector('::before');
      hero.style.backgroundPosition = `center ${scrolled * 0.3}px`;
    }
  });
}

// ==================== CONTADOR DE VISITAS (SIMULADO) ====================
function initSocialProof() {
  const ctaSection = document.querySelector('.cta-content p');
  if (ctaSection) {
    const randomClients = Math.floor(Math.random() * 20) + 30;
    ctaSection.textContent = `Junte-se a mais de ${randomClients} clientes que transformaram sua autoestima`;
  }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initDepoimentosSlider();
  initScrollReveal();
  initCardEffects();
  initTypingEffect();
  initParallax();
  initSocialProof();
  
  // Smooth scroll para links internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  console.log('✨ Hair Studio Motivacional - Página carregada com sucesso!');
  console.log('💖 Pronta para transformar autoestimas!');
});