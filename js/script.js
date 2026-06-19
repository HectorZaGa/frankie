document.addEventListener("DOMContentLoaded", () => {
    // Inicializar iconos de Lucide
    lucide.createIcons();

    const cursorDot = document.getElementById("cursor-dot");
    const cursorOutline = document.getElementById("cursor-outline");

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    const siteLogo = document.getElementById('site-logo');
    const navbar = document.querySelector('.navbar');

    const updateLogo = () => {
        if (!siteLogo || !navbar) return;
        const isLightMode = document.body.classList.contains('light-mode');
        const isCompact = navbar.classList.contains('scrolled');

        if (isLightMode) {
            siteLogo.src = isCompact ? 'assets/favicon_color.svg' : 'assets/logo_color.svg';
        } else {
            siteLogo.src = isCompact ? 'assets/favicon_dark.svg' : 'assets/logo_dark.svg';
        }
    };
    
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        if (sunIcon && moonIcon) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }
    updateLogo(); // Llamada inicial

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLightMode = document.body.classList.contains('light-mode');
            
            if (isLightMode) {
                localStorage.setItem('theme', 'light');
                if (sunIcon && moonIcon) {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                }
            } else {
                localStorage.setItem('theme', 'dark');
                if (sunIcon && moonIcon) {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                }
            }
            updateLogo();
        });
    }

    // Sidebar Hamburger Menu Logic
    const menuToggleBtn = document.getElementById('menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (menuToggleBtn && navLinksContainer) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinksContainer.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (navLinksContainer.classList.contains('open') && !navLinksContainer.contains(e.target) && !menuToggleBtn.contains(e.target)) {
                navLinksContainer.classList.remove('open');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('open');
            });
        });
    }

    // Navbar Scroll Animation
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateLogo();
    });

    // Check if it's a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        window.addEventListener("mousemove", (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Adding a small delay to the outline for a smooth trailing effect
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });
    }

    // Custom Full-Page Scroll & SPA Logic
    let sections = [];
    let currentSectionIndex = 0;
    let isAnimating = false;

    const dotNavigation = document.getElementById('dot-navigation');
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            scrollToSection(0);
        });
    }

    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    let snapAnimationId;
    let isAnimatingSnap = false;
    let isUserScrolling = false;

    const smoothScrollTo = (targetPosition, duration = 1200) => {
        cancelAnimationFrame(snapAnimationId);
        isAnimatingSnap = true;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let start = null;

        if (Math.abs(distance) < 5) {
            isAnimatingSnap = false;
            return;
        }

        const step = (timestamp) => {
            if (isUserScrolling) {
                isAnimatingSnap = false;
                return;
            }
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percent = Math.min(progress / duration, 1);
            
            window.scrollTo(0, startPosition + distance * easeInOutCubic(percent));

            if (progress < duration) {
                snapAnimationId = window.requestAnimationFrame(step);
            } else {
                window.scrollTo(0, targetPosition);
                setTimeout(() => { isAnimatingSnap = false; }, 50);
            }
        };
        snapAnimationId = window.requestAnimationFrame(step);
    };

    const scrollToSection = (index) => {
        if (index < 0 || index >= sections.length) return;
        smoothScrollTo(sections[index].offsetTop, 1000); // Suave para botones
    };

    // Intersection Observer para rastrear en qué sección estamos
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = sections.indexOf(entry.target);
                if (index !== -1) {
                    currentSectionIndex = index;
                    
                    if (dotNavigation) {
                        dotNavigation.querySelectorAll('.dot-nav-item').forEach((dot, i) => {
                            if (i === index) dot.classList.add('active');
                            else dot.classList.remove('active');
                        });
                    }

                    if (backToTopBtn) {
                        if (index > 0) backToTopBtn.classList.add('visible');
                        else backToTopBtn.classList.remove('visible');
                    }
                }
            }
        });
    }, observerOptions);

    function updateActiveView(viewId) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
            v.style.animation = 'none';
        });
        
        // Mostrar la vista objetivo
        let targetView = document.getElementById(viewId);
        if (!targetView) {
            targetView = document.getElementById('view-home');
            viewId = 'view-home';
        }
        
        targetView.classList.add('active');
        void targetView.offsetWidth; // Trigger reflow
        targetView.style.animation = null;

        const viewNames = {
            'view-home': 'Inicio',
            'view-about': 'Sobre Mí',
            'view-work': 'Trabajo',
            'view-contact': 'Contacto'
        };
        document.title = `Frankie | ${viewNames[viewId] || 'Inicio'}`;

        // Recalcular secciones para la vista activa
        sections = Array.from(document.querySelectorAll('.view.active .hero, .view.active .section'));
        currentSectionIndex = 0;

        // Reconectar Observer
        sectionObserver.disconnect();
        sections.forEach(sec => sectionObserver.observe(sec));

        // Generar puntos de navegación
        if (dotNavigation) {
            dotNavigation.innerHTML = '';
            if (sections.length > 1) {
                sections.forEach((_, i) => {
                    const dot = document.createElement('button');
                    dot.classList.add('dot-nav-item');
                    dot.setAttribute('aria-label', `Ir a la sección ${i + 1}`);
                    if (i === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => scrollToSection(i));
                    dotNavigation.appendChild(dot);
                });
            }
        }

        // Ocultar botón de volver arriba
        if (backToTopBtn) {
            backToTopBtn.classList.remove('visible');
        }
        
        // Resetear scroll sin animación
        window.scrollTo(0, 0);

        // Reiniciar animaciones dentro de la vista
        targetView.querySelectorAll('.fade-in').forEach(el => {
            el.style.animation = 'none';
            void el.offsetWidth;
            el.style.animation = null;
        });
    }

    // Manejar clics en navegación principal
    document.querySelectorAll('.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const viewId = this.getAttribute('href').substring(1);
            window.history.pushState(null, null, `#${viewId}`);
            updateActiveView(viewId);
        });
    });

    // Manejar clics en tarjetas de navegación interna
    document.querySelectorAll('.scroll-trigger').forEach(trigger => {
        trigger.addEventListener('click', function() {
            const targetIndex = parseInt(this.getAttribute('data-target-index'));
            if (!isNaN(targetIndex)) {
                scrollToSection(targetIndex);
            }
        });
    });

    // Manejar botones atrás/adelante del navegador
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1) || 'view-home';
        updateActiveView(hash);
    });

    // Inicializar la primera vista
    const initialHash = window.location.hash.substring(1) || 'view-home';
    updateActiveView(initialHash);

    // Motor de Soft Snap Customizado
    let snapTimeout;
    
    const stopAnimationOnInput = () => {
        if (isAnimatingSnap) {
            isUserScrolling = true;
            cancelAnimationFrame(snapAnimationId);
            isAnimatingSnap = false;
        }
    };

    window.addEventListener('wheel', stopAnimationOnInput, { passive: true });
    window.addEventListener('touchstart', stopAnimationOnInput, { passive: true });

    window.addEventListener('scroll', () => {
        if (isAnimatingSnap) return; // Ignorar scroll programático
        
        isUserScrolling = false; // El usuario paró de generar input

        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
            if (sections.length <= 1) return;
            
            let closestIndex = 0;
            let minDistance = Infinity;
            const scrollY = window.scrollY;

            sections.forEach((sec, i) => {
                const distance = Math.abs(sec.offsetTop - scrollY);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = i;
                }
            });

            // Auto centrar suavemente a la sección más cercana
            smoothScrollTo(sections[closestIndex].offsetTop, 800);
        }, 150); // Tiempo de espera tras detener el scroll
    }, { passive: true });
});
