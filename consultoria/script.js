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

    // ---------- Formulário de Anamnese -> WhatsApp ----------
    const anamnesisForm = document.getElementById('anamnesisForm');
    if (anamnesisForm) {

        // Mesmo número usado nos demais CTAs da página (troque aqui se precisar)
        const WHATSAPP_ANAMNESE = '5511999999999';

        // Checkbox "Nenhuma" é exclusiva das demais condições
        const condicaoChecks = Array.from(
            anamnesisForm.querySelectorAll('input[name="condicao"]')
        );
        condicaoChecks.forEach(check => {
            check.addEventListener('change', () => {
                if (check.value === 'Nenhuma' && check.checked) {
                    condicaoChecks.forEach(other => {
                        if (other !== check) other.checked = false;
                    });
                } else if (check.checked) {
                    const nenhuma = condicaoChecks.find(c => c.value === 'Nenhuma');
                    if (nenhuma) nenhuma.checked = false;
                }
            });
        });

        const valor = (name) => {
            const el = anamnesisForm.elements[name];
            return el && el.value ? el.value.trim() : '';
        };

        anamnesisForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const condicoes = condicaoChecks
                .filter(c => c.checked)
                .map(c => c.value)
                .join(', ') || 'Não informado';

            const medicamentos = valor('medicamentos');
            const medicamentosQuais = valor('medicamentosQuais');
            const medicamentosTexto =
                medicamentos === 'Sim' && medicamentosQuais
                    ? `Sim — ${medicamentosQuais}`
                    : medicamentos;

            const linhas = [
                '*ANAMNESE — IRONCOACH*',
                '',
                `*Nome:* ${valor('nome')}`,
                `*Idade:* ${valor('idade')} anos`,
                valor('altura') ? `*Altura:* ${valor('altura')} cm` : null,
                valor('peso') ? `*Peso:* ${valor('peso')} kg` : null,
                '',
                `*Objetivo:* ${valor('objetivo')}`,
                `*Nível de atividade:* ${valor('nivel')}`,
                `*Experiência com treino:* ${valor('experiencia')}`,
                `*Frequência semanal:* ${valor('frequencia')}`,
                `*Local de treino:* ${valor('local')}`,
                valor('equipamentos') ? `*Equipamentos:* ${valor('equipamentos')}` : null,
                '',
                `*Condições de saúde:* ${condicoes}`,
                `*Medicamentos de uso contínuo:* ${medicamentosTexto}`,
                valor('dores') ? `*Dores/limitações:* ${valor('dores')}` : null,
                `*Horas de sono:* ${valor('sono')}`,
                valor('restricoes') ? `*Restrições alimentares:* ${valor('restricoes')}` : null,
                `*Fuma:* ${valor('fuma')}  |  *Álcool:* ${valor('alcool')}`,
                valor('observacoes') ? `\n*Observações:* ${valor('observacoes')}` : null,
            ].filter(linha => linha !== null);

            const mensagem = linhas.join('\n');
            const url = `https://wa.me/${WHATSAPP_ANAMNESE}?text=${encodeURIComponent(mensagem)}`;

            // Feedback visual no botão enquanto o WhatsApp abre
            const submitBtn = anamnesisForm.querySelector('.anamnesis__submit');
            if (submitBtn) {
                const original = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="ph ph-check-circle"></i> Abrindo o WhatsApp...';
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = original;
                }, 2500);
            }

            window.open(url, '_blank');
        });
    }

    // ---------- Log para debug (opcional, remove em produção) ----------
    console.log('%c🔥 IRONCOACH LP %cCarregada com sucesso!',
        'font-size:18px; font-weight:bold; color:#C8FF00;',
        'font-size:13px; color:#aaa;');
    console.log('%cIntersection Observer ativo. Elementos com .fade-up serão animados.',
        'color:#777;');
});