/**
 * PORTFOLIO - FULL STACK DEVELOPER
 * Advanced JavaScript with GSAP & Three.js
 */

// ============================================
// LOADER
// ============================================
const Loader = {
    element: null,
    progress: null,
    percentage: null,
    
    init() {
        this.element = document.getElementById('loader');
        this.progress = this.element.querySelector('.loader-progress');
        this.percentage = this.element.querySelector('.loader-percentage');
        
        document.body.classList.add('loading');
        
        this.simulateLoading();
    },
    
    simulateLoading() {
        let progress = 0;
        const duration = 2000;
        const interval = 20;
        const steps = duration / interval;
        const increment = 100 / steps;
        
        const timer = setInterval(() => {
            progress += increment;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(timer);
                this.hide();
            }
            
            this.update(progress);
        }, interval);
    },
    
    update(value) {
        this.progress.style.width = `${value}%`;
        this.percentage.textContent = `${Math.round(value)}%`;
    },
    
    hide() {
        setTimeout(() => {
            this.element.classList.add('hidden');
            document.body.classList.remove('loading');
            
            setTimeout(() => {
                this.element.style.display = 'none';
                Animations.init();
            }, 500);
        }, 500);
    }
};

// ============================================
// CUSTOM CURSOR
// ============================================
const CustomCursor = {
    follower: null,
    dot: null,
    mouseX: 0,
    mouseY: 0,
    followerX: 0,
    followerY: 0,
    
    init() {
        this.follower = document.querySelector('.cursor-follower');
        this.dot = document.querySelector('.cursor-dot');
        
        if (window.matchMedia('(pointer: coarse)').matches) return;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            this.dot.style.left = `${this.mouseX}px`;
            this.dot.style.top = `${this.mouseY}px`;
            this.dot.style.opacity = '1';
            this.follower.style.opacity = '1';
        });
        
        document.addEventListener('mouseleave', () => {
            this.dot.style.opacity = '0';
            this.follower.style.opacity = '0';
        });
        
        this.animate();
        this.addHoverEffects();
    },
    
    animate() {
        this.followerX += (this.mouseX - this.followerX) * 0.1;
        this.followerY += (this.mouseY - this.followerY) * 0.1;
        
        this.follower.style.left = `${this.followerX}px`;
        this.follower.style.top = `${this.followerY}px`;
        
        requestAnimationFrame(() => this.animate());
    },
    
    addHoverEffects() {
        const interactiveElements = document.querySelectorAll(
            'a, button, .btn, .skill-card, .work-card, .project-card, .contact-method, .social-link'
        );
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.follower.classList.add('active');
            });
            
            el.addEventListener('mouseleave', () => {
                this.follower.classList.remove('active');
            });
        });
    }
};

// ============================================
// NAVIGATION
// ============================================
const Navigation = {
    nav: null,
    toggle: null,
    mobileMenu: null,
    
    init() {
        this.nav = document.getElementById('nav');
        this.toggle = document.getElementById('navToggle');
        this.mobileMenu = document.getElementById('mobileMenu');
        
        this.handleScroll();
        this.handleMobileMenu();
        this.handleSmoothScroll();
    },
    
    handleScroll() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                this.nav.classList.add('scrolled');
            } else {
                this.nav.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    },
    
    handleMobileMenu() {
        this.toggle.addEventListener('click', () => {
            this.toggle.classList.toggle('active');
            this.mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        const mobileLinks = this.mobileMenu.querySelectorAll('.mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.toggle.classList.remove('active');
                this.mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    },
    
    handleSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offset = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// ============================================
// THREE.JS BACKGROUND
// ============================================
const ThreeBackground = {
    scene: null,
    camera: null,
    renderer: null,
    particles: null,
    container: null,
    mouseX: 0,
    mouseY: 0,
    
    init() {
        this.container = document.getElementById('heroBg');
        if (!this.container) return;
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 30;
        
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        this.createParticles();
        this.addMouseInteraction();
        this.animate();
        this.handleResize();
    },
    
    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            
            // Purple and white colors
            const isPurple = Math.random() > 0.6;
            colors[i * 3] = isPurple ? 0.48 : 1;
            colors[i * 3 + 1] = isPurple ? 0 : 1;
            colors[i * 3 + 2] = isPurple ? 1 : 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        
        // Add connection lines
        this.createConnectionLines();
    },
    
    createConnectionLines() {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x7A00FF,
            transparent: true,
            opacity: 0.1
        });
        
        const lineGeometry = new THREE.BufferGeometry();
        this.connections = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.connections);
    },
    
    addMouseInteraction() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });
    },
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.particles) {
            this.particles.rotation.x += 0.0005;
            this.particles.rotation.y += 0.0005;
            
            // Mouse interaction
            this.particles.rotation.x += this.mouseY * 0.0005;
            this.particles.rotation.y += this.mouseX * 0.0005;
        }
        
        this.renderer.render(this.scene, this.camera);
    },
    
    handleResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
};

