const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

app.get('/', (req, res) => {
    res.json({ 
        status: 'Anonymous Message Server is running!', 
        timestamp: new Date().toISOString(),
        port: PORT 
    });
});

app.post('/send-message', async (req, res) => {
    try {
        const { message, subject } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (message.length > 5000) {
            return res.status(400).json({ error: 'Message is too long (max 5000 characters)' });
        }

        const messageSubject = subject && subject.trim() ? subject.trim() : 'Anonymous Message';
        
        console.log(`Sending anonymous message with subject: ${messageSubject}`);
        
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'ngl@9orbit.space',
                to: [RECIPIENT_EMAIL],
                subject: 'no-reply : volksgeistt',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h3 style="color: #333;">📑 NGL Messages</h3>
                        <p>${message.trim()}</p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
                    </div>
                `,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Resend API error:', error);
            return res.status(response.status).json({ 
                error: error.message || 'Failed to send message' 
            });
        }

        const result = await response.json();
        console.log('Message sent successfully:', result.id);

        res.json({ 
            success: true, 
            id: result.id,
            message: 'Message sent successfully!'
        });
    } catch (error) {
        console.error('Message sending error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to process message request'
        });
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Anonymous Message Server running on port ${PORT}`);
    console.log(`📧 Messages will be sent to: ${RECIPIENT_EMAIL}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});