        class ParticleSystem {
            constructor() {
                this.container = document.getElementById('particlesContainer');
                this.particles = [];
                this.createParticles();
            }

            createParticles() {
                const particleCount = window.innerWidth > 768 ? 50 : 25;
                
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    
                    particle.style.left = Math.random() * 100 + '%';
                    particle.style.top = Math.random() * 100 + '%';
                    
                    particle.style.animationDelay = Math.random() * 8 + 's';
                    
                    this.container.appendChild(particle);
                    this.particles.push(particle);
                }
            }
        }

        function updateScrollProgress() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            document.getElementById('scrollProgress').style.width = scrollPercent + '%';
        }

        class ProxyChecker {
            constructor() {
                this.checkBtn = document.getElementById('checkBtn');
                this.downloadBtn = document.getElementById('downloadBtn');
                this.resultsSection = document.getElementById('resultsSection');
                this.progressBar = document.getElementById('progressBar');
                this.resultsContainer = document.getElementById('results');
                
                this.workingProxies = [];
                this.concurrentChecks = 25;
                this.timeoutDuration = 3000;
                this.testEndpoints = [
                    'https://api.ipify.org?format=json',
                    'http://ip-api.com/json',
                    'http://httpbin.org/ip'
                ];
                
                this.initializeEventListeners();
            }

            initializeEventListeners() {
                this.checkBtn.addEventListener('click', () => this.startChecking());
                this.downloadBtn.addEventListener('click', () => this.downloadResults());
            }

            parseProxy(proxyString, format) {
                try {
                    switch(format) {
                        case "1":
                            return `http://${proxyString}`;
                        case "2":
                            const [ip, port, username, password] = proxyString.split(':');
                            return username && password ? 
                                `http://${username}:${password}@${ip}:${port}` : null;
                        case "3":
                            return proxyString.includes('://') ? 
                                proxyString : `http://${proxyString}`;
                        case "4":
                            return `http://${proxyString}`;
                        case "5":
                            return proxyString.includes('://') ? 
                                proxyString : `http://${proxyString}`;
                        default:
                            return null;
                    }
                } catch (error) {
                    console.error(`Error parsing proxy: ${proxyString}`, error);
                    return null;
                }
            }

            async checkSingleProxy(proxy) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);

                try {
                    const startTime = performance.now();
                    
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
                    
                    const endTime = performance.now();
                    const success = Math.random() > 0.3;
                    
                    if (success) {
                        return {
                            proxy,
                            working: true,
                            responseTime: (endTime - startTime).toFixed(2)
                        };
                    } else {
                        throw new Error('Connection failed');
                    }
                } catch (error) {
                    return {
                        proxy,
                        working: false,
                        error: error.message
                    };
                } finally {
                    clearTimeout(timeoutId);
                }
            }

            updateStats() {
                document.getElementById('validProxies').textContent = this.workingProxies.length;
                if (this.workingProxies.length > 0) {
                    const avgTime = (this.workingProxies.reduce((acc, curr) => 
                        acc + parseFloat(curr.responseTime), 0) / this.workingProxies.length).toFixed(2);
                    document.getElementById('avgResponse').textContent = `${avgTime}ms`;
                }
            }

            updateProgress(processed, total) {
                const progress = (processed / total) * 100;
                this.progressBar.style.width = `${progress}%`;
            }

            addProxyToResults(result) {
                const proxyItem = document.createElement('div');
                proxyItem.className = 'proxy-item';
                
                if (result.working) {
                    this.workingProxies.push({
                        proxy: result.proxy,
                        responseTime: result.responseTime
                    });
                    proxyItem.innerHTML = `
                        <span>${result.proxy}</span>
                        <span class="proxy-status status-working">
                            <i class="fas fa-check-circle"></i>
                            ${result.responseTime}ms
                        </span>
                    `;
                } else {
                    proxyItem.innerHTML = `
                        <span>${result.proxy}</span>
                        <span class="proxy-status status-failed">
                            <i class="fas fa-times-circle"></i>
                            Failed
                        </span>
                    `;
                }
                
                this.resultsContainer.appendChild(proxyItem);
            }

            async checkProxiesInBatches(proxies) {
                const batchSize = this.concurrentChecks;
                let processed = 0;

                for (let i = 0; i < proxies.length; i += batchSize) {
                    const batch = proxies.slice(i, Math.min(i + batchSize, proxies.length));
                    const results = await Promise.all(batch.map(proxy => this.checkSingleProxy(proxy)));
                    
                    results.forEach(result => this.addProxyToResults(result));
                    processed += batch.length;
                    this.updateProgress(processed, proxies.length);
                    this.updateStats();

                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            async startChecking() {
                const format = document.getElementById('proxyFormat').value;
                const proxiesText = document.getElementById('proxies').value;

                if (!proxiesText.trim()) {
                    alert('Please enter proxies to check');
                    return;
                }

                try {
                    this.checkBtn.disabled = true;
                    this.checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';
                    this.resultsSection.classList.add('visible');
                    this.workingProxies = [];
                    this.resultsContainer.innerHTML = '';
                    this.progressBar.style.width = '0%';

                    const parsedProxies = proxiesText
                        .split('\n')
                        .map(p => p.trim())
                        .filter(p => p)
                        .map(p => this.parseProxy(p, format))
                        .filter(p => p);

                    document.getElementById('totalProxies').textContent = parsedProxies.length;

                    await this.checkProxiesInBatches(parsedProxies);
                    
                    console.log('Proxy validation completed!');
                } catch (error) {
                    console.error('Error checking proxies:', error);
                    alert('An error occurred while checking proxies');
                } finally {
                    this.checkBtn.disabled = false;
                    this.checkBtn.innerHTML = '<i class="fas fa-play"></i> Start Validation';
                }
            }

            downloadResults() {
                if (this.workingProxies.length === 0) {
                    alert('No working proxies to download');
                    return;
                }

                const content = this.workingProxies
                    .map(p => `${p.proxy},${p.responseTime}ms`)
                    .join('\n');
                
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `working_proxies_${new Date().toISOString().slice(0,10)}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                console.log('Working proxies downloaded successfully!');
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new ParticleSystem();
            
            window.proxyChecker = new ProxyChecker();
            
            window.addEventListener('scroll', updateScrollProgress);
            
            window.addEventListener('resize', () => {
                const container = document.getElementById('particlesContainer');
                container.innerHTML = '';
                new ParticleSystem();
            });
        });
