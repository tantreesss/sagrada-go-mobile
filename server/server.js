const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log('Gemini API Key at startup:', GEMINI_API_KEY);

const app = express();
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false // Set to false when using wildcard origin
}));
app.use(express.json());

// Health check endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Server info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    status: 'Server is running',
    accessibleFrom: 'All IP addresses',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      chat: '/api/gemini',
      info: '/api/info'
    },
    cors: 'Enabled for all origins',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for the chatbot
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    apiTestSuccessful: true,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Gemini chat endpoint
app.post('/api/gemini', async (req, res) => {
  const userMessage = req.body.message;
  const history = req.body.history || [];
  
  console.log('Received request:', { userMessage, history });
  
  try {
    const contents = history.length > 0
      ? history.concat([{ role: 'user', parts: [{ text: userMessage }] }])
      : [{ parts: [{ text: userMessage }] }];
      
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // Debug: print the outgoing request
    console.log('Sending to Gemini:', JSON.stringify({ contents }, null, 2));
    console.log('Using API Key:', GEMINI_API_KEY);
    
    const geminiResponse = await axios.post(
      geminiUrl,
      { contents },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );
    
    // Debug: print the response
    console.log('Gemini API response:', JSON.stringify(geminiResponse.data, null, 2));
    
    const candidates = geminiResponse.data.candidates;
    let geminiReply = 'Sorry, no response from Gemini.';
    
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts && candidates[0].content.parts[0].text) {
      geminiReply = candidates[0].content.parts[0].text;
    }
    
    res.json({ 
      response: geminiReply,
      reply: geminiReply 
    });
  } catch (err) {
    if (err.response) {
      console.error('Gemini API error:', JSON.stringify(err.response.data, null, 2));
      res.status(500).json({ 
        response: err.response.data.error?.message || 'Sorry, Gemini is unavailable.',
        reply: err.response.data.error?.message || 'Sorry, Gemini is unavailable.'
      });
    } else {
      console.error('Gemini API error:', err.message, err.stack);
      res.status(500).json({ 
        response: 'Sorry, Gemini is unavailable.',
        reply: 'Sorry, Gemini is unavailable.'
      });
    }
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`🚀 SagradaGo Server started successfully!`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log('='.repeat(60));
  console.log('🌐 ACCESS POINTS:');
  console.log(`   Local:     http://localhost:${PORT}`);
  console.log(`   Network:   http://192.168.1.12:${PORT}`);
  console.log(`   Public:    http://0.0.0.0:${PORT}`);
  console.log('='.repeat(60));
  console.log('📋 ENDPOINTS:');
  console.log(`   Health:    http://192.168.1.12:${PORT}/api/health`);
  console.log(`   Test:      http://192.168.1.12:${PORT}/api/test`);
  console.log(`   Info:      http://192.168.1.12:${PORT}/api/info`);
  console.log(`   Chat:      http://192.168.1.12:${PORT}/api/gemini`);
  console.log('='.repeat(60));
  console.log('✅ CORS: Enabled for all origins (*)');
  console.log('✅ Accessible from any IP address');
  console.log('='.repeat(60));
});