// script.js
document.addEventListener('DOMContentLoaded', () => {
    const typewriterElement = document.getElementById('typewriter');
    const nameText = 'Dr. Alexandre Montenegro';
    let charIndex = 0;
    
    function typeWriter() {
        // Pega o texto atual baseado no índice
        const currentText = nameText.substring(0, charIndex);
        typewriterElement.textContent = currentText;
        
        // Avança para a próxima letra
        charIndex++;
        
        // Se ainda não chegou ao final, continua digitando
        if (charIndex <= nameText.length) {
            const typingSpeed = 100 + Math.random() * 50;
            setTimeout(typeWriter, typingSpeed);
        } else {
            // Terminou de digitar - remove o cursor piscante
            typewriterElement.classList.add('finished');
        }
    }
    
    // Inicia o efeito com um pequeno delay
    setTimeout(typeWriter, 300);
    
    // Animação de revelação para os elementos da seção de localização
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Elementos que terão animação ao scroll
    const animateElements = document.querySelectorAll('.address-card, .contact-info, .section-line, .location h2');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Clique no scroll indicator para rolar suavemente
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const locationSection = document.querySelector('.location');
            if (locationSection) {
                locationSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        scrollIndicator.style.cursor = 'pointer';
    }
});