// ============================================
// GSAP ANIMATIONS
// ============================================
const Animations = {
    init() {
        gsap.registerPlugin(ScrollTrigger);
        
        this.initHeroAnimations();
        this.initScrollAnimations();
        this.initSkillBars();
        this.initCounterAnimation();
        this.initTiltEffect();
        this.initTransitionWords();
        this.initProjectFilter();
    },
    
    initHeroAnimations() {
        // Hero badge
        gsap.from('.hero-badge', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            delay: 0.2,
            ease: 'power3.out',
            clearProps: 'opacity,transform'
        });
        
        // Hero title
        gsap.from('.title-line', {
            opacity: 0,
            y: 60,
            duration: 1,
            stagger: 0.15,
            delay: 0.4,
            ease: 'power3.out',
            clearProps: 'opacity,transform'
        });
        
        // Hero subtitle
        gsap.from('.hero-subtitle', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: 0.8,
            ease: 'power3.out',
            clearProps: 'opacity,transform'
        });
        
        // Hero CTA
        gsap.from('.hero-cta', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: 1,
            ease: 'power3.out',
            clearProps: 'opacity,transform'
        });
        
        // Hero stats
        gsap.from('.stat-item', {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.1,
            delay: 1.2,
            ease: 'power3.out',
            clearProps: 'opacity,transform'
        });
        
        // Scroll indicator
        gsap.from('.hero-scroll-indicator', {
            opacity: 0,
            duration: 0.8,
            delay: 1.5,
            ease: 'power3.out',
            clearProps: 'opacity'
        });
    },
    
    initScrollAnimations() {
        // Reveal animations for sections
        const revealElements = document.querySelectorAll('[data-reveal]');
        
        revealElements.forEach((el, index) => {
            gsap.fromTo(el, 
                {
                    opacity: 0,
                    y: 40
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    clearProps: 'opacity,transform',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
        
        // Parallax effect for hero - solo traslazione, no fade out
        gsap.to('.hero-content', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: 50
        });
        
        // Transition shape animation
        gsap.to('.transition-shape', {
            scrollTrigger: {
                trigger: '.scroll-transition',
                start: 'top center',
                end: 'bottom center',
                scrub: true
            },
            rotation: 360,
            scale: 1.5
        });
    },
    
    initSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        skillBars.forEach(bar => {
            const width = bar.dataset.width;
            
            gsap.fromTo(bar,
                { width: 0 },
                {
                    width: `${width}%`,
                    duration: 1.5,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: bar,
                        start: 'top 85%'
                    }
                }
            );
        });
    },
    
    initCounterAnimation() {
        const counters = document.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            
            ScrollTrigger.create({
                trigger: counter,
                start: 'top 85%',
                onEnter: () => {
                    gsap.to(counter, {
                        innerHTML: target,
                        duration: 2,
                        ease: 'power3.out',
                        snap: { innerHTML: 1 },
                        onUpdate: function() {
                            counter.innerHTML = Math.round(this.targets()[0].innerHTML);
                        }
                    });
                },
                once: true
            });
        });
    },
    
    initTiltEffect() {
        const tiltElements = document.querySelectorAll('[data-tilt]');
        
        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    },
    
    initTransitionWords() {
        const words = document.querySelectorAll('.transition-word');
        
        words.forEach((word, index) => {
            ScrollTrigger.create({
                trigger: word,
                start: 'top 70%',
                onEnter: () => {
                    gsap.to(word, {
                        color: index % 2 === 0 ? '#7A00FF' : '#FFFFFF',
                        textShadow: index % 2 === 0 ? '0 0 20px rgba(122, 0, 255, 0.5)' : 'none',
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                },
                onLeaveBack: () => {
                    gsap.to(word, {
                        color: '#6A6A6A',
                        textShadow: 'none',
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                }
            });
        });
    },
    
    initProjectFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                
                // Filter projects with animation
                projectCards.forEach(card => {
                    const category = card.dataset.category;
                    
                    if (filter === 'all' || category === filter) {
                        gsap.to(card, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.4,
                            ease: 'power2.out',
                            display: 'block'
                        });
                    } else {
                        gsap.to(card, {
                            opacity: 0,
                            scale: 0.8,
                            duration: 0.4,
                            ease: 'power2.out',
                            onComplete: () => {
                                card.style.display = 'none';
                            }
                        });
                    }
                });
            });
        });
    }
};

