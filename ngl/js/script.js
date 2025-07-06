const API_URL = 'https://ngl-server.onrender.com'; 

const form = document.getElementById('messageForm');
const messageInput = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const messageStatusDiv = document.getElementById('messageStatus');
const charCounter = document.getElementById('charCounter');

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = Math.min(30, Math.floor(window.innerWidth / 30));
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 6 + 8) + 's';
        particlesContainer.appendChild(particle);
    }
}

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
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

function updateCharCounter() {
    const currentLength = messageInput.value.length;
    const maxLength = 650;
    charCounter.textContent = `${currentLength} / ${maxLength} characters`;
    
    if (currentLength > maxLength * 0.9) {
        charCounter.className = 'char-counter danger';
    } else if (currentLength > maxLength * 0.8) {
        charCounter.className = 'char-counter warning';
    } else {
        charCounter.className = 'char-counter';
    }
}

function validateInput(input) {
    const value = input.value.trim();
    if (value.length === 0) return false; 
    
    const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(value));
}

function validateForm() {
    const message = messageInput.value.trim();
    
    if (!message) {
        showMessage('❌ Message cannot be empty', 'error');
        messageInput.focus();
        return false;
    }
    
    if (message.length > 650) {
        showMessage('❌ Message exceeds maximum length of 650 characters', 'error');
        messageInput.focus();
        return false;
    }
    
    if (!validateInput(messageInput)) {
        showMessage('❌ Message contains invalid content', 'error');
        return false;
    }
    
    return true;
}

let lastSubmissionTime = 0;
const RATE_LIMIT_DELAY = 180000; 

function checkRateLimit() {
    const now = Date.now();
    if (now - lastSubmissionTime < RATE_LIMIT_DELAY) {
        const remainingTime = Math.ceil((RATE_LIMIT_DELAY - (now - lastSubmissionTime)) / 1000);
        showMessage(`❌ Please wait ${remainingTime} seconds before sending another message`, 'error');
        return false;
    }
    lastSubmissionTime = now;
    return true;
}

async function sendMessage(message) {
    const response = await fetch(`${API_URL}/send-message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        let errorMessage = 'Failed to send message';
        try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
            console.error('Error parsing response:', e);
        }
        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
}

function showMessage(text, type) {
    messageStatusDiv.innerHTML = text;
    messageStatusDiv.className = `message-status ${type}`;
    messageStatusDiv.style.display = 'block';
    
    messageStatusDiv.style.opacity = '0';
    messageStatusDiv.style.transform = 'translateY(10px)';
    setTimeout(() => {
        messageStatusDiv.style.transition = 'all 0.3s ease';
        messageStatusDiv.style.opacity = '1';
        messageStatusDiv.style.transform = 'translateY(0)';
    }, 10);
    
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

function hideMessage() {
    messageStatusDiv.style.display = 'none';
    messageStatusDiv.className = 'message-status';
}

let draftSaveTimeout;
function saveDraft() {
    clearTimeout(draftSaveTimeout);
    draftSaveTimeout = setTimeout(() => {
        window.messageDraft = {
            message: messageInput.value,
            timestamp: Date.now()
        };
    }, 1000);
}

function restoreDraft() {
    if (window.messageDraft && window.messageDraft.timestamp) {
        const timeDiff = Date.now() - window.messageDraft.timestamp;
        if (timeDiff < 3600000) {
            if (window.messageDraft.message) {
                messageInput.value = window.messageDraft.message;
            }
            updateCharCounter();
        }
    }
}

function clearDraft() {
    delete window.messageDraft;
}

document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initAnimations();
    updateCharCounter();
    restoreDraft();
    
    messageInput.addEventListener('input', function() {
        updateCharCounter();
        saveDraft();
    });
    
    window.addEventListener('resize', function() {
        const particlesContainer = document.getElementById('particles');
        particlesContainer.innerHTML = '';
        createParticles();
    });
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !checkRateLimit()) {
        return;
    }
    
    const message = messageInput.value.trim();
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span>Sending...';
    hideMessage();

    try {
        const result = await sendMessage(message);
        showMessage('🎉 Message sent successfully! Your anonymous message has been delivered.', 'success');
        messageInput.value = '';
        updateCharCounter();
        clearDraft();
    } catch (error) {
        console.error('Message sending error:', error);
        let errorMessage = error.message;
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        } else if (error.message.includes('429')) {
            errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else if (error.message.includes('500')) {
            errorMessage = 'Server error. Please try again later.';
        }
        
        showMessage('❌ ' + errorMessage, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right: 8px;"></i>Send Message';
    }
});

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!submitBtn.disabled) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    if (e.key === 'Escape') {
        if (confirm('Clear the form?')) {
            messageInput.value = '';
            updateCharCounter();
            hideMessage();
            clearDraft();
        }
    }
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        saveDraft();
    }
});

window.addEventListener('beforeunload', function() {
    saveDraft();
});  
