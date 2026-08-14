// ===== script.js =====
document.addEventListener('DOMContentLoaded', () => {
  // ---- Intersection Observer para animações de revelação ----
  const revealElements = document.querySelectorAll('.reveal');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.15
  };

  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(revealCallback, observerOptions);

  revealElements.forEach(el => observer.observe(el));

  // ---- Atualizar ano no footer ----
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ---- Efeito de brilho adicional nos botões (já feito via CSS) ----
  // Os botões .btn--glow já possuem hover CSS, mas podemos adicionar
  // um comportamento extra se necessário. Mantido apenas o CSS.
});