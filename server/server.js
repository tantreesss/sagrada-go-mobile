// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// ===== Server Configuration =====
const app = express();
const port = process.env.PORT || 5001;
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_SUPABASE_SERVICE_ROLE_KEY);

// Log server configuration
console.log('Environment check:');
console.log('- PORT:', process.env.PORT || 5001);
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- API Key configured:', !!process.env.GEMINI_API_KEY);
console.log('- Supabase URL:', process.env.REACT_APP_SUPABASE_URL ? 'Configured' : 'Not configured');
console.log('- Supabase Service Role Key:', process.env.REACT_SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Not configured');

// ===== Middleware Setup =====
// Allow requests from frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ===== Helper Functions =====
/**
 * Tests if the Gemini API is working by sending a simple "Hello" message
 * @returns {Promise<boolean>} True if the API test was successful
 */
async function testGeminiAPI() {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: "Hello" }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('Gemini API test successful. Response:', response.data);
    return true;
  } catch (error) {
    console.error('Gemini API test failed:', error.response?.data || error.message);
    return false;
  }
}

// ===== API Endpoints =====
/**
 * Chat endpoint that handles messages and returns AI responses
 * POST /api/gemini
 * Body: { message: string, history: Array }
 */
app.post('/api/gemini', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Validate input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are a helpful virtual assistant for Sagrada Familia Parish Church, located at Sagrada Familia Parish, Sanctuary of the Holy Face of Manoppello, Manila, Philippines.
      You are an expert in both church-related matters in the Philippines and the SagradaGo Parish Information System. In SagradaGo, users can:
      • Book sacrament services — Wedding, Baptism, Confession, Anointing of the Sick, First Communion, and Burial — via the "Book a Service" feature.
      • View upcoming church events on the "Events" page.
      • Volunteer for church activities.
      • Donate to support the church.
      Only respond to questions related to the church or the SagradaGo system.
      If the user asks about anything unrelated (e.g., random topics, general knowledge, or other locations), politely reply that you can only assist with Sagrada Familia Parish and its services.
    `;


    // Format conversation history for Gemini API
    const contents = [
      { 
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...(history ? history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts[0].text }]
      })) : []),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    // Send request to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    // Extract response text from Gemini API response
    const candidates = response.data.candidates;
    let reply = 'Sorry, no response from Gemini.';
    
    if (candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = candidates[0].content.parts[0].text;
    }

    res.json({ reply });
  } catch (error) {
    console.error('Error in /api/gemini:', error.response?.data || error);
    
    // Handle API errors
    if (error.response?.data?.error?.message) {
      return res.status(error.response.status).json({
        error: error.response.data.error.message,
        details: error.response.data
      });
    }
    
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
});

/**
 * Health check endpoint to verify server and API status
 * GET /api/health
 */
app.get('/api/health', async (req, res) => {
  try {
    const apiTest = await testGeminiAPI();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
      apiTestSuccessful: apiTest,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
      apiTestSuccessful: false,
      details: error.response?.data || error.stack
    });
  }
});

app.post('/admin/createUser', async (req, res) => {
  try {
    const { email, randomPassword } = req.body;
    if (!email || !randomPassword) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email and random password are required',
        user: null,
        details: 'Missing email or random password in request body'
      });
    }
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `http://localhost:3000/set-password`,
      // redirectTo: `${window.location.origin}/set-password`,
    });

    if (error) {
      console.error('Error from Supabase:', error);
      return res.status(500).json({
        status: 'error',
        message: error,
        details: error,
        user: null
      });
    }

    res.json({
      status: 'success',
      message: 'User has been invited to join SagradaGo. They are sent an invite link to set their password before accessing the system.',
      details: 'User has been invited to join SagradaGo',
      user: data.user
    });

    // Create a new user in the SagradaGo system

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Failed to create user',
      details: error.response?.data || error.stack ,
      user: null
    });
  }
});

// ===== Server Startup =====
const server = app.listen(port, async () => {
  console.log('='.repeat(50));
  console.log(`Server started successfully!`);
  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  
  // Test API on startup
  const apiTest = await testGeminiAPI();
  if (!apiTest) {
    console.error('⚠️ Warning: Gemini API test failed. The chatbot may not work properly.');
    console.error('Please check your API key and try again.');
  } else {
    console.log('✅ Gemini API test successful');
  }
  console.log('='.repeat(50));
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
}); 