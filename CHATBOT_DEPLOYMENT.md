# AI Marine Assistant Chatbot - Deployment Guide

## Issue Identified

The chatbot is showing errors because the deployed Supabase Edge Function is outdated and expects `LOVABLE_API_KEY`, while the current code uses `OPENAI_API_KEY` or `GEMINI_API_KEY`.

## Solution: Deploy the Updated Function

### Option 1: Deploy via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/yqhfuupiffhejocltowt

2. **Navigate to Edge Functions**
   - Click on "Edge Functions" in the left sidebar
   - Find or create the `marine-chat` function

3. **Deploy the Function Code**
   - Copy the contents from `/workspace/supabase/functions/marine-chat/index.ts`
   - Paste it into the function editor in the dashboard
   - Click "Deploy"

4. **Set Up Function Secrets** (Choose one)
   
   **Option A - Using OpenAI (Recommended):**
   - In the Edge Functions settings, add a secret:
     - Name: `OPENAI_API_KEY`
     - Value: Your OpenAI API key (get from https://platform.openai.com/api-keys)
   
   **Option B - Using Google Gemini:**
   - In the Edge Functions settings, add a secret:
     - Name: `GEMINI_API_KEY`
     - Value: Your Google AI API key (get from https://aistudio.google.com/apikey)

### Option 2: Deploy via CLI (Advanced)

**Prerequisites:**
- Supabase CLI access token
- Set environment variable: `export SUPABASE_ACCESS_TOKEN=your_token_here`

**Steps:**
```bash
# Link the project
npx supabase link --project-ref yqhfuupiffhejocltowt

# Set the API key secret (choose one)
npx supabase secrets set OPENAI_API_KEY=your_openai_key_here
# OR
npx supabase secrets set GEMINI_API_KEY=your_gemini_key_here

# Deploy the function
npx supabase functions deploy marine-chat
```

## What Was Fixed in the Code

### Frontend (ChatBot.tsx)
- ✅ Added better error handling for missing responses
- ✅ Added fallback messages when the AI service fails
- ✅ Improved error display to users
- ✅ Added graceful degradation with contact information

### Backend (marine-chat/index.ts)
- ✅ Updated to support both OpenAI and Google Gemini APIs
- ✅ Added fallback responses when no API keys are configured
- ✅ Improved error messages to be more user-friendly
- ✅ Added empty response handling

## Testing After Deployment

1. Open the website and click the chat button
2. Send a test message like "hello"
3. You should receive an intelligent response from the AI
4. Check the Supabase Dashboard > Edge Functions > Logs to verify the function is being called

## Current Configuration

- **Supabase Project**: `yqhfuupiffhejocltowt`
- **Function Name**: `marine-chat`
- **Frontend URL**: The React app is configured correctly
- **API Keys Needed**: Either OPENAI_API_KEY or GEMINI_API_KEY

## Status

- ✅ Frontend code fixed and tested
- ✅ Backend function code updated
- ⏳ Awaiting deployment to Supabase
- ⏳ Awaiting API key configuration

## Next Steps

1. Deploy the updated function to Supabase
2. Set up either OpenAI or Gemini API key as a function secret
3. Test the chatbot on the live site
4. Monitor Supabase logs for any issues
