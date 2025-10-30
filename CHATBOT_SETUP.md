# AI Chatbot Setup - Complete Guide

## ✅ What's Already Done

1. ✅ Edge function deployed to Supabase project `pqicjnzddgtojxubftgw`
2. ✅ OpenAI API key configured in Supabase secrets
3. ✅ Improved error handling and logging in the edge function
4. ✅ Project configuration updated
5. ✅ **NEW: Lead qualification system with information collection**
6. ✅ **NEW: Database schema for storing conversations**
7. ✅ **NEW: Email notification system for hot leads**
8. ✅ **NEW: Human-like typing delays and response variation**

## 🔧 Setup Steps

### Step 1: Add Your Supabase API Key

1. Go to: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/settings/api
2. Copy the **"anon public"** key (starts with `eyJ...`)
3. Replace the placeholder in `.env`:

```env
VITE_SUPABASE_PUBLISHABLE_KEY="paste_your_actual_key_here"
```

### Step 2: Setup Lead Qualification System (NEW!)

Your chatbot now includes an intelligent lead qualification system. To enable it:

1. **Run the database migration** to create conversation tables:
   ```bash
   supabase db push
   ```
   Or manually execute: `supabase/migrations/20251030_create_conversations_leads.sql`

2. **Configure email notifications** (optional but recommended):
   - Sign up at https://resend.com (free tier)
   - Add API key to Supabase secrets:
     - Go to: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/settings/functions
     - Add secret: `RESEND_API_KEY=re_xxxxx`
     - Add secret: `BUSINESS_EMAIL=JDFperformancemarine@gmail.com`

3. **Redeploy edge function** with new features:
   ```bash
   supabase functions deploy marine-chat --no-verify-jwt
   ```

📚 **See LEAD_QUALIFICATION_SETUP.md for complete documentation**

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

## 🎉 What You Get

Your AI chatbot now includes:

### 🤖 Intelligent Conversations
- Natural, human-like responses that vary each time
- Realistic typing delays (800-4000ms based on message length)
- Knowledgeable about all J.D.F. Performance Marine services

### 📊 Lead Qualification
- Automatically collects customer name, email, and phone number
- Rates leads as Cold, Warm, or Hot based on conversation
- Saves conversations to database for follow-up
- Sends email alerts for qualified hot/warm leads

### 💬 Natural Information Collection
- Asks for name in first interaction
- Naturally requests contact info during conversation
- Extracts information from messages automatically
- Never feels pushy or robotic

### 🔔 Automatic Notifications
- Beautiful HTML email alerts for hot leads
- Includes full conversation context
- Shows customer contact information
- Quick action buttons (call/email)

## 🧪 Test It

Try these scenarios:

**Hot Lead Test:**
1. Open chatbot
2. Say: "I need to schedule a tune-up for my boat"
3. Provide name and email when asked
4. ✅ Should receive email alert with conversation

**Natural Conversation Test:**
1. Have a normal back-and-forth conversation
2. Notice varied responses (never identical)
3. See realistic typing delays
4. ✅ Feels like talking to a real person

## 📊 Monitoring

- **Function Logs**: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/functions/marine-chat/logs
- **Function Editor**: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/functions/marine-chat

## 🛠️ Changes Made

### Edge Function (`supabase/functions/marine-chat/index.ts`)
- ✅ Enhanced error handling - returns 200 with fallback messages instead of 500 errors
- ✅ Detailed logging for debugging
- ✅ Better API error messages
- ✅ Graceful fallbacks when AI APIs fail

### Frontend (`src/components/ChatBot.tsx`)
- ✅ Better error handling
- ✅ User-friendly error messages
- ✅ Fallback messages with contact information

## 🔑 API Keys Used

- **Supabase Project**: `pqicjnzddgtojxubftgw`
- **AI Provider**: OpenAI (GPT-4o-mini)
- **Location**: Keys stored securely in Supabase secrets

---

**Need help?** Check the function logs or contact support.
