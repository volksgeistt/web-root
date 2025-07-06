const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1385332713707540510/qieZjWAQwHkSlN3eJ2IAkliCzLPX8Nkgjb9QcnrsmNXDcKNAo9nf4QfnNxZerxZf1yM3'; 

function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
        if (/ipad/i.test(userAgent)) {
            return "Tablet (iPad)";
        } else if (/android/i.test(userAgent) && /mobile/i.test(userAgent)) {
            return "Mobile (Android)";
        } else if (/android/i.test(userAgent)) {
            return "Tablet (Android)";
        } else if (/iphone|ipod/i.test(userAgent)) {
            return "Mobile (iPhone)";
        } else {
            return "Mobile Device";
        }
    }
    
    return "Desktop/Laptop";
}

function getBrowserName() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
        return "Chrome";
    } else if (userAgent.includes("Firefox")) {
        return "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
        return "Safari";
    } else if (userAgent.includes("Edg")) {
        return "Edge";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
        return "Opera";
    } else {
        return "Unknown Browser";
    }
}

async function notifyVisit() {
    const deviceType = getDeviceType();
    const browser = getBrowserName();
    const endpoint = window.location.pathname;
    
    const message = {
        content: `👁️ **Visit:** ${deviceType} • ${browser} • **${endpoint}**`
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });
    } catch (error) {
        return;
    }
}

window.addEventListener('load', notifyVisit);