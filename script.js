const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const Loader = {
    init() {
        const loader = document.getElementById('loader');
        const progress = loader?.querySelector('.loader-progress');
        if (!loader || !progress) return;

        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 15;
            if (width >= 100) {
                width = 100;
                clearInterval(interval);
                setTimeout(() => {
                    loader.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 300);
            }
            progress.style.width = width + '%';
        }, 100);
    }
};

const CustomCursor = {
    cursor: null,
    trails: [],
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    trailPositions: [],
    rafId: null,
    isActive: false,

    init() {
        if (prefersReducedMotion || isTouchDevice) return;

        this.cursor = document.createElement('div');
        this.cursor.className = 'cursor-main';
        this.cursor.style.left = '0px';
        this.cursor.style.top = '0px';
        document.body.appendChild(this.cursor);

        for (let i = 0; i < 5; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.opacity = 0.5 - (i * 0.08);
            trail.style.left = '0px';
            trail.style.top = '0px';
            document.body.appendChild(trail);
            this.trails.push(trail);
            this.trailPositions.push({ x: 0, y: 0 });
        }

        this.bindEvents();
        this.isActive = true;
        this.animate();
    },

    bindEvents() {
        const updatePosition = (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        };

        document.addEventListener('mousemove', updatePosition, { passive: true });
        document.addEventListener('mousedown', () => this.cursor?.classList.add('click'));
        document.addEventListener('mouseup', () => this.cursor?.classList.remove('click'));

        const hoverElements = document.querySelectorAll('a, button, .btn, .skill-card, .project-card, .work-card, input, textarea');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor?.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.cursor?.classList.remove('hover'));
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.isActive = false;
            } else {
                this.isActive = true;
                this.animate();
            }
        });
    },

    animate() {
        if (!this.isActive || !this.cursor) return;

        this.cursorX += (this.mouseX - this.cursorX) * 0.12;
        this.cursorY += (this.mouseY - this.cursorY) * 0.12;
        this.cursor.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0) translate(-50%, -50%)`;

        for (let i = 0; i < this.trails.length; i++) {
            const targetX = i === 0 ? this.cursorX : this.trailPositions[i - 1].x;
            const targetY = i === 0 ? this.cursorY : this.trailPositions[i - 1].y;
            const ease = 0.25 - (i * 0.04);

            this.trailPositions[i].x += (targetX - this.trailPositions[i].x) * ease;
            this.trailPositions[i].y += (targetY - this.trailPositions[i].y) * ease;

            this.trails[i].style.transform = `translate3d(${this.trailPositions[i].x}px, ${this.trailPositions[i].y}px, 0) translate(-50%, -50%)`;
        }

        this.rafId = requestAnimationFrame(() => this.animate());
    },

    destroy() {
        this.isActive = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.cursor?.remove();
        this.trails.forEach(t => t.remove());
    }
};

const BackgroundParticles = {
    canvas: null,
    ctx: null,
    particles: [],
    rafId: null,
    isActive: true,
    mouse: { x: 0, y: 0 },

    init() {
        if (prefersReducedMotion) return;

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'bg-particles';
        document.body.prepend(this.canvas);

        this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.resize();

        const particleCount = isTouchDevice ? 10 : 20;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
                pulse: Math.random() * Math.PI
            });
        }

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.resize(), 200);
        }, { passive: true });

        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        }, { passive: true });

        document.addEventListener('visibilitychange', () => {
            this.isActive = document.visibilityState === 'visible';
            if (this.isActive && !this.rafId) this.animate();
        });

        this.animate();
    },

    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
    },

    animate() {
        if (!this.isActive) {
            this.rafId = null;
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);

        const time = Date.now() * 0.001;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;

            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                p.vx -= dx * 0.0001;
                p.vy -= dy * 0.0001;
            }

            if (p.x < 0) p.x = this.canvas.width / window.devicePixelRatio;
            if (p.x > this.canvas.width / window.devicePixelRatio) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height / window.devicePixelRatio;
            if (p.y > this.canvas.height / window.devicePixelRatio) p.y = 0;

            const pulseOpacity = p.opacity * (0.7 + 0.3 * Math.sin(time + p.pulse));

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(122, 0, 255, ${pulseOpacity})`;
            this.ctx.fill();

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx2 = p.x - p2.x;
                const dy2 = p.y - p2.y;
                const dist2 = dx2 * dx2 + dy2 * dy2;

                if (dist2 < 8100) {
                    const d = Math.sqrt(dist2);
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(122, 0, 255, ${0.08 * (1 - d / 90)})`;
                    this.ctx.stroke();
                }
            }
        }

        this.rafId = requestAnimationFrame(() => this.animate());
    },

    destroy() {
        this.isActive = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.canvas?.remove();
    }
};

const ScrollProgress = {
    bar: null,

    init() {
        this.bar = document.createElement('div');
        this.bar.className = 'scroll-progress';
        document.body.appendChild(this.bar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollTop / docHeight;
            this.bar.style.transform = `scaleX(${progress})`;
        }, { passive: true });
    }
};

const MagneticButtons = {
    buttons: new Map(),

    init() {
        if (prefersReducedMotion || isTouchDevice) return;

        const buttons = document.querySelectorAll('.btn, .social-link');
        buttons.forEach(btn => {
            btn.classList.add('magnetic');
            this.buttons.set(btn, { x: 0, y: 0, targetX: 0, targetY: 0 });
            this.bindEvents(btn);
        });

        this.animate();
    },

    bindEvents(btn) {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const state = this.buttons.get(btn);
            state.targetX = (e.clientX - rect.left - rect.width / 2) * 0.3;
            state.targetY = (e.clientY - rect.top - rect.height / 2) * 0.3;
        });

        btn.addEventListener('mouseleave', () => {
            const state = this.buttons.get(btn);
            state.targetX = 0;
            state.targetY = 0;
        });
    },

    animate() {
        this.buttons.forEach((state, btn) => {
            state.x += (state.targetX - state.x) * 0.15;
            state.y += (state.targetY - state.y) * 0.15;

            if (Math.abs(state.x) > 0.01 || Math.abs(state.y) > 0.01) {
                btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
            } else {
                btn.style.transform = 'translate3d(0, 0, 0)';
            }
        });

        requestAnimationFrame(() => this.animate());
    }
};

const TiltCards = {
    cards: new Map(),

    init() {
        if (prefersReducedMotion || isTouchDevice) return;

        const cards = document.querySelectorAll('.skill-card, .project-card, .work-card');
        cards.forEach(card => {
            card.classList.add('tilt-card');
            this.cards.set(card, { rotateX: 0, rotateY: 0, targetX: 0, targetY: 0 });
            this.bindEvents(card);
        });

        this.animate();
    },

    bindEvents(card) {
        const updateTilt = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const state = this.cards.get(card);
            state.targetX = ((y - centerY) / centerY) * -8;
            state.targetY = ((x - centerX) / centerX) * 8;
        };

        const resetTilt = () => {
            const state = this.cards.get(card);
            state.targetX = 0;
            state.targetY = 0;
        };

        card.addEventListener('mousemove', updateTilt, { passive: true });
        card.addEventListener('mouseleave', resetTilt);
    },

    animate() {
        this.cards.forEach((state, card) => {
            state.rotateX += (state.targetX - state.rotateX) * 0.1;
            state.rotateY += (state.targetY - state.rotateY) * 0.1;

            if (Math.abs(state.rotateX) > 0.01 || Math.abs(state.rotateY) > 0.01) {
                card.style.transform = `perspective(1000px) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg) translateZ(20px)`;
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            }
        });

        requestAnimationFrame(() => this.animate());
    }
};

const RippleEffect = {
    init() {
        const buttons = document.querySelectorAll('.btn, .nav-link, .mobile-link');
        buttons.forEach(btn => {
            btn.classList.add('ripple');
            btn.addEventListener('click', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';

                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
};

const ParallaxImages = {
    init() {
    }
};

const CardReveal = {
    observer: null,

    init() {
        if (prefersReducedMotion) {
            document.querySelectorAll('.project-card, .skill-card, .work-item').forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'none';
            });
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
        });

        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, i) => {
            card.classList.add('card-reveal');
            card.classList.add(`stagger-${(i % 5) + 1}`);
            this.observer.observe(card);
        });
    }
};

const MicroParallax = {
    elements: [],
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,

    init() {
        if (prefersReducedMotion || isTouchDevice) return;

        this.elements = Array.from(document.querySelectorAll('.section-header, .hero-badge, .bio-experience-badge')).map(el => ({
            element: el,
            x: 0,
            y: 0,
            speed: 0.02 + Math.random() * 0.03
        }));

        if (this.elements.length === 0) return;

        document.addEventListener('mousemove', (e) => {
            this.targetX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
            this.targetY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        }, { passive: true });

        this.animate();
    },

    animate() {
        this.mouseX += (this.targetX - this.mouseX) * 0.1;
        this.mouseY += (this.targetY - this.mouseY) * 0.1;

        this.elements.forEach(item => {
            const offsetX = this.mouseX * item.speed * -30;
            const offsetY = this.mouseY * item.speed * -30;
            item.element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        });

        requestAnimationFrame(() => this.animate());
    }
};

const GlowEffects = {
    init() {
        const sections = document.querySelectorAll('.skills, .bio, .works, .projects, .contact');
        sections.forEach(section => section.classList.add('section-glow'));

        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) heroTitle.classList.add('glow-text');
    }
};

const RevealOnScroll = {
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        const elements = document.querySelectorAll('.section-header, .skill-card, .work-item');
        elements.forEach((el, i) => {
            el.classList.add('reveal-up');
            el.classList.add(`stagger-${(i % 5) + 1}`);
            observer.observe(el);
        });
    }
};

const Navigation = {
    init() {
        const nav = document.getElementById('nav');
        const toggle = document.getElementById('navToggle');
        const mobileMenu = document.getElementById('mobileMenu');

        window.addEventListener('scroll', () => {
            nav?.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });

        toggle?.addEventListener('click', () => {
            toggle.classList.toggle('active');
            mobileMenu?.classList.toggle('active');
        });

        mobileMenu?.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                toggle?.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offset = 80;
                    const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: pos, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Loader.init();
    Navigation.init();

    CustomCursor.init();
    BackgroundParticles.init();
    ScrollProgress.init();
    MagneticButtons.init();
    TiltCards.init();
    RippleEffect.init();
    ParallaxImages.init();
    RevealOnScroll.init();
    CardReveal.init();
    MicroParallax.init();
    GlowEffects.init();

    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.classList.add('hover-lift', 'glow-purple', 'glow-border');
    });
    document.querySelectorAll('.project-card, .skill-card').forEach(card => {
        card.classList.add('hover-lift', 'glow-border');
    });
    document.querySelectorAll('.bio-visual').forEach(el => el.classList.add('float'));
    document.querySelectorAll('.contact-method').forEach(el => el.classList.add('micro-parallax'));

    document.querySelector('.hero-badge')?.classList.add('pulse-glow');
});
