(function() {
    'use strict';

    const CONFIG = {
        particles: {
            mobile: 25,
            desktop: 50,
            animationDuration: { min: 3, max: 6 }
        },
        debounce: {
            resize: 250,
            scroll: 16
        },
        animations: {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        },
        iframe: {
            timeout: 5000
        }
    };

    const utils = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        getRandomBetween(min, max) {
            return Math.random() * (max - min) + min;
        },

        isMobile() {
            return window.innerWidth < 768;
        },

        prefersReducedMotion() {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
    };

    const particlesSystem = {
        container: null,
        particles: [],

        init() {
            this.container = document.getElementById('particles');
            if (!this.container) return;
            
            this.create();
            this.setupResizeHandler();
        },

        create() {
            if (!this.container) return;
            
            const particleCount = utils.isMobile() ? 
                CONFIG.particles.mobile : 
                CONFIG.particles.desktop;

            this.container.innerHTML = '';
            this.particles = [];

            if (utils.prefersReducedMotion()) return;

            for (let i = 0; i < particleCount; i++) {
                this.createParticle();
            }
        },

        createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = utils.getRandomBetween(
                CONFIG.particles.animationDuration.min,
                CONFIG.particles.animationDuration.max
            ) + 's';
            
            this.container.appendChild(particle);
            this.particles.push(particle);
        },

        setupResizeHandler() {
            const handleResize = utils.debounce(() => {
                const expectedCount = utils.isMobile() ? 
                    CONFIG.particles.mobile : 
                    CONFIG.particles.desktop;
                
                if (this.particles.length !== expectedCount) {
                    this.create();
                }
            }, CONFIG.debounce.resize);

            window.addEventListener('resize', handleResize, { passive: true });
        },

        destroy() {
            if (this.container) {
                this.container.innerHTML = '';
            }
            this.particles = [];
        }
    };

    const progressBar = {
        element: null,
        ticking: false,

        init() {
            this.element = document.getElementById('progressBar');
            if (!this.element) return;

            this.setupScrollHandler();
            this.update(); 
        },

        update() {
            if (!this.element || this.ticking) return;

            this.ticking = true;
            requestAnimationFrame(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const docHeight = document.body.scrollHeight - window.innerHeight;
                const scrollPercent = docHeight > 0 ? 
                    Math.min((scrollTop / docHeight) * 100, 100) : 0;
                
                this.element.style.width = scrollPercent + '%';
                this.ticking = false;
            });
        },

        setupScrollHandler() {
            const throttledUpdate = utils.throttle(() => {
                this.update();
            }, CONFIG.debounce.scroll);

            window.addEventListener('scroll', throttledUpdate, { passive: true });
        }
    };

    const animations = {
        observer: null,
        elements: [],

        init() {
            this.elements = document.querySelectorAll('.fade-in');
            if (this.elements.length === 0) return;

            if ('IntersectionObserver' in window && !utils.prefersReducedMotion()) {
                this.setupIntersectionObserver();
            } else {
                this.showAllElements();
            }
        },

        setupIntersectionObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.showElement(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: CONFIG.animations.threshold,
                rootMargin: CONFIG.animations.rootMargin
            });

            this.elements.forEach(el => {
                this.observer.observe(el);
            });
        },

        showElement(element) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        },

        showAllElements() {
            this.elements.forEach(el => {
                this.showElement(el);
            });
        },

        destroy() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
        }
    };

    const iframeHandler = {
        iframes: [],

        init() {
            this.iframes = document.querySelectorAll('.playlist-embed');
            if (this.iframes.length === 0) return;

            this.setupErrorHandling();
        },

        setupErrorHandling() {
            this.iframes.forEach((iframe, index) => {
                iframe.addEventListener('error', () => {
                    this.showFallback(iframe, index);
                });

                iframe.addEventListener('load', () => {
                    this.handleIframeLoad(iframe, index);
                });

                setTimeout(() => {
                    this.checkIframeStatus(iframe, index);
                }, CONFIG.iframe.timeout);
            });
        },

        showFallback(iframe, index) {
            const fallback = iframe.parentElement.querySelector('.embed-fallback');
            if (fallback) {
                iframe.style.display = 'none';
                fallback.classList.add('show');
                console.log(`Showing fallback for playlist ${index + 1}`);
            }
        },

        handleIframeLoad(iframe, index) {
            console.log(`Playlist ${index + 1} loaded successfully`);
        },

        checkIframeStatus(iframe, index) {
            try {
                if (iframe.style.display === 'none') return;
                
                console.log(`Playlist ${index + 1} status check completed`);
            } catch (e) {
            }
        }
    };

    const motionHandler = {
        init() {
            this.handleReducedMotion();
            this.setupMediaQueryListener();
        },

        handleReducedMotion() {
            if (utils.prefersReducedMotion()) {
                this.disableAnimations();
            }
        },

        disableAnimations() {
            const particles = document.querySelectorAll('.particle');
            particles.forEach(particle => {
                particle.style.animation = 'none';
            });

            const fadeElements = document.querySelectorAll('.fade-in');
            fadeElements.forEach(el => {
                el.style.animation = 'none';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        },

        setupMediaQueryListener() {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            
            const handleChange = (e) => {
                if (e.matches) {
                    this.disableAnimations();
                } else {
                    window.location.reload();
                }
            };

            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleChange);
            } else {
                mediaQuery.addListener(handleChange);
            }
        }
    };

    const accessibility = {
        init() {
            this.setupKeyboardNavigation();
            this.setupFocusManagement();
            this.setupARIAEnhancements();
        },

        setupKeyboardNavigation() {
            const interactiveElements = document.querySelectorAll('.playlist-card, .back-home, .social-link');
            
            interactiveElements.forEach(element => {
                if (!element.hasAttribute('tabindex')) {
                    element.setAttribute('tabindex', '0');
                }

                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        element.click();
                    }
                });
            });
        },

        setupFocusManagement() {
            const focusableElements = document.querySelectorAll('a, button, iframe, [tabindex]:not([tabindex="-1"])');
            
            focusableElements.forEach(element => {
                element.addEventListener('focus', () => {
                    element.setAttribute('data-focused', 'true');
                });

                element.addEventListener('blur', () => {
                    element.removeAttribute('data-focused');
                });
            });
        },

        setupARIAEnhancements() {
            const main = document.querySelector('main');
            if (main && !main.hasAttribute('aria-live')) {
                main.setAttribute('aria-live', 'polite');
            }

            const iframes = document.querySelectorAll('iframe');
            iframes.forEach((iframe, index) => {
                if (!iframe.hasAttribute('title')) {
                    iframe.setAttribute('title', `Spotify Playlist ${index + 1}`);
                }
            });
        }
    };

    const performance = {
        metrics: {
            loadStart: 0,
            loadEnd: 0,
            initStart: 0,
            initEnd: 0
        },

        init() {
            this.metrics.initStart = Date.now();
            this.setupPerformanceObserver();
        },

        setupPerformanceObserver() {
            if ('PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        entries.forEach(entry => {
                            if (entry.entryType === 'navigation') {
                                this.metrics.loadStart = entry.loadEventStart;
                                this.metrics.loadEnd = entry.loadEventEnd;
                            }
                        });
                    });
                    
                    observer.observe({ entryTypes: ['navigation'] });
                } catch (e) {
                    console.log('Performance observer not supported');
                }
            }
        },

        complete() {
            this.metrics.initEnd = Date.now();
            const initTime = this.metrics.initEnd - this.metrics.initStart;
            console.log(`App initialized in ${initTime}ms`);
        }
    };

    const errorHandler = {
        init() {
            this.setupGlobalErrorHandler();
            this.setupUnhandledRejectionHandler();
        },

        setupGlobalErrorHandler() {
            window.addEventListener('error', (event) => {
                console.error('Global error:', event.error);
                this.handleError(event.error, 'Global Error');
            });
        },

        setupUnhandledRejectionHandler() {
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
                this.handleError(event.reason, 'Unhandled Promise Rejection');
                event.preventDefault();
            });
        },

        handleError(error, context) {
            try {
                const fadeElements = document.querySelectorAll('.fade-in');
                fadeElements.forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });

                const particlesContainer = document.getElementById('particles');
                if (particlesContainer && error.message && error.message.includes('particle')) {
                    particlesContainer.style.display = 'none';
                }
            } catch (e) {
                console.error('Error in error handler:', e);
            }
        }
    };

    const app = {
        modules: [
            errorHandler,
            performance,
            motionHandler,
            particlesSystem,
            progressBar,
            animations,
            iframeHandler,
            accessibility
        ],

        init() {
            try {
                console.log('Initializing Spotify Playlists page...');
                
                this.modules.forEach(module => {
                    try {
                        module.init();
                    } catch (error) {
                        console.error(`Error initializing ${module.constructor.name}:`, error);
                    }
                });

                this.setupSmoothScrolling();
                
                performance.complete();
                console.log('Spotify Playlists page initialized successfully');
                
            } catch (error) {
                console.error('Critical error during app initialization:', error);
                errorHandler.handleError(error, 'App Initialization');
            }
        },

        setupSmoothScrolling() {
            if (CSS.supports('scroll-behavior', 'smooth')) {
                document.documentElement.style.scrollBehavior = 'smooth';
            }
        },

        destroy() {
            try {
                animations.destroy();
                particlesSystem.destroy();
                
                window.removeEventListener('scroll', progressBar.update);
                window.removeEventListener('resize', particlesSystem.setupResizeHandler);
                
                console.log('App destroyed successfully');
            } catch (error) {
                console.error('Error during app destruction:', error);
            }
        }
    };

    function initializeWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                app.init();
            });
        } else {
            app.init();
        }
    }

    initializeWhenReady();

    if (typeof window !== 'undefined') {
        window.SpotifyPlaylistsApp = app;
    }

})();
