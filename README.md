# J.D.F. Performance Marine Web App

A modern, high-performance website for J.D.F. Performance Marine featuring an intelligent AI chatbot with lead qualification capabilities.

## ✨ Key Features

- 🎨 Beautiful, responsive design with Tailwind CSS + shadcn/ui
- 🤖 **AI-Powered Chatbot with Lead Qualification**
- 📊 Automatic lead scoring (Cold/Warm/Hot)
- 📧 Email notifications for qualified leads
- 💾 Conversation storage and tracking
- 🧠 Natural information collection (name, email, phone)
- ⚡ Real-time, human-like interactions

## Getting started

Prerequisites:
- Node.js 18+ and npm

Install dependencies:
```sh
npm install
```

Run dev server:
```sh
npm run dev
```

Build for production:
```sh
npm run build
```

Preview production build:
```sh
npm run preview
```

## 📈 Lead Management

### View Leads in Database

```sql
-- Hot leads needing follow-up
SELECT user_name, user_email, lead_score, created_at
FROM conversations 
WHERE lead_score = 'hot' AND follow_up_required = true
ORDER BY created_at DESC;
```

**More queries:** See `supabase/view_leads.sql`

### Daily Workflow

1. **Morning**: Check hot leads from overnight
2. **Respond**: Contact hot leads within 1 hour
3. **Track**: Mark leads as contacted in database
4. **Analyze**: Review weekly lead quality trends

## 🎯 Success Metrics

Track these KPIs:
- **Contact Info Collection Rate**: Target 60%+
- **Hot Lead %**: Target 15-25%
- **Response Time**: Target <1 hour for hot leads
- **Lead → Customer**: Target 40%+ for hot leads

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env`):
```env
VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here
```

**Backend** (Supabase Secrets):
```
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re-... (optional)
BUSINESS_EMAIL=JDFperformancemarine@gmail.com (optional)
```

### Customization

**Adjust Lead Scoring:**
Edit `supabase/functions/marine-chat/index.ts` - `qualifyLead()` function

**Change AI Personality:**
Edit system prompt in `supabase/functions/marine-chat/index.ts`

**Modify Typing Speed:**
Edit delays in `src/components/ChatBot.tsx` - `handleSend()` function

## 🧪 Testing

### Test Hot Lead Flow
```
1. Open chatbot
2. Say: "I need to schedule a tune-up ASAP"
3. Provide name and email when asked
4. Check email for lead alert
```

### Verify Database
```sql
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5;
SELECT * FROM lead_notifications ORDER BY sent_at DESC LIMIT 5;
```

## 🚨 Troubleshooting

**Chatbot not loading?**
- Check `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env`
- Restart: `npm run dev`

**AI not responding?**
- Check function logs: [Supabase Dashboard](https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/functions/marine-chat/logs)
- Verify `OPENAI_API_KEY` is set

**No email alerts?**
- Verify `RESEND_API_KEY` is set
- Check spam folder
- Review `lead_notifications` table

## 📞 Support

- **Function Logs**: [View Logs](https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/functions/marine-chat/logs)
- **Database**: [Editor](https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/editor)
- **Settings**: [Functions](https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/settings/functions)

## 🎉 What You Get

Your website now includes:

✅ Beautiful, modern design  
✅ AI chatbot that feels human  
✅ Automatic lead qualification  
✅ Email alerts for hot leads  
✅ Full conversation tracking  
✅ Follow-up management system  
✅ Analytics and reporting  

**Result:** Transform website visitors into qualified leads automatically!

## 🚀 Quick Start

### Basic Setup
```sh
npm install
npm run dev
```

### Enable AI Chatbot with Lead Qualification

**5-Minute Setup** - See `QUICK_START.md`

1. **Database**: `supabase db push`
2. **Deploy**: `supabase functions deploy marine-chat --no-verify-jwt`
3. **Emails** (optional): Add `RESEND_API_KEY` to Supabase secrets

**That's it!** Your chatbot now collects leads automatically.

## 📚 Documentation

### Chatbot & Lead Qualification
- **`QUICK_START.md`** - Get running in 5 minutes ⚡
- **`CHATBOT_SETUP.md`** - Complete setup guide
- **`LEAD_QUALIFICATION_SETUP.md`** - Detailed system documentation
- **`FEATURES_SUMMARY.md`** - Full feature overview
- **`DEPLOYMENT_CHECKLIST.md`** - Production deployment guide
- **`supabase/view_leads.sql`** - Database query helpers

### What the Chatbot Does

🎯 **Natural Lead Qualification**
- Collects customer information through conversation
- Automatically extracts name, email, and phone number
- Scores leads as Cold, Warm, or Hot
- Sends email alerts for qualified leads
- Stores full conversation history

💬 **Human-Like Behavior**
- No two responses are identical
- Realistic typing delays (1-4 seconds)
- Natural conversation flow
- Never feels robotic or pushy

📊 **Business Intelligence**
- Track all conversations in database
- Follow-up management system
- Lead scoring analytics
- Email notification tracking

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks

### Backend
- **Platform**: Supabase
- **Edge Functions**: Deno runtime
- **AI**: OpenAI GPT-4o-mini / Gemini fallback
- **Database**: PostgreSQL (Supabase)
- **Email**: Resend API

### Features
- Real-time chat with AI
- Lead qualification system
- Email notifications
- Conversation storage
- Analytics tracking
