// ============================================================
// script.js — Landing Page Consultoria Fitness Online
// Animações com Intersection Observer + contador de vagas
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Intersection Observer: Fade-Up nos elementos ----------
    const fadeElements = document.querySelectorAll('.fade-up');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px -60px 0px', // dispara um pouco antes do elemento entrar
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Parar de observar após a animação para performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // ---------- Contador dinâmico de vagas (simulação) ----------
    const spotCounter = document.getElementById('spotCounter');
    if (spotCounter) {
        // Número inicial de vagas
        let spots = 14;

        // Atualiza o contador a cada 2-5 minutos (simulado com intervalos menores para demo)
        // Em produção, isso seria puxado de um backend. Aqui simulamos variação.
        function updateSpots() {
            // Simula variação: -1, 0, ou +1 (mas mantém entre 3 e 20)
            const change = Math.floor(Math.random() * 3) - 1; // -1, 0, ou 1
            spots = Math.max(3, Math.min(20, spots + change));
            spotCounter.textContent = spots;

            // Se vagas estiverem acabando, adiciona classe de urgência
            if (spots <= 5) {
                spotCounter.style.color = '#FF2D20';
                spotCounter.style.animation = 'pulseUrgency 1s ease-in-out infinite';
            } else {
                spotCounter.style.color = '#FF2D20';
                spotCounter.style.animation = 'none';
            }
        }

        // Adiciona estilo de pulsar urgência dinamicamente
        const urgencyStyle = document.createElement('style');
        urgencyStyle.textContent = `
                    @keyframes pulseUrgency {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.6; transform: scale(1.1); }
                    }
                `;
        document.head.appendChild(urgencyStyle);

        // Atualiza a cada 45 segundos (em demo; em produção seria mais espaçado)
        setInterval(updateSpots, 45000);

        // Primeira atualização após 15 segundos
        setTimeout(updateSpots, 15000);
    }

    // ---------- Header: muda opacidade ao rolar ----------
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
                header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.5)';
            } else {
                header.style.backgroundColor = 'rgba(10, 10, 10, 0.85)';
                header.style.boxShadow = 'none';
            }
        });
    }

    // ---------- Log para debug (opcional, remove em produção) ----------
    console.log('%c🔥 IRONCOACH LP %cCarregada com sucesso!',
        'font-size:18px; font-weight:bold; color:#C8FF00;',
        'font-size:13px; color:#aaa;');
    console.log('%cIntersection Observer ativo. Elementos com .fade-up serão animados.',
        'color:#777;');
});