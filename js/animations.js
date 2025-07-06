        class Animation {
            constructor(canvas) {
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                this.nodes = [];
                this.connections = [];
                this.animationId = null;
                this.isAnimating = true;
                this.lastTime = 0;
                this.frameRate = 30;
                this.frameInterval = 1000 / this.frameRate;
                
                this.isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                
                this.resizeCanvas();
                this.initializeNodes();
                this.animate();
                
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        this.isMobile = window.innerWidth <= 768;
                        this.resizeCanvas();
                        this.initializeNodes();
                    }, 250);
                });
            }

            resizeCanvas() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }

            initializeNodes() {
                const baseNodeCount = this.isMobile ? 15 : 25;
                const nodeCount = Math.min(baseNodeCount, Math.floor((this.canvas.width * this.canvas.height) / 35000));
                this.nodes = [];
                
                for (let i = 0; i < nodeCount; i++) {
                    this.nodes.push({
                        x: Math.random() * this.canvas.width,
                        y: Math.random() * this.canvas.height,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: (Math.random() - 0.5) * 0.3,
                        radius: this.isMobile ? 3 : Math.random() * 2 + 2,
                        pulse: Math.random() * Math.PI * 2,
                        pulseSpeed: 0.01 + Math.random() * 0.02
                    });
                }
                
                this.createConnections();
            }

            createConnections() {
                this.connections = [];
                const maxDistance = this.isMobile ? 180 : 160;
                
                for (let i = 0; i < this.nodes.length; i++) {
                    let connectionsCount = 0;
                    const maxConnectionsPerNode = this.isMobile ? 3 : 4;
                    
                    for (let j = i + 1; j < this.nodes.length && connectionsCount < maxConnectionsPerNode; j++) {
                        const distance = this.getDistance(this.nodes[i], this.nodes[j]);
                        if (distance < maxDistance) {
                            this.connections.push({
                                nodeA: this.nodes[i],
                                nodeB: this.nodes[j],
                                distance: distance,
                                maxDistance: maxDistance
                            });
                            connectionsCount++;
                        }
                    }
                }
            }

            getDistance(nodeA, nodeB) {
                return Math.sqrt(
                    Math.pow(nodeA.x - nodeB.x, 2) + 
                    Math.pow(nodeA.y - nodeB.y, 2)
                );
            }

            updateNodes() {
                this.nodes.forEach(node => {
                    node.x += node.vx;
                    node.y += node.vy;
                    
                    if (node.x < 0 || node.x > this.canvas.width) {
                        node.vx *= -1;
                        node.x = Math.max(0, Math.min(this.canvas.width, node.x));
                    }
                    if (node.y < 0 || node.y > this.canvas.height) {
                        node.vy *= -1;
                        node.y = Math.max(0, Math.min(this.canvas.height, node.y));
                    }
            
                    node.pulse += node.pulseSpeed;
                });
            }

            drawNodes() {
                this.nodes.forEach(node => {
                    const pulseSize = Math.sin(node.pulse) * 0.3 + 0.7;
                    const size = node.radius * pulseSize;
                    const opacity = this.isMobile ? 0.7 : 0.6;  
                    
                    this.ctx.beginPath();
                    const gradient = this.ctx.createRadialGradient(
                        node.x, node.y, 0,
                        node.x, node.y, size * (this.isMobile ? 2.5 : 2)
                    );
                    gradient.addColorStop(0, `rgba(92, 154, 255, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(92, 154, 255, ${opacity * 0.6})`);
                    gradient.addColorStop(1, 'rgba(92, 154, 255, 0)');
                    this.ctx.fillStyle = gradient;
                    this.ctx.arc(node.x, node.y, size * (this.isMobile ? 2.5 : 2), 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.beginPath();
                    this.ctx.fillStyle = `rgba(121, 192, 255, ${opacity * 1.3})`;
                    this.ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }

            drawConnections() {
                this.connections.forEach(connection => {
                    const distance = this.getDistance(connection.nodeA, connection.nodeB);
                    if (distance < connection.maxDistance) {
                        const opacity = (1 - (distance / connection.maxDistance)) * (this.isMobile ? 0.3 : 0.3);
                        
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = `rgba(92, 154, 255, ${opacity})`;
                        this.ctx.lineWidth = this.isMobile ? 1 : 1.5;
                        this.ctx.moveTo(connection.nodeA.x, connection.nodeA.y);
                        this.ctx.lineTo(connection.nodeB.x, connection.nodeB.y);
                        this.ctx.stroke();
                    }
                });
            }

            animate(currentTime = 0) {
                if (!this.isAnimating) return;
                
                if (currentTime - this.lastTime >= this.frameInterval) {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    this.updateNodes();
                    
                    if (Math.floor(currentTime / 500) % 2 === 0) {
                        this.createConnections();
                    }
                    
                    this.drawConnections();
                    this.drawNodes();
                    
                    this.lastTime = currentTime;
                }
                
                this.animationId = requestAnimationFrame((time) => this.animate(time));
            }

            toggle() {
                this.isAnimating = !this.isAnimating;
                if (this.isAnimating) {
                    this.animate();
                } else {
                    cancelAnimationFrame(this.animationId);
                }
            }
        }

        let neuralNetwork;

        document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('neuralCanvas');
            neuralNetwork = new Animation(canvas);
        });

        if (window.innerWidth > 768) {
            let mouseInteractionTimeout;
            document.addEventListener('mousemove', (e) => {
                if (neuralNetwork && !neuralNetwork.isMobile) {
                    clearTimeout(mouseInteractionTimeout);
                    mouseInteractionTimeout = setTimeout(() => {
                        const mouseX = e.clientX;
                        const mouseY = e.clientY;
                        const attractionRadius = 80;
                        
                        neuralNetwork.nodes.forEach(node => {
                            const distance = Math.sqrt(
                                Math.pow(node.x - mouseX, 2) + 
                                Math.pow(node.y - mouseY, 2)
                            );
                            
                            if (distance < attractionRadius) {
                                const force = (attractionRadius - distance) / attractionRadius;
                                const angle = Math.atan2(mouseY - node.y, mouseX - node.x);
                                node.vx += Math.cos(angle) * force * 0.01;
                                node.vy += Math.sin(angle) * force * 0.01;
                            }
                        });
                    }, 16);
                }
            });
        }
