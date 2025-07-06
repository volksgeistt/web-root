        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 8 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 5) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        function updateProgressBar() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                btn.style.background = 'rgba(139, 92, 246, 0.3)';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = 'rgba(255, 255, 255, 0.1)';
                }, 2000);
            });
        }

        function addCopyButtons() {
            const codeBlocks = document.querySelectorAll('.code-block');
            codeBlocks.forEach(block => {   
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.textContent = 'Copy';
                copyBtn.onclick = () => {
                    const code = block.querySelector('pre').textContent;
                    copyToClipboard(code);
                };
                block.appendChild(copyBtn);
            });
        }

        function initAnimations() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                    }
                });
            });

            document.querySelectorAll('.fade-in').forEach(el => {           
                observer.observe(el);
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                window.location.href = '../index.html';
            }
        });

        document.querySelector('.back-home').addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../index.html';
        });

        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
            addCopyButtons();
            initAnimations();
            
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
        });

        window.addEventListener('scroll', updateProgressBar);
        
        window.addEventListener('resize', function() {
            if (window.innerWidth < 768) {
                document.querySelectorAll('.particle').forEach(particle => {
                    particle.style.animationDuration = '15s';
                });
            }
        });

        const preloadLinks = [
            '../index.html',
            'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
        ];

        preloadLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = href;
            link.as = href.includes('.css') ? 'style' : 'document';
            document.head.appendChild(link);
        });
