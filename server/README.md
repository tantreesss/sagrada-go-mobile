# SagradaGo Server

This is the backend server for the SagradaGo mobile app, providing chatbot functionality and admin operations.

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Create Environment File
Create a `.env` file in the server directory with the following content:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Gemini AI API Key (Required for chatbot)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration (Required for database operations)
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Get Required API Keys

#### Gemini AI API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in your `.env` file

#### Supabase Keys:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and paste it as `REACT_APP_SUPABASE_URL`
4. Copy the `service_role` key and paste it as `REACT_SUPABASE_SERVICE_ROLE_KEY`

### 4. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Or directly
node server.js
```

## API Endpoints

- `POST /api/gemini` - Chatbot endpoint
- `GET /api/health` - Health check
- `POST /admin/createUser` - Create new user (admin only)

## Testing the Server

1. Start the server: `npm start`
2. Check health: `http://localhost:5001/api/health`
3. Test chatbot: Send POST request to `/api/gemini`

## Troubleshooting

- Make sure all environment variables are set
- Check that the Gemini API key is valid
- Verify Supabase credentials are correct
- Ensure port 5001 is not already in use
