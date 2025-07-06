class AudioController {
    constructor() {
        this.audio = document.getElementById('backgroundAudio');
        this.control = document.getElementById('audioControl');
        this.icon = document.getElementById('audioIcon');
        
        this.state = {
            isPlaying: false,
            isMuted: false,
            isLoading: false,
            hasUserInteracted: false,
            volume: 0.3
        };
        
        this.config = {
            defaultVolume: 0.3,
            fadeTransition: 300,
            retryAttempts: 3
        };
        
        this.initialize();
    }
    
    initialize() {
        if (!this.validateElements()) {
            console.error('AudioController: Required elements not found');
            return;
        }
        
        this.setupAudio();
        this.bindEvents();
        this.updateUI();
    }
    
    validateElements() {
        return this.audio && this.control && this.icon;
    }
    
    setupAudio() {
        this.audio.volume = this.config.defaultVolume;
        this.audio.loop = true;
        this.audio.preload = 'auto';
    }
    
    bindEvents() {
        this.control.addEventListener('click', this.handleToggle.bind(this));
        this.control.addEventListener('keydown', this.handleKeydown.bind(this));
        
        this.audio.addEventListener('loadstart', () => this.setLoadingState(true));
        this.audio.addEventListener('canplaythrough', () => this.setLoadingState(false));
        this.audio.addEventListener('play', this.handlePlay.bind(this));
        this.audio.addEventListener('pause', this.handlePause.bind(this));
        this.audio.addEventListener('ended', this.handleEnded.bind(this));
        this.audio.addEventListener('error', this.handleError.bind(this));
        
        this.trackUserInteraction();
        
        this.handleVisibilityChange();
    }
    
    trackUserInteraction() {
        const handleFirstInteraction = () => {
            this.state.hasUserInteracted = true;
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };
        
        document.addEventListener('click', handleFirstInteraction, { passive: true });
        document.addEventListener('keydown', handleFirstInteraction, { passive: true });
        document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    }
    
    handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.isPlaying) {
                this.pauseAudio();
            } else if (!document.hidden && this.state.isPlaying && !this.state.isMuted) {
                this.playAudio();
            }
        });
    }
    
    
    async handleToggle() {
        if (this.state.isLoading) return;
        
        try {
            if (this.state.isPlaying) {
                await this.pauseAudio();
            } else {
                await this.playAudio();
            }
        } catch (error) {
            this.handleError(error);
        }
    }
    
    handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleToggle();
        }
    }
    
    handlePlay() {
        this.state.isPlaying = true;
        this.state.isMuted = false;
        this.updateUI();
    }
    
    
    handlePause() {
        this.state.isPlaying = false;
        this.updateUI();
    }
    
    handleEnded() {
        this.state.isPlaying = false;
        this.updateUI();
    }
    
    handleError(error) {
        console.warn('AudioController: Audio error occurred', error);
        this.state.isPlaying = false;
        this.setLoadingState(false);
        this.updateUI();
    }
    
    async playAudio() {
        if (this.state.isLoading) return;
        
        this.setLoadingState(true);
        
        try {
            await this.audio.play();
            this.state.hasUserInteracted = true;
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                console.info('AudioController: Autoplay blocked - user interaction required');
            } else {
                this.handleError(error);
            }
            this.state.isPlaying = false;
            this.state.isMuted = true;
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async pauseAudio() {
        try {
            this.audio.pause();
            this.state.isMuted = true;
        } catch (error) {
            this.handleError(error);
        }
    }
    
    setLoadingState(isLoading) {
        this.state.isLoading = isLoading;
        this.control.classList.toggle('loading', isLoading);
        
        // Always ensure button remains clickable
        if (isLoading) {
            this.icon.className = 'fas fa-spinner audio-icon';
            this.control.style.pointerEvents = 'none';
        } else {
            this.control.style.pointerEvents = 'auto';
            this.updateUI();
        }
    }
    
    
    updateUI() {
        this.control.classList.remove('playing', 'muted');
        
        if (this.state.isPlaying && !this.audio.paused) {
            this.icon.className = 'fas fa-volume-up audio-icon';
            this.control.classList.add('playing');
            this.control.title = 'Pause Background Music';
            this.control.setAttribute('aria-label', 'Pause Background Music');
        } else {
            this.icon.className = 'fas fa-volume-mute audio-icon';
            this.control.classList.add('muted');
            this.control.title = 'Play Background Music';
            this.control.setAttribute('aria-label', 'Play Background Music');
        }
    }
    
    setVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this.audio.volume = clampedVolume;
        this.state.volume = clampedVolume;
    }
    
    getVolume() {
        return this.audio.volume;
    }
    
    
    getState() {
        return { ...this.state };
    }
    
    destroy() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = '';
        this.audio.load();
        
        // Remove event listeners
        this.control.removeEventListener('click', this.handleToggle);
        this.control.removeEventListener('keydown', this.handleKeydown);
    }
}

function initializeAudioController() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.audioController = new AudioController();
        });
    } else {
        window.audioController = new AudioController();
    }
}

window.addEventListener('beforeunload', () => {
    if (window.audioController) {
        window.audioController.destroy();
    }
});

initializeAudioController();