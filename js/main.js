const SecurityUtils = {
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    rateLimiter: {
        attempts: {},
        isAllowed(key, maxAttempts = 5, timeWindow = 60000) {
            const now = Date.now();
            if (!this.attempts[key]) {
                this.attempts[key] = [];
            }
            
            this.attempts[key] = this.attempts[key].filter(
                time => now - time < timeWindow
            );
            
            if (this.attempts[key].length >= maxAttempts) {
                return false;
            }
            
            this.attempts[key].push(now);
            return true;
        }
    },

    preventClickjacking() {
        if (window.top !== window.self) {
            window.top.location = window.self.location;
        }
    }
};

SecurityUtils.preventClickjacking();

const CONFIG = {
    typingSpeed: 100,
    typingDelay: 2000,
    scrollOffset: 80,
    animationDuration: 1000
};

class PageLoader {
    constructor() {
        this.loader = document.querySelector('.loader-wrapper');
        this.init();
    }

    init() {
        if (document.readyState === 'complete') {
            this.hide();
        } else {
            window.addEventListener('load', () => this.hide());
        }
    }

    hide() {
        if (this.loader) {
            this.loader.classList.add('hidden');
            setTimeout(() => {
                this.loader.style.display = 'none';
            }, 500);
        }
    }
}

class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.follower = document.querySelector('.cursor-follower');
        this.init();
    }

    init() {
        if (window.innerWidth <= 768 || !this.cursor || !this.follower) return;

        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                this.follower.style.left = e.clientX + 'px';
                this.follower.style.top = e.clientY + 'px';
            }, 100);
        });

        const interactiveElements = document.querySelectorAll('a, button, input, textarea, .project-card');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                this.follower.style.transform = 'translate(-50%, -50%) scale(2)';
            });
            
            el.addEventListener('mouseleave', () => {
                this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                this.follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
            });
        });
    }
}

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.handleScroll();
        this.handleHamburger();
        this.handleNavLinks();
        this.highlightActiveSection();
    }

    handleScroll() {
        window.addEventListener('scroll', () => {
            if (this.navbar) {
                if (window.pageYOffset > 100) {
                    this.navbar.classList.add('scrolled');
                } else {
                    this.navbar.classList.remove('scrolled');
                }
            }
        });
    }

    handleHamburger() {
        if (!this.hamburger || !this.navMenu) return;
        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navMenu.classList.toggle('active');
            document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    handleNavLinks() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetSection = document.querySelector(targetId);
                    
                    if (targetSection) {
                        const offsetTop = targetSection.offsetTop - CONFIG.scrollOffset;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                    
                    if (this.hamburger && this.navMenu) {
                        this.hamburger.classList.remove('active');
                        this.navMenu.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }
            });
        });
    }

    highlightActiveSection() {
        window.addEventListener('scroll', () => {
            let current = '';
            const sections = document.querySelectorAll('section[id]');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.pageYOffset >= sectionTop - CONFIG.scrollOffset - 100) {
                    current = section.getAttribute('id');
                }
            });
            
            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
}

class ThemeToggle {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        if (!this.themeToggle) return;
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const icon = this.themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

class TypeWriter {
    constructor() {
        this.element = document.querySelector('.typing-text');
        this.texts = [
            'Técnico en Ingeniería en Computación',
            'Desarrolladora Full Stack',
            'Oracle Cloud Certified Associate'
        ];
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.init();
    }

    init() {
        if (!this.element) return;
        this.type();
    }

    type() {
        const current = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = current.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = current.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        let typeSpeed = this.isDeleting ? 50 : CONFIG.typingSpeed;
        
        if (!this.isDeleting && this.charIndex === current.length) {
            typeSpeed = CONFIG.typingDelay;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.cert-card, .project-card, .skill-item, .about-content, .contact-content');
        this.init();
    }

    init() {
        this.observeElements();
        this.animateCounters();
        this.animateSkillBars();
    }

    observeElements() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in', 'visible');
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        this.elements.forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        };
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        
        counters.forEach(counter => observer.observe(counter));
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const progress = entry.target.getAttribute('data-progress');
                        entry.target.style.width = progress + '%';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        
        skillBars.forEach(bar => observer.observe(bar));
    }
}

class ProjectFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card');
        this.init();
    }

    init() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterProjects(filter);
                this.updateActiveButton(btn);
            });
        });
    }

    filterProjects(filter) {
        this.projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    updateActiveButton(activeBtn) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
}

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.status = document.getElementById('formStatus');
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const sanitizedValue = SecurityUtils.sanitizeInput(value);
        let isValid = true;
        
        if (field.hasAttribute('required') && !sanitizedValue) {
            isValid = false;
        }
        
        if (field.type === 'email' && !SecurityUtils.validateEmail(sanitizedValue)) {
            isValid = false;
        }
        
        if (isValid) {
            field.style.borderColor = 'var(--accent)';
        } else {
            field.style.borderColor = '#ef4444';
        }
        
        return isValid;
    }

    async handleSubmit() {
        if (!SecurityUtils.rateLimiter.isAllowed('contactForm', 3, 300000)) {
            this.showStatus('Has excedido el límite de envíos. Por favor, intenta más tarde.', 'error');
            return;
        }

        let isValid = true;
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showStatus('Por favor, completa todos los campos correctamente.', 'error');
            return;
        }

        this.showStatus('Enviando mensaje...', 'success');

        const formData = new FormData(this.form);
        try {
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                this.showStatus('¡Mensaje enviado con éxito! Te responderé lo antes posible.', 'success');
                this.form.reset();
                inputs.forEach(input => input.style.borderColor = 'var(--bg-tertiary)');
            } else {
                this.showStatus('Ocurrió un error al procesar el envío. Revisa tu ID de Formspree.', 'error');
            }
        } catch (error) {
            this.showStatus('Error de red. Asegúrate de estar conectado a internet.', 'error');
        }
    }

    showStatus(message, type) {
        if (!this.status) return;
        this.status.textContent = message;
        this.status.className = `form-status ${type}`;
        
        setTimeout(() => {
            this.status.className = 'form-status';
        }, 5000);
    }
}

class Newsletter {
    constructor() {
        this.form = document.getElementById('newsletterForm');
        this.init();
    }

    init() {
        if (!this.form) return;
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    handleSubmit() {
        const input = this.form.querySelector('input');
        if (input) {
            const email = SecurityUtils.sanitizeInput(input.value.trim());
            if (!SecurityUtils.validateEmail(email)) {
                alert('Por favor, ingresa un email válido.');
                return;
            }
            alert('¡Gracias por tu interés! Te mantendré al tanto de mis actualizaciones profesionales.');
            input.value = '';
        }
    }
}

class BackToTop {
    constructor() {
        this.button = document.getElementById('backToTop');
        this.init();
    }

    init() {
        if (!this.button) return;
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        });
        
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

class SecurityEnhancements {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('.profile-img, .project-image img').forEach(img => {
            img.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PageLoader();
    new CustomCursor();
    new Navigation();
    new ThemeToggle();
    new TypeWriter();
    new ScrollAnimations();
    new ProjectFilter();
    new ContactForm();
    new Newsletter();
    new BackToTop();
    new SecurityEnhancements();
    
    console.log('%c¡Hola Reclutador! 👋', 'font-size: 16px; font-weight: bold; color: #6366f1;');
});