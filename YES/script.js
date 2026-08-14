document.addEventListener('DOMContentLoaded', () => {

  // ========== INTRO ANIMATION ==========
  const overlay = document.getElementById('intro-overlay');
  if (overlay) {
    const introText = overlay.querySelector('.intro-text');
    const mainContent = document.getElementById('main-content');
    
    // Índices das letras Y (0), E (4), S (8)
    const letterSpans = introText.querySelectorAll('span');
    const lettersToMove = [
      { el: letterSpans[0], letter: 'Y' },
      { el: letterSpans[4], letter: 'E' },
      { el: letterSpans[8], letter: 'S' }
    ];

    // Aguarda 3 segundos
    setTimeout(() => {
      // 1. Esconde todas as letras EXCETO Y, E, S (que permanecem visíveis momentaneamente)
      letterSpans.forEach((span, idx) => {
        if (idx !== 0 && idx !== 4 && idx !== 8) {
          span.style.opacity = '0';
        }
      });

      // 2. Obtém as coordenadas CENTRAIS atuais das letras Y, E, S
      const centerCoords = lettersToMove.map(item => {
        const rect = item.el.getBoundingClientRect();
        return {
          left: rect.left + rect.width / 2,
          top: rect.top + rect.height / 2
        };
      });

      // 3. Esconde as letras originais (já estão ficando transparentes)
      lettersToMove.forEach(item => item.el.style.opacity = '0');

      // 4. Cria clones fixos no centro e adiciona ao overlay
      const clones = lettersToMove.map((item, i) => {
        const clone = document.createElement('span');
        clone.className = 'fly-letter';
        clone.textContent = item.letter;
        // Posição inicial exata do centro da letra original
        clone.style.left = centerCoords[i].left - 20 + 'px'; // ajuste para centralizar visualmente
        clone.style.top = centerCoords[i].top - 30 + 'px';
        clone.style.transform = 'translate(-50%, -50%)';
        overlay.appendChild(clone);
        return clone;
      });

      // 5. Força um reflow para que o navegador registre a posição inicial
      clones.forEach(clone => clone.offsetHeight);

      // 6. Calcula as posições FINAIS (logo na navbar)
      const logoY = document.getElementById('logo-y');
      const logoE = document.getElementById('logo-e');
      const logoS = document.getElementById('logo-s');
      
      if (logoY && logoE && logoS) {
        const finalCoords = [
          logoY.getBoundingClientRect(),
          logoE.getBoundingClientRect(),
          logoS.getBoundingClientRect()
        ];

        // Move os clones para as posições finais (canto)
        clones.forEach((clone, i) => {
          const rect = finalCoords[i];
          clone.style.left = rect.left + rect.width / 2 + 'px';
          clone.style.top = rect.top + rect.height / 2 + 'px';
          // Reduz um pouco o tamanho para combinar com a navbar (opcional)
          clone.style.fontSize = '2rem';
        });
      }

      // 7. Após a animação (2s), remove overlay e mostra conteúdo
      setTimeout(() => {
        overlay.style.display = 'none';
        mainContent.style.opacity = '1';
      }, 2200);

    }, 3000);
  }

  // ========== WHATSAPP (Planos) ==========
  const botoesAssinar = document.querySelectorAll('.assinar-btn');
  const numeroWhatsApp = '5511999999999'; // substitua pelo seu número

  botoesAssinar.forEach(botao => {
    botao.addEventListener('click', () => {
      const plano = botao.getAttribute('data-plano');
      let mensagem = '';
      switch (plano) {
        case 'Básico':
          mensagem = 'Olá! Tenho interesse no *Plano Básico* (R$497) para criação de site. Poderia me dar mais informações?';
          break;
        case 'Iniciante':
          mensagem = 'Olá! Gostaria de contratar o *Plano Iniciante* (R$997) com domínio e hospedagem. Podemos conversar?';
          break;
        case 'Intermediário':
          mensagem = 'Olá! Quero o *Plano Intermediário* (R$1.997), o mais popular. Aguardo instruções para fechar!';
          break;
        case 'Premium':
          mensagem = 'Olá! Desejo adquirir o *Plano Premium* (R$3.497) com acompanhamento completo. Vamos negociar?';
          break;
        default:
          mensagem = 'Olá! Gostaria de saber mais sobre os planos de criação de sites.';
      }
      const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    });
  });

});document.addEventListener('DOMContentLoaded', () => {

  // ========== INTRO ANIMATION ==========
  const overlay = document.getElementById('intro-overlay');
  if (overlay) {
    const introText = overlay.querySelector('.intro-text');
    const mainContent = document.getElementById('main-content');
    
    // Índices das letras Y (0), E (4), S (8)
    const letterSpans = introText.querySelectorAll('span');
    const lettersToMove = [
      { el: letterSpans[0], letter: 'Y' },
      { el: letterSpans[4], letter: 'E' },
      { el: letterSpans[8], letter: 'S' }
    ];

    // Aguarda 3 segundos
    setTimeout(() => {
      // 1. Esconde todas as letras EXCETO Y, E, S (que permanecem visíveis momentaneamente)
      letterSpans.forEach((span, idx) => {
        if (idx !== 0 && idx !== 4 && idx !== 8) {
          span.style.opacity = '0';
        }
      });

      // 2. Obtém as coordenadas CENTRAIS atuais das letras Y, E, S
      const centerCoords = lettersToMove.map(item => {
        const rect = item.el.getBoundingClientRect();
        return {
          left: rect.left + rect.width / 2,
          top: rect.top + rect.height / 2
        };
      });

      // 3. Esconde as letras originais (já estão ficando transparentes)
      lettersToMove.forEach(item => item.el.style.opacity = '0');

      // 4. Cria clones fixos no centro e adiciona ao overlay
      const clones = lettersToMove.map((item, i) => {
        const clone = document.createElement('span');
        clone.className = 'fly-letter';
        clone.textContent = item.letter;
        // Posição inicial exata do centro da letra original
        clone.style.left = centerCoords[i].left - 20 + 'px'; // ajuste para centralizar visualmente
        clone.style.top = centerCoords[i].top - 30 + 'px';
        clone.style.transform = 'translate(-50%, -50%)';
        overlay.appendChild(clone);
        return clone;
      });

      // 5. Força um reflow para que o navegador registre a posição inicial
      clones.forEach(clone => clone.offsetHeight);

      // 6. Calcula as posições FINAIS (logo na navbar)
      const logoY = document.getElementById('logo-y');
      const logoE = document.getElementById('logo-e');
      const logoS = document.getElementById('logo-s');
      
      if (logoY && logoE && logoS) {
        const finalCoords = [
          logoY.getBoundingClientRect(),
          logoE.getBoundingClientRect(),
          logoS.getBoundingClientRect()
        ];

        // Move os clones para as posições finais (canto)
        clones.forEach((clone, i) => {
          const rect = finalCoords[i];
          clone.style.left = rect.left + rect.width / 2 + 'px';
          clone.style.top = rect.top + rect.height / 2 + 'px';
          // Reduz um pouco o tamanho para combinar com a navbar (opcional)
          clone.style.fontSize = '2rem';
        });
      }

      // 7. Após a animação (2s), remove overlay e mostra conteúdo
      setTimeout(() => {
        overlay.style.display = 'none';
        mainContent.style.opacity = '1';
      }, 2200);

    }, 3000);
  }

  // ========== WHATSAPP (Planos) ==========
  const botoesAssinar = document.querySelectorAll('.assinar-btn');
  const numeroWhatsApp = '5511999999999'; // substitua pelo seu número

  botoesAssinar.forEach(botao => {
    botao.addEventListener('click', () => {
      const plano = botao.getAttribute('data-plano');
      let mensagem = '';
      switch (plano) {
        case 'Básico':
          mensagem = 'Olá! Tenho interesse no *Plano Básico* (R$497) para criação de site. Poderia me dar mais informações?';
          break;
        case 'Iniciante':
          mensagem = 'Olá! Gostaria de contratar o *Plano Iniciante* (R$997) com domínio e hospedagem. Podemos conversar?';
          break;
        case 'Intermediário':
          mensagem = 'Olá! Quero o *Plano Intermediário* (R$1.997), o mais popular. Aguardo instruções para fechar!';
          break;
        case 'Premium':
          mensagem = 'Olá! Desejo adquirir o *Plano Premium* (R$3.497) com acompanhamento completo. Vamos negociar?';
          break;
        default:
          mensagem = 'Olá! Gostaria de saber mais sobre os planos de criação de sites.';
      }
      const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    });
  });

});