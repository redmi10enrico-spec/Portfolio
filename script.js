const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const isLowEndDevice = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4;

// Utility: Throttle function
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Utility: RAF throttle
const rafThrottle = (callback) => {
    let ticking = false;
    return function(...args) {
        if (!ticking) {
            requestAnimationFrame(() => {
                callback.apply(this, args);
                ticking = false;
            });
            ticking = true;
        }
    };
};

const PerformanceManager = {
    fps: 60,
    frameCount: 0,
    lastTime: performance.now(),
    isPerformanceMode: false,
    heavyEffectsDisabled: false,

    init() {
        if (isLowEndDevice) {
            this.enablePerformanceMode();
        }
        this.monitorFPS();
    },

    monitorFPS() {
        const checkFPS = () => {
            this.frameCount++;
            const currentTime = performance.now();
            const elapsed = currentTime - this.lastTime;

            if (elapsed >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / elapsed);
                this.frameCount = 0;
                this.lastTime = currentTime;

                if (this.fps < 30 && !this.heavyEffectsDisabled) {
                    this.disableHeavyEffects();
                }
            }

            requestAnimationFrame(checkFPS);
        };

        if (!prefersReducedMotion) {
            requestAnimationFrame(checkFPS);
        }
    },

    enablePerformanceMode() {
        this.isPerformanceMode = true;
        document.body.classList.add('performance-mode');
        // Disable complex background
        const bgParticles = document.querySelector('.bg-particles');
        if (bgParticles) bgParticles.style.display = 'none';
    },

    disableHeavyEffects() {
        this.heavyEffectsDisabled = true;
        document.body.classList.add('low-fps-mode');

        // Disable particles
        BackgroundParticles.destroy?.();

        // Disable complex cursor
        CustomCursor.destroy?.();

        // Simplify animations
        document.querySelectorAll('.bg-orb, .bg-gradient-alt').forEach(el => {
            el.style.animation = 'none';
            el.style.opacity = '0.2';
        });
    },

    getQualityLevel() {
        if (this.heavyEffectsDisabled || this.isPerformanceMode) return 'low';
        if (this.fps < 45) return 'medium';
        return 'high';
    }
};
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
    isInViewport: true,
    mouse: { x: 0, y: 0 },
    frameSkip: 0,
    frameCount: 0,

    init() {
        if (prefersReducedMotion || isLowEndDevice) return;

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'bg-particles';
        document.body.prepend(this.canvas);

        this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.resize();

        // Adaptive particle count based on device
        const baseCount = isTouchDevice ? 8 : (PerformanceManager.getQualityLevel?.() === 'high' ? 15 : 10);
        const particleCount = Math.min(baseCount, 15);

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
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

        // Throttled mouse tracking
        document.addEventListener('mousemove', throttle((e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        }, 50), { passive: true });

        // Pause when tab hidden
        document.addEventListener('visibilitychange', () => {
            this.isActive = document.visibilityState === 'visible';
            if (this.isActive && !this.rafId) this.animate();
        });

        // Use IntersectionObserver to pause when not visible
        const observer = new IntersectionObserver((entries) => {
            this.isInViewport = entries[0]?.isIntersecting ?? true;
        }, { threshold: 0 });
        observer.observe(this.canvas);

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
        if (!this.isActive || !this.isInViewport) {
            this.rafId = null;
            return;
        }

        this.frameCount++;
        // Skip frames on lower quality
        const skipRate = PerformanceManager.getQualityLevel?.() === 'low' ? 2 : 1;
        if (this.frameCount % skipRate !== 0) {
            this.rafId = requestAnimationFrame(() => this.animate());
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);

        const time = Date.now() * 0.001;
        const quality = PerformanceManager.getQualityLevel?.() || 'medium';

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;

            // Only calculate mouse interaction on high quality
            if (quality === 'high') {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    p.vx -= dx * 0.0001;
                    p.vy -= dy * 0.0001;
                }
            }

            // Wrap around edges
            const w = this.canvas.width / window.devicePixelRatio;
            const h = this.canvas.height / window.devicePixelRatio;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            const pulseOpacity = p.opacity * (0.7 + 0.3 * Math.sin(time + p.pulse));

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(122, 0, 255, ${pulseOpacity})`;
            this.ctx.fill();

            // Skip connections on low quality or every other frame
            if (quality !== 'low' && i % 2 === 0) {
                for (let j = i + 1; j < this.particles.length; j += 2) {
                    const p2 = this.particles[j];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const dist2 = dx2 * dx2 + dy2 * dy2;

                    if (dist2 < 6400) { // Reduced from 8100
                        const d = Math.sqrt(dist2);
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = `rgba(122, 0, 255, ${0.06 * (1 - d / 80)})`;
                        this.ctx.stroke();
                    }
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
    rafId: null,
    isActive: true,

    init() {
        if (prefersReducedMotion || isTouchDevice || isLowEndDevice) return;

        const buttons = document.querySelectorAll('.btn, .social-link');
        buttons.forEach(btn => {
            btn.classList.add('magnetic');
            this.buttons.set(btn, { x: 0, y: 0, targetX: 0, targetY: 0 });
            this.bindEvents(btn);
        });

        // Pause when tab hidden
        document.addEventListener('visibilitychange', () => {
            this.isActive = document.visibilityState === 'visible';
            if (this.isActive && !this.rafId) this.animate();
        });

        this.animate();
    },

    bindEvents(btn) {
        // Throttled at 60fps
        btn.addEventListener('mousemove', throttle((e) => {
            const rect = btn.getBoundingClientRect();
            const state = this.buttons.get(btn);
            state.targetX = (e.clientX - rect.left - rect.width / 2) * 0.3;
            state.targetY = (e.clientY - rect.top - rect.height / 2) * 0.3;
        }, 16));

        btn.addEventListener('mouseleave', () => {
            const state = this.buttons.get(btn);
            state.targetX = 0;
            state.targetY = 0;
        });
    },

    animate() {
        if (!this.isActive) {
            this.rafId = null;
            return;
        }

        let hasMovement = false;
        this.buttons.forEach((state, btn) => {
            state.x += (state.targetX - state.x) * 0.15;
            state.y += (state.targetY - state.y) * 0.15;

            if (Math.abs(state.x) > 0.01 || Math.abs(state.y) > 0.01) {
                btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
                hasMovement = true;
            } else if (state.x !== 0 || state.y !== 0) {
                btn.style.transform = 'translate3d(0, 0, 0)';
                state.x = 0;
                state.y = 0;
            }
        });

        // Only continue animation if there's movement
        this.rafId = requestAnimationFrame(() => this.animate());
    }
};

const TiltCards = {
    cards: new Map(),
    rafId: null,
    isActive: true,

    init() {
        if (prefersReducedMotion || isTouchDevice) return;

        const cards = document.querySelectorAll('.skill-card, .project-card, .work-card');
        cards.forEach(card => {
            card.classList.add('tilt-card');
            this.cards.set(card, { rotateX: 0, rotateY: 0, targetX: 0, targetY: 0, isHovering: false });
            this.bindEvents(card);
        });

        // Pause when tab hidden
        document.addEventListener('visibilitychange', () => {
            this.isActive = document.visibilityState === 'visible';
            if (this.isActive && !this.rafId) this.animate();
        });

        this.animate();
    },

    bindEvents(card) {
        const state = this.cards.get(card);

        // Throttled tilt update
        card.addEventListener('mousemove', throttle((e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            state.targetX = ((y - centerY) / centerY) * -8;
            state.targetY = ((x - centerX) / centerX) * 8;
            state.isHovering = true;
        }, 16));

        card.addEventListener('mouseleave', () => {
            state.targetX = 0;
            state.targetY = 0;
            state.isHovering = false;
        });

        card.addEventListener('mouseenter', () => {
            state.isHovering = true;
        });
    },

    animate() {
        if (!this.isActive) {
            this.rafId = null;
            return;
        }

        this.cards.forEach((state, card) => {
            state.rotateX += (state.targetX - state.rotateX) * 0.15;
            state.rotateY += (state.targetY - state.rotateY) * 0.15;

            const absX = Math.abs(state.rotateX);
            const absY = Math.abs(state.rotateY);

            if (absX > 0.01 || absY > 0.01 || state.isHovering) {
                card.style.setProperty('--tilt-x', `${state.rotateX}deg`);
                card.style.setProperty('--tilt-y', `${state.rotateY}deg`);
                card.classList.add('tilting');
            } else {
                card.classList.remove('tilting');
                state.rotateX = 0;
                state.rotateY = 0;
            }
        });

        this.rafId = requestAnimationFrame(() => this.animate());
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
    rafId: null,

    init() {
        if (prefersReducedMotion || isTouchDevice || isLowEndDevice) return;

        this.elements = Array.from(document.querySelectorAll('.section-header, .hero-badge, .bio-experience-badge')).map(el => ({
            element: el,
            x: 0,
            y: 0,
            speed: 0.02 + Math.random() * 0.03
        }));

        if (this.elements.length === 0) return;

        // Throttled mouse tracking - 60fps max
        document.addEventListener('mousemove', throttle((e) => {
            this.targetX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
            this.targetY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        }, 16), { passive: true });

        this.animate();
    },

    animate() {
        // Skip frames if tab not visible
        if (document.hidden) {
            this.rafId = requestAnimationFrame(() => this.animate());
            return;
        }

        this.mouseX += (this.targetX - this.mouseX) * 0.1;
        this.mouseY += (this.targetY - this.mouseY) * 0.1;

        // Batch DOM updates
        const transforms = this.elements.map(item => ({
            el: item.element,
            transform: `translate3d(${this.mouseX * item.speed * -30}px, ${this.mouseY * item.speed * -30}px, 0)`
        }));

        transforms.forEach(({ el, transform }) => {
            el.style.transform = transform;
        });

        this.rafId = requestAnimationFrame(() => this.animate());
    },

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
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

// Counter Animation
const CounterAnimation = {
    init() {
        const counters = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    animateCounter(element) {
        const text = element.textContent;
        const num = parseInt(text);
        const suffix = text.replace(/[0-9]/g, '');
        const duration = 1500;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(num * easeProgress);
            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }
};

// Spotlight Effect
const SpotlightEffect = {
    init() {
        if (isTouchDevice || prefersReducedMotion) return;

        const elements = document.querySelectorAll('.project-card, .skill-card, .work-card');
        elements.forEach(el => {
            el.classList.add('spotlight');
            el.addEventListener('mousemove', throttle((e) => {
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--x', `${x}%`);
                el.style.setProperty('--y', `${y}%`);
            }, 16));
        });
    }
};

// Magnetic Text Effect
const MagneticText = {
    init() {
        if (isTouchDevice || prefersReducedMotion) return;

        const titles = document.querySelectorAll('.project-title, .skill-name');
        titles.forEach(title => {
            title.classList.add('magnetic-text');
            title.addEventListener('mousemove', throttle((e) => {
                const rect = title.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.1;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.1;
                title.style.transform = `translate(${x}px, ${y}px)`;
            }, 16));

            title.addEventListener('mouseleave', () => {
                title.style.transform = 'translate(0, 0)';
            });
        });
    }
};

// Staggered Reveal for Lists
const StaggeredReveal = {
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.project-card, .skill-card, .work-item');
                    items.forEach((item, i) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, i * 100);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.projects-grid, .skills-grid, .works-timeline').forEach(grid => {
            grid.classList.add('stagger-container');
            observer.observe(grid);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    PerformanceManager.init();
    Loader.init();
    Navigation.init();

    // Heavy effects only if not low-end
    if (!isLowEndDevice) {
        CustomCursor.init();
        BackgroundParticles.init();
        MagneticButtons.init();
        MicroParallax.init();
        SpotlightEffect.init();
        MagneticText.init();
    }

    // Tilt effect always enabled (unless touch/reduced motion)
    TiltCards.init();

    ScrollProgress.init();
    RippleEffect.init();
    ParallaxImages.init();
    RevealOnScroll.init();
    CardReveal.init();
    GlowEffects.init();
    CounterAnimation.init();
    StaggeredReveal.init();

    // Apply animation classes
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.classList.add('hover-lift', 'glow-purple', 'glow-border', 'shake-hover');
    });

    document.querySelectorAll('.project-card, .skill-card').forEach((card, i) => {
        card.classList.add('hover-lift', 'glow-border', 'border-rotate');
        card.classList.add(`stagger-${(i % 5) + 1}`);
    });

    document.querySelectorAll('.bio-visual').forEach(el => el.classList.add('float'));
    document.querySelectorAll('.contact-method').forEach(el => el.classList.add('micro-parallax', 'glow-pulse-scale'));
    document.querySelectorAll('.stat-item').forEach(el => el.classList.add('bounce-in'));
    document.querySelectorAll('.section-title').forEach(el => el.classList.add('slide-left'));
    document.querySelectorAll('.section-subtitle').forEach(el => el.classList.add('slide-right'));

    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) {
        heroBadge.classList.add('pulse-glow', 'float-icon');
    }

    // Hero typing effect simulation
    const heroTitle = document.querySelector('.title-highlight');
    if (heroTitle && !prefersReducedMotion) {
        heroTitle.classList.add('typing-text');
        setTimeout(() => heroTitle.classList.remove('typing-text'), 3000);
    }

    // Safety timeout: force all animated elements visible after 4 seconds
    setTimeout(() => {
        document.querySelectorAll('.reveal-up:not(.visible), .bounce-in:not(.visible), .slide-left:not(.visible), .slide-right:not(.visible), .rotate-in:not(.visible), .project-card:not(.visible), .skill-card:not(.visible), .work-item:not(.visible)').forEach(el => {
            el.classList.add('visible');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }, 4000);
});