// ============================================
// PARTICLES EFFECT
// ============================================
const ParticlesEffect = {
    canvas: null,
    ctx: null,
    particles: [],
    mouseX: 0,
    mouseY: 0,
    
    init() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        container.appendChild(this.canvas);
        
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        }, { passive: true });
    },
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    createParticles() {
        const count = 50;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    },
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Mouse interaction
            const dx = this.mouseX - p.x;
            const dy = this.mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 150) {
                p.x -= dx * 0.01;
                p.y -= dy * 0.01;
            }
            
            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            // Draw
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(122, 0, 255, ${p.opacity})`;
            this.ctx.fill();
        });
        
        // Draw connections
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(122, 0, 255, ${0.1 * (1 - dist / 100)})`;
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
};

// ============================================
// MAGNETIC BUTTONS
// ============================================
const MagneticButtons = {
    init() {
        const buttons = document.querySelectorAll('.btn, .social-link');
        
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }
};

// ============================================
// TEXT SCRAMBLE EFFECT
// ============================================
const TextScramble = {
    init() {
        const elements = document.querySelectorAll('[data-scramble]');
        
        elements.forEach(el => {
            const originalText = el.textContent;
            const chars = '!<>-_\\/[]{}—=+*^?#________';
            
            el.addEventListener('mouseenter', () => {
                let iteration = 0;
                const interval = setInterval(() => {
                    el.textContent = originalText
                        .split('')
                        .map((char, index) => {
                            if (index < iteration) {
                                return originalText[index];
                            }
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join('');
                    
                    if (iteration >= originalText.length) {
                        clearInterval(interval);
                    }
                    
                    iteration += 1 / 3;
                }, 30);
            });
        });
    }
};

// ============================================
// WORK TIMELINE ANIMATION
// ============================================
const TimelineAnimation = {
    init() {
        const timeline = document.querySelector('.works-timeline');
        if (!timeline) return;
        
        const line = timeline.querySelector('.timeline-line');
        const items = timeline.querySelectorAll('.work-item');
        
        gsap.from(line, {
            scaleY: 0,
            transformOrigin: 'top',
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: timeline,
                start: 'top 70%'
            }
        });
        
        items.forEach((item, index) => {
            const marker = item.querySelector('.work-marker');
            const card = item.querySelector('.work-card');
            
            gsap.from(marker, {
                scale: 0,
                duration: 0.5,
                delay: index * 0.2,
                ease: 'back.out(2)',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%'
                }
            });
            
            gsap.from(card, {
                x: 50,
                opacity: 0,
                duration: 0.8,
                delay: index * 0.2 + 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%'
                }
            });
        });
    }
};

// ============================================
// SMOOTH SCROLL
// ============================================
const SmoothScroll = {
    init() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    }
};

// ============================================
// IMAGE REVEAL ANIMATION
// ============================================
const ImageReveal = {
    init() {
        const images = document.querySelectorAll('.img-reveal');
        
        images.forEach(img => {
            ScrollTrigger.create({
                trigger: img,
                start: 'top 85%',
                onEnter: () => {
                    img.classList.add('revealed');
                }
            });
        });
    }
};

