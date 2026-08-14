// Inicialização da biblioteca AOS (Animate on Scroll)
AOS.init({
    startEvent: 'DOMContentLoaded',
    offset: 100,
    once: false,
    duration: 800,
    easing: 'ease-out-cubic',
    delay: 100,
    disable: false, // Mantenha 'false' para animações em todos os dispositivos
});

// Smooth scroll para links internos (opcional, mas elegante)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    });
});

// Lazy loading simples para imagens (melhora performance)
const images = document.querySelectorAll('img');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.src; // Força o carregamento se ainda não foi carregado
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '50px',
});

images.forEach(img => imageObserver.observe(img));

console.log('✨ Landing Page Dra. Alana Leal carregada com elegância e sofisticação.');