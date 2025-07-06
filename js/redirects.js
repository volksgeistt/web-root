(function() {
    'use strict';
    
    const redirects = {
        'github': 'https://github.com/volksgeistt',
        'ig': 'https://www.instagram.com/volksgeistt',
        'instagram': 'https://www.instagram.com/volksgeistt',
        'discord': 'https://discord.com/users/1181256087081603116',
        'twitter': 'https://twitter.com/volksgeistt',
        'x': 'https://twitter.com/volksgeistt',
        'telegram': 'https://t.me/exrmaniac',
        'tg': 'https://t.me/exrmaniac',
        'mail': 'mailto:exrmaniac@gmail.com',
        'email': 'mailto:exrmaniac@gmail.com',
        'spotify': 'https://open.spotify.com/user/312iqzyw3ros2jdiavxxkkqxiiei?si=9d31b2e13ee44996',
        'playlist': 'https://open.spotify.com/user/312iqzyw3ros2jdiavxxkkqxiiei?si=9d31b2e13ee44996'
    };
    
    function handleRedirect() {
        const path = window.location.pathname.substring(1).toLowerCase(); 
        
        const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
        
        const redirectUrl = redirects[cleanPath];
        
        if (redirectUrl && cleanPath !== '') {
            showRedirectMessage(cleanPath, redirectUrl);
            
            setTimeout(() => {
                if (redirectUrl.startsWith('http') || redirectUrl.startsWith('mailto:')) {
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = redirectUrl;
                }
            }, 1500);
            
            return true; 
        }
        
        return false; 
    }
    
    function showRedirectMessage(path, url) {
        const overlay = document.createElement('div');
        overlay.id = 'redirectOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        
        const messageContainer = document.createElement('div');
        messageContainer.style.cssText = `
            text-align: center;
            color: white;
            font-family: 'Space Grotesk', sans-serif;
            max-width: 400px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
        
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid #79c0ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        const title = document.createElement('h2');
        title.textContent = `Redirecting to ${path}`;
        title.style.cssText = `
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: 600;
            color: #79c0ff;
        `;
        
        const description = document.createElement('p');
        description.textContent = `Taking you to ${url}`;
        description.style.cssText = `
            margin: 0 0 20px 0;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.8);
        `;
        
        const manualLink = document.createElement('a');
        manualLink.href = url;
        manualLink.textContent = 'Click here if not redirected automatically';
        manualLink.style.cssText = `
            color: #79c0ff;
            text-decoration: none;
            font-weight: 500;
            padding: 10px 20px;
            border: 2px solid #79c0ff;
            border-radius: 25px;
            display: inline-block;
            transition: all 0.3s ease;
        `;
        
        manualLink.addEventListener('mouseenter', () => {
            manualLink.style.background = '#79c0ff';
            manualLink.style.color = 'black';
        });
        
        manualLink.addEventListener('mouseleave', () => {
            manualLink.style.background = 'transparent';
            manualLink.style.color = '#79c0ff';
        });
        
        messageContainer.appendChild(spinner);
        messageContainer.appendChild(title);
        messageContainer.appendChild(description);
        messageContainer.appendChild(manualLink);
        
        overlay.appendChild(messageContainer);
        document.body.appendChild(overlay);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleRedirect);
    } else {
        handleRedirect();
    }
    
    window.addEventListener('popstate', handleRedirect);
    
})();