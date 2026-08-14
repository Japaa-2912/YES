// Animação suave ao scroll para uma sensação mais premium e acolhedora
document.addEventListener('DOMContentLoaded', () => {
    const floatButton = document.querySelector('.whatsapp-float');
    const cards = document.querySelectorAll('.servico-card');
    const listItems = document.querySelectorAll('.diferencial-list li');

    // Animação de entrada suave nos cards de serviço e na lista de diferenciais
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

    // Aplica observador nos cards e itens da lista
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    listItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(item);
    });

    // Esconde/mostra o texto do botão flutuante no mobile para economizar espaço (opcional)
    function handleFloatButtonText() {
        if (window.innerWidth < 480) {
            document.querySelector('.whatsapp-text').style.display = 'none';
        } else {
            document.querySelector('.whatsapp-text').style.display = 'inline';
        }
    }

    window.addEventListener('resize', handleFloatButtonText);
    handleFloatButtonText(); // Executa ao carregar

    // Pequeno easter egg no console para quem inspeciona o site (mostra amor!)
    console.log('🐶🐱 Olá, humano curioso! Todo pet merece um dia de spa cheio de amor. Agende o do seu melhor amigo! ❤️');
});
