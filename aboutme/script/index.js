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

        function animateCounters() {
            const statNumbers = document.querySelectorAll('.stat-number');
            
            statNumbers.forEach(stat => {
                const target = stat.textContent;
                const isNumber = !isNaN(target.replace(/[^0-9]/g, ''));
                
                if (isNumber) {
                    const finalNumber = parseInt(target.replace(/[^0-9]/g, ''));
                    const duration = 2000;
                    const increment = finalNumber / (duration / 16);
                    let current = 0;
                    
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= finalNumber) {
                            stat.textContent = target;
                            clearInterval(timer);
                        } else {
                            stat.textContent = Math.floor(current) + target.replace(/[0-9]/g, '');
                        }
                    }, 16);
                }
            });
        }

        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
            initAnimations();
            
            setTimeout(animateCounters, 1000);
            
            window.addEventListener('scroll', updateProgressBar);
            
            window.addEventListener('resize', function() {
                const particlesContainer = document.getElementById('particles');
                particlesContainer.innerHTML = '';
                createParticles();
            });
        });

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

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
            }
        });

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

        window.addEventListener('scroll', optimizedScroll);
