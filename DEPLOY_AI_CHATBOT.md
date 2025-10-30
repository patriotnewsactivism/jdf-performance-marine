# Deploy AI Chatbot - Quick Guide

## Current Status
❌ The edge function is deployed but returning 500 errors
✅ The code has been fixed and is ready to deploy

## Deploy in 3 Simple Steps

### Step 1: Get Your Supabase Access Token
Go to: https://supabase.com/dashboard/account/tokens
- Click "Generate new token"
- Copy the token

### Step 2: Get an AI API Key (Choose ONE)

**Option A - OpenAI (Recommended, $5 credit for new users)**
- Go to: https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy the key (starts with `sk-`)

**Option B - Google Gemini (Free tier available)**
- Go to: https://aistudio.google.com/apikey
- Click "Create API key"
- Copy the key

### Step 3: Run These Commands

Open your terminal and run:

```bash
# Set your Supabase access token
export SUPABASE_ACCESS_TOKEN='your_token_here'

# Link to the project
npx supabase link --project-ref yqhfuupiffhejocltowt

# Set your AI API key (choose ONE)
# For OpenAI:
npx supabase secrets set OPENAI_API_KEY='your_openai_key_here'

# OR for Gemini:
npx supabase secrets set GEMINI_API_KEY='your_gemini_key_here'

# Deploy the function
npx supabase functions deploy marine-chat
```

## Done!

The chatbot will now work on your website. Test it by:
1. Opening your website
2. Clicking the chat button
3. Sending a message

## Troubleshooting

If the chatbot still doesn't work:
1. Check the logs: https://supabase.com/dashboard/project/yqhfuupiffhejocltowt/functions/marine-chat/logs
2. Make sure your API key is valid and has credits/quota
3. Try redeploying with: `npx supabase functions deploy marine-chat`
