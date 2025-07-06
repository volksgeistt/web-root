        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            particlesContainer.innerHTML = '';
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

        function updateScrollProgress() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            document.getElementById('scrollProgressBar').style.width = progress + '%';
        }

        const NGLSender = {
            deviceId: null,
            
            SUBMIT_URL: 'https://ngl.link/api/submit',
            MIN_DELAY: 500,
            MAX_DELAY: 1000,
            
            elements: {
                form: null,
                username: null,
                message: null,
                count: null,
                sendButton: null,
                progress: null,
                sentCount: null,
                totalCount: null,
                status: null,
                progressFill: null,
                iframe: null
            },

            init() {
                this.deviceId = this.generateDeviceId();
                
                this.elements = {
                    form: document.getElementById('messageForm'),
                    username: document.getElementById('username'),
                    message: document.getElementById('message'),
                    count: document.getElementById('messageCount'),
                    sendButton: document.getElementById('sendButton'),
                    progress: document.getElementById('progress'),
                    sentCount: document.getElementById('sentCount'),
                    totalCount: document.getElementById('totalCount'),
                    status: document.getElementById('status'),
                    progressFill: document.getElementById('progressFill')
                };
                
                this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
                
                this.createHiddenIframe();
            },

            generateDeviceId() {
                return Array.from(crypto.getRandomValues(new Uint8Array(16)))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            },

            createHiddenIframe() {
                const iframe = document.createElement('iframe');
                iframe.name = 'hidden_iframe';
                iframe.id = 'hidden_iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                this.elements.iframe = iframe;
            },

            async handleSubmit(e) {
                e.preventDefault();
                
                const username = this.elements.username.value.trim();
                const message = this.elements.message.value.trim();
                const count = parseInt(this.elements.count.value);

                if (!this.validateInput(username, message, count)) {
                    return;
                }

                this.setLoading(true);
                this.resetProgress(count);
                
                try {
                    const results = await this.sendBatch(username, message, count);
                    this.handleSuccess(results);
                } catch (error) {
                    this.handleError(error);
                } finally {
                    this.setLoading(false);
                }
            },

            validateInput(username, message, count) {
                if (!username) {
                    this.showStatus('Please enter a username', true);
                    return false;
                }   
                if (!message) {
                    this.showStatus('Please enter a message', true);
                    return false;
                }
                if (count < 1 || count > 10) {
                    this.showStatus('Please enter a number between 1 and 10', true);
                    return false;
                }
                return true;
            },

            async sendMessage(username, message) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = this.SUBMIT_URL;
                form.target = 'hidden_iframe';

                const formData = {
                    username: username,
                    question: message,
                    deviceId: this.deviceId,
                    gameSlug: '',
                    referrer: ''
                };

                Object.entries(formData).forEach(([name, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);

                await this.delay(this.MIN_DELAY, this.MAX_DELAY);
            },

            async sendBatch(username, message, count) {
                const results = {
                    success: 0,
                    failed: 0
                };

                for (let i = 0; i < count; i++) {
                    try {
                        await this.sendMessage(username, message);
                        results.success++;
                        this.updateProgress(results.success, count);
                    } catch (error) {
                        console.error('Error sending message:', error);
                        results.failed++;
                    }
                }

                return results;
            },

            updateProgress(sent, total) {
                this.elements.sentCount.textContent = sent;
                this.elements.totalCount.textContent = total;
                const percentage = (sent / total) * 100;
                this.elements.progressFill.style.width = percentage + '%';
            },

            resetProgress(total) {
                this.elements.progress.style.display = 'block';
                this.updateProgress(0, total);
            },

            showStatus(message, isError = false) {
                this.elements.status.className = `status ${isError ? 'error' : 'success'}`;
                this.elements.status.textContent = message;
                this.elements.status.style.display = 'block';
                
                setTimeout(() => {
                    this.elements.status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            },

            handleSuccess(results) {
                let message = `Successfully sent ${results.success} messages!`;
                if (results.failed > 0) {
                    message += ` (${results.failed} failed)`;
                }
                this.showStatus(message);
                
                if (results.success > 0) {
                    this.elements.form.reset();
                    this.elements.count.value = '1';
                }
            },

            handleError(error) {
                this.showStatus(error.message || 'An error occurred while sending messages', true);
            },

            setLoading(isLoading) {
                this.elements.sendButton.disabled = isLoading;
                const spinner = this.elements.sendButton.querySelector('.loading-spinner');
                const text = this.elements.sendButton.querySelector('span');
                
                if (isLoading) {
                    spinner.style.display = 'inline-block';
                    text.textContent = 'Sending...';
                } else {
                    spinner.style.display = 'none';
                    text.textContent = 'Send Messages';
                    this.elements.progress.style.display = 'none';
                }
            },

            delay(min, max) {
                const delay = Math.random() * (max - min) + min;
                return new Promise(resolve => setTimeout(resolve, delay));
            }
        };

        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
            updateScrollProgress();
            NGLSender.init();
            
            window.addEventListener('scroll', updateScrollProgress, { passive: true });
            
            window.addEventListener('resize', function() {
                createParticles();
                updateScrollProgress();
            }, { passive: true });
        });