// ============================================
// PARALLAX EFFECTS
// ============================================
const ParallaxEffects = {
    init() {
        // Parallax for bio image
        gsap.to('.bio-image-real img', {
            scrollTrigger: {
                trigger: '.bio',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            },
            y: -50
        });
        
        // Parallax for project images
        const projectImages = document.querySelectorAll('.project-image-real img');
        projectImages.forEach(img => {
            gsap.to(img, {
                scrollTrigger: {
                    trigger: img.closest('.project-card'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                y: -30
            });
        });
        
        // Floating elements animation
        gsap.utils.toArray('.float-element').forEach((el, i) => {
            gsap.to(el, {
                y: -20,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 0.2
            });
        });
    }
};

// ============================================
// CINEMATIC ZOOM ON SCROLL
// ============================================
const CinematicZoom = {
    init() {
        // Zoom effect for section headers - NO OPACITY CHANGE
        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    end: 'top 60%',
                    scrub: true
                },
                scale: 0.95,
                y: 30
                // NO opacity - non deve mai scomparire
            });
        });
    }
};

// ============================================
// TECH GRID ANIMATION
// ============================================
const TechGridAnimation = {
    init() {
        const techGrids = document.querySelectorAll('.tech-grid');
        
        techGrids.forEach(grid => {
            gsap.to(grid, {
                scrollTrigger: {
                    trigger: grid.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                backgroundPosition: '50px 50px'
            });
        });
    }
};

// ============================================
// NEON PULSE ANIMATION - DISABILITATO
// ============================================
const NeonPulse = {
    init() {
        // DISABILITATO: Questa animazione causava opacity ridotta
        // su elementi di testo, facendoli scomparire.
        // Se necessario, applicare solo a elementi decorativi specifici.
        
        // gsap.to('.neon-glow, .neon-text', {
        //     opacity: 0.7,
        //     duration: 0.1,
        //     repeat: -1,
        //     yoyo: true,
        //     ease: 'steps(2)',
        //     stagger: { each: 0.1, from: 'random' }
        // });
    }
};

// ============================================
// SCROLL VELOCITY EFFECT
// ============================================
const ScrollVelocity = {
    lastScrollTop: 0,
    velocity: 0,
    
    init() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.calculateVelocity();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    },
    
    calculateVelocity() {
        const st = window.pageYOffset;
        this.velocity = st - this.lastScrollTop;
        this.lastScrollTop = st;
        
        // Apply subtle scale effect based on velocity (no skew)
        const scaleAmount = 1 - Math.min(Math.abs(this.velocity) * 0.001, 0.02);
        
        gsap.to('.hero-content', {
            scale: scaleAmount,
            duration: 0.3,
            ease: 'power2.out'
        });
    }
};

// ============================================
// SAFETY CHECK - Fix any remaining opacity issues
// ============================================
const SafetyCheck = {
    init() {
        // Dopo 3 secondi, assicurati che tutti gli elementi siano visibili
        setTimeout(() => {
            const elements = document.querySelectorAll('[data-reveal], .title-line, .hero-badge, .hero-subtitle, .hero-cta, .stat-item, .section-header');
            elements.forEach(el => {
                // Forza opacity a 1 se GSAP ha lasciato stili inline
                if (el.style.opacity === '0' || el.style.opacity === '') {
                    gsap.set(el, { opacity: 1, clearProps: 'opacity,transform' });
                }
            });
            console.log('SafetyCheck: Elementi verificati e corretti');
        }, 3000);
    }
};

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Start loader
    Loader.init();
    
    // Initialize other components after load
    setTimeout(() => {
        CustomCursor.init();
        Navigation.init();
        ThreeBackground.init();
        ParticlesEffect.init();
        MagneticButtons.init();
        TextScramble.init();
        TimelineAnimation.init();
        SmoothScroll.init();
        ImageReveal.init();
        ParallaxEffects.init();
        CinematicZoom.init();
        TechGridAnimation.init();
        NeonPulse.init();
        ScrollVelocity.init();
        SafetyCheck.init();
    }, 100);
});

// Re-initialize icons after dynamic content changes
window.addEventListener('load', () => {
    lucide.createIcons();
});
