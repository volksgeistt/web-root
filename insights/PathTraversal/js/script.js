function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        particlesContainer.appendChild(particle);
    }
}

function updateProgressBar() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

let ticking = false;
function optimizedScroll() {
    if (!ticking) {
        requestAnimationFrame(updateProgressBar);
        ticking = true;
        setTimeout(() => {
            ticking = false;
        }, 16);
    }
}

function initCodeCopyFeature() {
    const codeBlocks = document.querySelectorAll('.code-block');
    
    codeBlocks.forEach(block => {
        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.className = 'copy-btn';
        copyBtn.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 4rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 6px 10px;
            color: #888;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
            z-index: 10;
        `;
        
        copyBtn.addEventListener('click', async () => {
            const code = block.querySelector('code').textContent;
            try {
                await navigator.clipboard.writeText(code);
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.style.color = '#8b5cf6';
                copyBtn.style.background = 'rgba(139, 92, 246, 0.2)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    copyBtn.style.color = '#888';
                    copyBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                }, 2000);
            } catch (err) {
                copyBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
                copyBtn.style.color = '#ef4444';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    copyBtn.style.color = '#888';
                }, 2000);
            }
        });
        
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.background = 'rgba(139, 92, 246, 0.2)';
            copyBtn.style.color = '#8b5cf6';
        });
        
        copyBtn.addEventListener('mouseleave', () => {
            if (!copyBtn.textContent.includes('Copied')) {
                copyBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                copyBtn.style.color = '#888';
            }
        });
        
        block.appendChild(copyBtn);
    });
}

function calculateReadingTime() {
    const article = document.querySelector('.article-content');
    if (!article) return;
    
    const text = article.textContent || article.innerText || '';
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / wordsPerMinute);
    
    const timeElement = document.querySelector('.article-meta .fa-clock').parentElement;
    if (timeElement) {
        timeElement.innerHTML = `<i class="fas fa-clock"></i>${readingTime} min read`;
    }
}

function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const backBtn = document.querySelector('.back-home');
            if (backBtn) {
                backBtn.focus();
            }
        }
        
        if (e.altKey && e.key === 'Home') {
            e.preventDefault();
            const backBtn = document.querySelector('.back-home');
            if (backBtn) {
                backBtn.click();
            }
        }
    });
}

function initEnhancedScrollAnimations() {
    const sections = document.querySelectorAll('.section-title, .highlight-box, .warning-box, .code-block');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                if (entry.target.classList.contains('code-block')) {
                    entry.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                    setTimeout(() => {
                        entry.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                    }, 1000);
                }
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        scrollObserver.observe(section);
    });
}

function initMobileEnhancements() {
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', e => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 100;
        const diff = touchStartY - touchEndY;
        
        if (diff > swipeThreshold && window.pageYOffset < 100) {
            updateProgressBar();
        }
    }
}

function initPerformanceMonitoring() {
    let scrollCount = 0;
    let lastScrollTime = performance.now();
    
    window.addEventListener('scroll', () => {
        scrollCount++;
        const now = performance.now();
        
        if (now - lastScrollTime > 1000) {
            if (scrollCount > 60) {
                const particles = document.querySelectorAll('.particle');
                particles.forEach((particle, index) => {
                    if (index % 2 === 0) {
                        particle.style.display = 'none';
                    }
                });
            }
            scrollCount = 0;
            lastScrollTime = now;
        }
    }, { passive: true });
}

document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initAnimations();
    initSmoothScrolling();
    calculateReadingTime();
    
    initCodeCopyFeature();
    initKeyboardNavigation();
    initEnhancedScrollAnimations();
    initMobileEnhancements();
    initPerformanceMonitoring();
    
    window.addEventListener('scroll', optimizedScroll, { passive: true });
    
    window.addEventListener('resize', function() {
        const particlesContainer = document.getElementById('particles');
        particlesContainer.innerHTML = '';
        createParticles();
    });
    
    document.querySelector('.back-home').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.href) {
            window.location.href = e.target.href;
        }
    });
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.querySelectorAll('.particle').forEach(particle => {
            particle.style.animationPlayState = 'paused';
        });
    } else {
        document.querySelectorAll('.particle').forEach(particle => {
            particle.style.animationPlayState = 'running';
        });
    }
});

window.addEventListener('error', function(e) {
    console.warn('Non-critical error handled:', e.message);
}, true);

function preloadCriticalResources() {
    const criticalImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    criticalImages.forEach(img => imageObserver.observe(img));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalResources);
} else {
    preloadCriticalResources();
}
