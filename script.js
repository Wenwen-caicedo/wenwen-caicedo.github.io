/**
 * Digicard - Agencia de Diseño Gráfico
 * JavaScript Vanilla (ES6+)
 * Módulos: Navegación, Validación de Formularios, Animaciones, Portafolio
 */

(function() {
    'use strict';

    // ==================== UTILIDADES ====================
    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
    const debounce = (fn, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(null, args), delay);
        };
    };

    // ==================== NAVEGACIÓN ====================
    const initNavigation = () => {
        const header = $('#header');
        const navToggle = $('#navToggle');
        const navMenu = $('#navMenu');
        const navLinks = $$('.nav__link');

        // Header scroll effect
        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }
        };

        window.addEventListener('scroll', debounce(handleScroll, 10));

        // Mobile menu toggle
        const toggleMenu = (open) => {
            const isOpen = open ?? navMenu.classList.contains('open');
            if (isOpen) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Abrir menú de navegación');
                document.body.style.overflow = '';
            } else {
                navMenu.classList.add('open');
                navToggle.setAttribute('aria-expanded', 'true');
                navToggle.setAttribute('aria-label', 'Cerrar menú de navegación');
                document.body.style.overflow = 'hidden';
            }
        };

        navToggle.addEventListener('click', () => toggleMenu());

        // Cerrar menú al hacer click en un link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('open')) {
                    toggleMenu(true);
                }
            });
        });

        // Cerrar menú al hacer click fuera
        navMenu.addEventListener('click', (e) => {
            if (e.target === navMenu) {
                toggleMenu(true);
            }
        });

        // Escape key para cerrar menú
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('open')) {
                toggleMenu(true);
            }
        });

        // Active link on scroll (Intersection Observer)
        const sections = $$('section[id]');
        const observerOptions = { rootMargin: '-40% 0px -55% 0px' };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => sectionObserver.observe(section));
    };

    // ==================== SCROLL TO TOP ====================
    const initScrollTop = () => {
        const scrollTopBtn = $('#scrollTop');

        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', debounce(toggleVisibility, 50));

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    // ==================== CONTADORES ANIMADOS ====================
    const initCounters = () => {
        const counters = $$('.stat__number[data-count]');
        if (!counters.length) return;

        const animateCounter = (el) => {
            const target = parseInt(el.dataset.count, 10);
            const duration = 2000;
            const startTime = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Easing: easeOutQuart
                const ease = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(ease * target);
                el.textContent = current + (target > 100 ? '+' : '');

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target + '+';
                }
            };

            requestAnimationFrame(update);
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    };

    // ==================== PORTAFOLIO FILTROS ====================
    const initPortfolio = () => {
        const filters = $$('.portfolio__filter');
        const items = $$('.portfolio__item');
        if (!filters.length || !items.length) return;

        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                const category = filter.dataset.filter;

                // Actualizar botones activos
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');

                // Filtrar items
                items.forEach(item => {
                    const itemCategory = item.dataset.category;
                    if (category === 'all' || itemCategory === category) {
                        item.classList.remove('hidden');
                        item.style.animation = 'fadeIn 0.4s ease forwards';
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });

        // Inyectar keyframes para animación de fade
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    };

    // ==================== VALIDACIÓN DE FORMULARIO ====================
    const initContactForm = () => {
        const form = $('#contactForm');
        if (!form) return;

        const fields = {
            name: { el: $('#name'), error: $('#nameError'), validate: (v) => v.length >= 2 },
            email: { el: $('#email'), error: $('#emailError'), validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
            subject: { el: $('#subject'), error: $('#subjectError'), validate: (v) => v !== '' },
            message: { el: $('#message'), error: $('#messageError'), validate: (v) => v.length >= 10 }
        };

        const showError = (field, message) => {
            field.el.classList.add('error');
            field.el.classList.remove('success');
            field.error.textContent = message;
        };

        const showSuccess = (field) => {
            field.el.classList.remove('error');
            field.el.classList.add('success');
            field.error.textContent = '';
        };

        const clearField = (field) => {
            field.el.classList.remove('error', 'success');
            field.error.textContent = '';
        };

        const messages = {
            name: 'Por favor ingresa tu nombre completo (mínimo 2 caracteres).',
            email: 'Ingresa un correo electrónico válido.',
            subject: 'Selecciona un asunto.',
            message: 'El mensaje debe tener al menos 10 caracteres.'
        };

        // Validación en tiempo real (blur)
        Object.entries(fields).forEach(([key, field]) => {
            field.el.addEventListener('blur', () => {
                const value = field.el.value.trim();
                if (value === '') {
                    clearField(field);
                    return;
                }
                if (!field.validate(value)) {
                    showError(field, messages[key]);
                } else {
                    showSuccess(field);
                }
            });

            field.el.addEventListener('input', () => {
                if (field.el.classList.contains('error')) {
                    const value = field.el.value.trim();
                    if (field.validate(value)) {
                        showSuccess(field);
                    }
                }
            });
        });

        // Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            Object.entries(fields).forEach(([key, field]) => {
                const value = field.el.value.trim();
                if (!field.validate(value)) {
                    showError(field, messages[key]);
                    isValid = false;
                } else {
                    showSuccess(field);
                }
            });

            if (isValid) {
                const submitBtn = $('#submitBtn');
                const originalContent = submitBtn.innerHTML;

                // Estado de carga
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span>Enviando...</span>';

                // Simular envío (reemplazar con fetch real)
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>¡Enviado!</span>';
                    submitBtn.style.background = 'var(--color-success)';

                    // Mostrar mensaje de éxito
                    const successMsg = $('#formSuccess');
                    successMsg.classList.add('visible');
                    form.reset();
                    Object.values(fields).forEach(clearField);

                    // Restaurar botón después de un tiempo
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalContent;
                        submitBtn.style.background = '';
                        successMsg.classList.remove('visible');
                    }, 4000);
                }, 1500);
            } else {
                // Focus en el primer campo con error
                const firstError = $('.form__input.error');
                if (firstError) firstError.focus();
            }
        });
    };

    // ==================== NEWSLETTER FORM ====================
    const initNewsletter = () => {
        const form = $('#newsletterForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            const btn = form.querySelector('button');

            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                btn.style.background = 'var(--color-success)';
                input.value = '';

                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.style.background = '';
                }, 2500);
            }
        });
    };

    // ==================== ANIMACIONES SCROLL (Fade In) ====================
    const initScrollAnimations = () => {
        const animatedElements = $$('[data-aos]');
        if (!animatedElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.aosDelay || 0;
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            observer.observe(el);
        });
    };

    // ==================== INICIALIZACIÓN ====================
    const init = () => {
        initNavigation();
        initScrollTop();
        initCounters();
        initPortfolio();
        initContactForm();
        initNewsletter();
        initScrollAnimations();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
