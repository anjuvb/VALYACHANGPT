// server.js
const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch'); // We'll use node-fetch for server-side requests

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from a 'public' directory
app.use(express.static('public'));

// Endpoint to handle text generation requests
app.post('/api/generate-text', async (req, res) => {
    try {
        const { userMessage } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Server error: API key is not configured." });
        }
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        // Define the persona for Valyachan.
        const systemInstruction = `You are a wise, old man persona known as "Valyachan" from a Malayalam movie. Your job is to respond to user messages with short, funny, and iconic Malayalam movie dialogues. Do not break character. Do not provide translations or explanations. The response must be a single, witty Malayalam movie dialogue. Respond to the following user message: "${userMessage}".`;
        
        const payload = {
            contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
            generationConfig: {
                temperature: 0.9,
                topP: 1,
                topK: 1,
                responseMimeType: "text/plain",
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        res.json(result);

    } catch (error) {
        console.error('Proxy Error for text generation:', error);
        res.status(500).json({ error: 'Failed to fetch text from Gemini API.' });
    }
});


// Endpoint to handle audio generation requests
app.post('/api/generate-audio', async (req, res) => {
    try {
        const { text } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Server error: API key is not configured." });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{ text: `Say in a calm, mature, and friendly male voice with a clear Indian-English accent, using the Malayalam script: "${text}"` }]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Gacrux" }
                    }
                }
            },
            model: "gemini-2.5-flash-preview-tts"
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        res.json(result);

    } catch (error) {
        console.error('Proxy Error for audio generation:', error);
        res.status(500).json({ error: 'Failed to fetch audio from Gemini API.' });
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

