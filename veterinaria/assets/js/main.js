"use strict";
/* ============================================================
   VetVida — main.ts
   Menu mobile, header, reveal, formulário -> WhatsApp
   ============================================================ */
const WHATSAPP_NUMBER = '5511999999999';
const GENERAL_MESSAGE = 'Olá! Vim pelo site da VetVida e gostaria de agendar uma consulta.';
const waLink = (message) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
/* ---------- Menu mobile ---------- */
function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav');
    if (!toggle || !nav)
        return;
    const setOpen = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        nav.classList.toggle('is-open', open);
    };
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    toggle.addEventListener('click', () => {
        setOpen(!isOpen());
    });
    nav.addEventListener('click', (event) => {
        const target = event.target;
        if (target && target.closest('a'))
            setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen()) {
            setOpen(false);
            toggle.focus();
        }
    });
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (isOpen() && target && !target.closest('.site-header')) {
            setOpen(false);
        }
    });
    window.addEventListener('resize', () => {
        if (window.matchMedia('(min-width: 900px)').matches && isOpen()) {
            setOpen(false);
        }
    });
}
/* ---------- Header com sombra ao rolar ---------- */
function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header)
        return;
    let ticking = false;
    const update = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }, { passive: true });
    update();
}
/* ---------- Reveal on scroll ---------- */
function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length)
        return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return;
    if (!('IntersectionObserver' in window))
        return;
    document.documentElement.classList.add('reveal-ready');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((item) => observer.observe(item));
}
function readField(form, name) {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement) {
        return field.value.trim();
    }
    return '';
}
function buildAppointmentMessage(data) {
    const lines = [
        '*AGENDAMENTO — VETVIDA*',
        '',
        `*Tutor(a):* ${data.name}`,
        `*Telefone:* ${data.phone}`,
        data.pet ? `*Pet:* ${data.pet}` : null,
        data.species ? `*Espécie:* ${data.species}` : null,
        data.service ? `*Serviço:* ${data.service}` : null,
        data.preference ? `*Melhor dia/período:* ${data.preference}` : null,
        data.message ? `*Mensagem:* ${data.message}` : null,
    ];
    return lines.filter((line) => line !== null).join('\n');
}
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!(form instanceof HTMLFormElement))
        return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = {
            name: readField(form, 'name'),
            phone: readField(form, 'phone'),
            pet: readField(form, 'pet'),
            species: readField(form, 'species'),
            service: readField(form, 'service'),
            preference: readField(form, 'preference'),
            message: readField(form, 'message'),
        };
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            const original = button.innerHTML;
            button.disabled = true;
            button.innerHTML = 'Abrindo o WhatsApp...';
            window.setTimeout(() => {
                button.disabled = false;
                button.innerHTML = original;
            }, 2500);
        }
        window.open(waLink(buildAppointmentMessage(data)), '_blank', 'noopener');
    });
}
const DAY_MS = 86400000;
const STATUS_LABEL = {
    'em dia': 'Em dia',
    'a vencer': 'A vencer',
    atrasada: 'Atrasada',
    prevista: 'Prevista',
    verificar: 'Verificar',
};
const STATUS_CLASS = {
    'em dia': 'ok',
    'a vencer': 'warn',
    atrasada: 'late',
    prevista: 'info',
    verificar: 'warn',
};
function parseDateInput(value) {
    if (!value)
        return null;
    const parts = value.split('-').map(Number);
    if (parts.length !== 3)
        return null;
    const [year, month, day] = parts;
    if (!year || !month || !day)
        return null;
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
}
function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
function formatDate(date) {
    return date.toLocaleDateString('pt-BR');
}
function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
}
function addYears(date, years) {
    const copy = new Date(date);
    copy.setFullYear(copy.getFullYear() + years);
    return copy;
}
function ageLabel(birth) {
    const today = startOfToday();
    if (birth > today)
        return 'data no futuro';
    let months = (today.getFullYear() - birth.getFullYear()) * 12 +
        (today.getMonth() - birth.getMonth());
    if (today.getDate() < birth.getDate())
        months -= 1;
    const years = Math.floor(months / 12);
    const restMonths = months % 12;
    const parts = [];
    if (years > 0)
        parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
    if (restMonths > 0)
        parts.push(`${restMonths} ${restMonths === 1 ? 'mês' : 'meses'}`);
    if (!parts.length) {
        const days = Math.max(0, Math.round((today.getTime() - birth.getTime()) / DAY_MS));
        parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
    }
    return parts.join(' e ');
}
function buildDoses(state) {
    const today = startOfToday();
    if (!state.birth || state.birth > today)
        return [];
    const birth = state.birth;
    const ageDays = Math.floor((today.getTime() - birth.getTime()) / DAY_MS);
    // Protocolo inicial ilustrativo (até 16 semanas)
    if (ageDays < 112) {
        const milestones = [
            { label: '1ª dose (8 semanas)', weeks: 8 },
            { label: '2ª dose (12 semanas)', weeks: 12 },
            { label: '3ª dose + antirrábica (16 semanas)', weeks: 16 },
        ];
        return milestones.map((milestone) => {
            const date = addDays(birth, milestone.weeks * 7);
            const status = date < today ? 'verificar' : 'prevista';
            return { label: milestone.label, date, status };
        });
    }
    if (state.lastVaccine) {
        const next = addYears(state.lastVaccine, 1);
        const diffDays = Math.floor((next.getTime() - today.getTime()) / DAY_MS);
        const status = diffDays < 0 ? 'atrasada' : diffDays <= 30 ? 'a vencer' : 'em dia';
        return [{ label: 'Reforço anual', date: next, status }];
    }
    return [
        {
            label: 'Reforço anual — informe a última vacinação',
            date: null,
            status: 'prevista',
        },
    ];
}
function initPetCardTilt() {
    const card = document.getElementById('pet-card');
    if (!card)
        return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return;
    if (!window.matchMedia('(pointer: fine)').matches)
        return;
    card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
}
function initPetCard() {
    const form = document.getElementById('pet-card-form');
    const nameInput = document.getElementById('pet-name');
    const birthInput = document.getElementById('pet-birth');
    const lastInput = document.getElementById('pet-last-vaccine');
    const nameEl = document.getElementById('card-name');
    const ageEl = document.getElementById('card-age');
    const scheduleEl = document.getElementById('card-schedule');
    const speciesEl = document.getElementById('card-species');
    const issuedEl = document.getElementById('card-issued');
    if (!(form instanceof HTMLFormElement) ||
        !(nameInput instanceof HTMLInputElement) ||
        !(birthInput instanceof HTMLInputElement) ||
        !(lastInput instanceof HTMLInputElement) ||
        !nameEl ||
        !ageEl ||
        !scheduleEl ||
        !speciesEl ||
        !issuedEl) {
        return;
    }
    const state = {
        name: '',
        species: 'Cão',
        birth: null,
        lastVaccine: null,
    };
    const render = () => {
        nameEl.textContent = state.name || 'Seu pet';
        ageEl.textContent = state.birth
            ? `${ageLabel(state.birth)} · ${state.species}`
            : 'Preencha os dados para montar a carteirinha';
        const speciesUse = speciesEl.querySelector('use');
        if (speciesUse) {
            speciesUse.setAttribute('href', `assets/img/sprite.svg#${state.species === 'Gato' ? 'i-cat' : 'i-dog'}`);
        }
        const speciesText = speciesEl.querySelector('span');
        if (speciesText)
            speciesText.textContent = state.species;
        scheduleEl.innerHTML = '';
        const doses = buildDoses(state);
        if (!doses.length) {
            const empty = document.createElement('li');
            empty.className = 'schedule-item schedule-item--empty';
            empty.textContent = state.birth
                ? 'Data de nascimento no futuro.'
                : 'As próximas doses aparecem aqui.';
            scheduleEl.appendChild(empty);
            return;
        }
        doses.forEach((dose) => {
            const item = document.createElement('li');
            item.className = 'schedule-item';
            item.innerHTML =
                '<svg class="icon" aria-hidden="true"><use href="assets/img/sprite.svg#i-syringe"/></svg>' +
                    '<span class="schedule-label"></span>' +
                    '<span class="schedule-date"></span>' +
                    '<span class="schedule-status"></span>';
            const label = item.querySelector('.schedule-label');
            const date = item.querySelector('.schedule-date');
            const status = item.querySelector('.schedule-status');
            if (!label || !date || !status)
                return;
            label.textContent = dose.label;
            date.textContent = dose.date ? formatDate(dose.date) : 'informar';
            status.textContent = STATUS_LABEL[dose.status];
            status.classList.add(`status--${STATUS_CLASS[dose.status]}`);
            scheduleEl.appendChild(item);
        });
    };
    nameInput.addEventListener('input', () => {
        state.name = nameInput.value.trim();
        render();
    });
    birthInput.addEventListener('change', () => {
        state.birth = parseDateInput(birthInput.value);
        render();
    });
    lastInput.addEventListener('change', () => {
        state.lastVaccine = parseDateInput(lastInput.value);
        render();
    });
    const speciesButtons = document.querySelectorAll('.segmented-btn');
    speciesButtons.forEach((button) => {
        button.addEventListener('click', () => {
            speciesButtons.forEach((other) => {
                const active = other === button;
                other.classList.toggle('is-active', active);
                other.setAttribute('aria-pressed', String(active));
            });
            state.species = button.getAttribute('data-species') === 'Gato' ? 'Gato' : 'Cão';
            render();
        });
    });
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        state.name = nameInput.value.trim();
        state.birth = parseDateInput(birthInput.value);
        state.lastVaccine = parseDateInput(lastInput.value);
        if (!state.name || !state.birth) {
            form.reportValidity();
            return;
        }
        const doses = buildDoses(state);
        const lines = [
            '*CARTEIRINHA DIGITAL — VETVIDA*',
            '',
            `*Pet:* ${state.name}`,
            `*Espécie:* ${state.species}`,
            `*Nascimento:* ${formatDate(state.birth)}`,
            `*Idade:* ${ageLabel(state.birth)}`,
            state.lastVaccine ? `*Última vacinação:* ${formatDate(state.lastVaccine)}` : null,
            '',
            '*Próximas doses:*',
            ...doses.map((dose) => `• ${dose.label}: ${dose.date ? formatDate(dose.date) : 'informar data'} (${STATUS_LABEL[dose.status]})`),
            '',
            'Gostaria de confirmar o calendário de vacinas do meu pet.',
        ];
        const message = lines.filter((line) => line !== null).join('\n');
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            const original = button.innerHTML;
            button.disabled = true;
            button.innerHTML = 'Abrindo o WhatsApp...';
            window.setTimeout(() => {
                button.disabled = false;
                button.innerHTML = original;
            }, 2500);
        }
        window.open(waLink(message), '_blank', 'noopener');
    });
    issuedEl.textContent = `Emitida em ${formatDate(new Date())}`;
    render();
    initPetCardTilt();
}
/* ---------- Ano no rodapé ---------- */
function initYear() {
    document.querySelectorAll('[data-year]').forEach((el) => {
        el.textContent = String(new Date().getFullYear());
    });
}
/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeaderScroll();
    initReveal();
    initContactForm();
    initPetCard();
    initYear();
});
