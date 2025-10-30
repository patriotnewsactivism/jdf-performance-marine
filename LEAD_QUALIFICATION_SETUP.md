# 🎯 Lead Qualification System - Setup Guide

## Overview

Your AI chatbot is now an intelligent lead qualification system that:
- ✅ Naturally collects customer information (name, email, phone)
- ✅ Qualifies leads as Cold, Warm, or Hot
- ✅ Saves conversations to database
- ✅ Sends email alerts for qualified leads
- ✅ Feels like talking to a real person (varied responses, human-like typing delays)

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Database Migration

Execute the SQL migration to create the necessary tables:

```bash
# If using Supabase CLI (recommended)
supabase db push

# OR manually execute the migration:
# Go to: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/editor
# Copy and paste the contents of: supabase/migrations/20251030_create_conversations_leads.sql
# Click "Run" to execute
```

### Step 2: Configure Email Notifications (Optional but Recommended)

To receive email alerts for hot leads, set up Resend API:

1. **Sign up for Resend**: https://resend.com (Free tier includes 100 emails/day)
2. **Generate API Key**: Go to API Keys section
3. **Add to Supabase Secrets**:
   ```bash
   # Go to: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/settings/functions
   # Add these secrets:
   
   RESEND_API_KEY=re_xxxxx (your Resend API key)
   BUSINESS_EMAIL=JDFperformancemarine@gmail.com (where to send alerts)
   BUSINESS_PHONE=845-787-4241 (optional, for display in emails)
   ```

4. **Verify Domain** (for production):
   - In Resend dashboard, add and verify your domain
   - Update the "from" address in the edge function if needed

### Step 3: Redeploy Edge Function

Deploy the updated edge function with lead qualification:

```bash
supabase functions deploy marine-chat --no-verify-jwt
```

---

## 📊 How It Works

### Information Collection Strategy

The AI uses natural conversation to collect information:

1. **First Message**: Asks who it's speaking with
   - *"Hi there! I'm the AI assistant for J.D.F. Performance Marine. Who do I have the pleasure of helping today?"*

2. **During Conversation**: Naturally requests contact info when appropriate
   - *"I'd love to send you specific details. What's the best email to reach you at?"*
   - *"Let me have our service manager give you a call. What's the best number?"*

3. **Pattern Recognition**: Automatically extracts information from messages
   - Email addresses (john@email.com)
   - Phone numbers (845-787-4241, 845.787.4241, (845) 787-4241)
   - Names ("My name is John", "I'm John", "This is John")

### Lead Scoring System

**🔥 HOT LEAD** (Immediate Follow-up Required)
- Shows immediate interest or urgency
- Has provided contact information
- Keywords: "need service", "schedule", "appointment", "how much", "quote"
- Action: Email alert sent immediately with full conversation

**⚠️ WARM LEAD** (Follow-up Recommended)
- Asking detailed questions
- Shows interest but less urgency
- Has provided some contact information
- Keywords: "tell me more", "looking for", "considering", "planning"
- Action: Email alert sent if contact info provided

**❄️ COLD LEAD** (No Immediate Action)
- General browsing or casual questions
- No contact information provided
- Action: Conversation logged but no alert sent

### Human-Like Behavior

**Varied Responses**: 
- AI never gives identical responses twice
- Uses different greetings, phrasings, and expressions
- Occasional conversational fillers (20% of responses)
- Temperature: 0.85, Presence Penalty: 0.6

**Realistic Typing Delays**:
- Initial delay: 800-1500ms (thinking time)
- Typing speed: ~150ms per word (40 WPM)
- Maximum delay: 4 seconds (capped)
- Random variation: +0-1 second per response

---

## 📧 Email Alert Format

When a hot or warm lead is detected, you'll receive a beautiful HTML email with:

### Email Contents:
- **Lead Score Badge**: Visual indicator (🔥 HOT or ⚠️ WARM)
- **Assessment**: AI's analysis of the lead quality
- **Customer Information**: Name, email, phone (if collected)
- **Conversation Excerpt**: Recent messages showing context
- **Quick Action Buttons**: Click to email or call directly
- **Conversation ID**: For tracking in database

### Example Subject Lines:
- 🔥🔥🔥 HOT Lead Alert - John Smith
- ⚠️ WARM Lead Alert - New Customer

---

## 💾 Database Schema

### `conversations` table
Stores all chat interactions with lead information:

```sql
- id (UUID): Unique conversation ID
- session_id (TEXT): Browser session identifier
- created_at/updated_at (TIMESTAMPTZ): Timestamps
- user_name (TEXT): Customer's name
- user_email (TEXT): Customer's email
- user_phone (TEXT): Customer's phone
- lead_score (TEXT): 'cold', 'warm', or 'hot'
- lead_notes (TEXT): AI's assessment
- messages (JSONB): Full conversation history
- follow_up_required (BOOLEAN): Needs attention
- follow_up_completed (BOOLEAN): Tracking status
- notification_sent (BOOLEAN): Alert sent flag
```

### `lead_notifications` table
Tracks all notifications sent:

```sql
- id (UUID): Notification ID
- conversation_id (UUID): Links to conversation
- notification_type (TEXT): 'email', 'sms', or 'both'
- sent_at (TIMESTAMPTZ): When sent
- sent_to (TEXT): Recipient
- status (TEXT): 'pending', 'sent', or 'failed'
- error_message (TEXT): If failed
```

---

## 🔍 Monitoring & Management

### View Conversations

Query your leads in Supabase:

```sql
-- All hot leads requiring follow-up
SELECT * FROM conversations 
WHERE lead_score = 'hot' 
AND follow_up_required = true 
ORDER BY created_at DESC;

-- Warm leads with contact info
SELECT * FROM conversations 
WHERE lead_score = 'warm' 
AND (user_email IS NOT NULL OR user_phone IS NOT NULL)
ORDER BY created_at DESC;

-- Leads from today
SELECT * FROM conversations 
WHERE created_at >= CURRENT_DATE
ORDER BY 
  CASE lead_score 
    WHEN 'hot' THEN 1 
    WHEN 'warm' THEN 2 
    ELSE 3 
  END;
```

### Check Notification Status

```sql
-- See all sent notifications
SELECT n.*, c.user_name, c.user_email, c.lead_score
FROM lead_notifications n
JOIN conversations c ON n.conversation_id = c.id
ORDER BY n.sent_at DESC;

-- Failed notifications
SELECT * FROM lead_notifications 
WHERE status = 'failed'
ORDER BY sent_at DESC;
```

### Mark Follow-ups as Complete

```sql
-- After contacting a lead
UPDATE conversations 
SET follow_up_completed = true 
WHERE id = 'conversation-id-here';
```

---

## 🎨 Customization Options

### Adjust Lead Scoring Sensitivity

Edit `/workspace/supabase/functions/marine-chat/index.ts`:

```typescript
// Current: 2+ hot indicators + contact = HOT
// More aggressive: 1+ hot indicator + contact = HOT
if (hotCount >= 1 && hasContactInfo) {
  score = "hot";
  // ...
}

// More conservative: 3+ hot indicators required
if (hotCount >= 3 && hasContactInfo) {
  score = "hot";
  // ...
}
```

### Change Email Recipient

Update Supabase secret `BUSINESS_EMAIL`:
```bash
BUSINESS_EMAIL=your-email@domain.com
```

### Modify AI Personality

Edit the system prompt in the edge function to adjust:
- Tone and style
- Information gathering approach
- Response length preferences
- Technical vs. casual language balance

### Adjust Typing Speed

In `/workspace/src/components/ChatBot.tsx`:

```typescript
// Current: 150ms per word (40 WPM)
const baseTypingTime = Math.min(wordCount * 150, 4000);

// Faster: 100ms per word (60 WPM)
const baseTypingTime = Math.min(wordCount * 100, 3000);

// Slower: 200ms per word (30 WPM)
const baseTypingTime = Math.min(wordCount * 200, 5000);
```

---

## 🧪 Testing the System

### Test Lead Qualification

Try these conversation scenarios:

**Hot Lead Test:**
```
User: "Hi, I need to schedule a tune-up for my boat"
AI: [Asks for details]
User: "My name is John Smith, email is john@test.com"
AI: [Continues conversation]
Result: ✅ Should trigger HOT lead alert with email
```

**Warm Lead Test:**
```
User: "I'm considering getting my engine rebuilt"
AI: [Asks questions]
User: "I'm Sarah, you can reach me at sarah@test.com"
Result: ✅ Should trigger WARM lead alert with email
```

**Cold Lead Test:**
```
User: "What services do you offer?"
AI: [Lists services]
User: "Thanks for the info"
Result: ✅ Logged but no alert (no contact info + low engagement)
```

### Verify Database Storage

After test conversations, check Supabase:

```sql
SELECT 
  user_name, 
  user_email, 
  lead_score, 
  follow_up_required,
  notification_sent,
  created_at
FROM conversations 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Email Delivery

1. Monitor Resend dashboard for delivery status
2. Check spam folder if not receiving emails
3. Verify `BUSINESS_EMAIL` is correct in Supabase secrets
4. Look at `lead_notifications` table for send status

---

## 🛠️ Troubleshooting

### Emails Not Sending

**Check API Key:**
```bash
# Verify in Supabase dashboard:
# Settings > Edge Functions > Secrets
# Should see: RESEND_API_KEY=re_xxxxx
```

**Check Function Logs:**
```bash
# View real-time logs
supabase functions logs marine-chat --follow

# Or in dashboard:
# https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/functions/marine-chat/logs
```

**Common Issues:**
- ❌ API key not set → No emails sent, check secrets
- ❌ Invalid from address → Verify domain in Resend
- ❌ Lead not hot enough → Review lead scoring thresholds
- ❌ No contact info → AI couldn't extract or user didn't provide

### Information Not Being Extracted

**Check extraction patterns** in edge function:
- Email regex: `/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g`
- Phone regex: `/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g`
- Name patterns: Looks for "my name is", "I'm", "this is", etc.

**Improve extraction:**
- Add more name patterns for edge cases
- Adjust regex for international phone numbers
- Add validation for extracted data

### Database Connection Issues

**Verify environment variables:**
```typescript
// In edge function, these must be set:
SUPABASE_URL=https://pqicjnzddgtojxubftgw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey... (from dashboard)
```

**Check RLS policies:**
```sql
-- Service role should have full access
-- Verify policies exist in database
SELECT * FROM pg_policies WHERE tablename = 'conversations';
```

---

## 📈 Best Practices

### Follow-up Timing

Research shows optimal contact times:
- **Hot Leads**: Contact within 1 hour (highest conversion)
- **Warm Leads**: Contact within 24 hours
- **Cold Leads**: Add to newsletter/drip campaign

### Conversation Management

1. **Review Daily**: Check new conversations each morning
2. **Prioritize**: Hot → Warm → Cold
3. **Track Follow-ups**: Use `follow_up_completed` flag
4. **Analyze Patterns**: Look for common questions/concerns

### AI Training

Monitor conversations to improve:
- **Low-quality leads getting scored high**: Adjust indicators
- **Missing contact info**: Review AI prompts for collection
- **Repetitive responses**: Already handled with variation system
- **Wrong tone**: Adjust system prompt personality

---

## 🔐 Security & Privacy

### Data Protection

- All conversations encrypted at rest in Supabase
- RLS policies prevent unauthorized access
- Service role key kept in secure secrets
- Email API keys not exposed to frontend

### GDPR/Privacy Compliance

**Important**: Add to your privacy policy:
- Inform users that conversations are recorded
- Explain data is used for service improvement
- Provide contact information deletion option
- Include data retention policy

**Add to chatbot (optional):**
```typescript
// In initial greeting:
"Note: This conversation may be recorded to improve our service."
```

---

## 📞 Support

### Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw
- **Function Logs**: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/functions/marine-chat/logs
- **Database Editor**: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/editor
- **Resend Dashboard**: https://resend.com/emails

### Need Help?

If you run into issues:
1. Check function logs for errors
2. Verify all environment variables are set
3. Test with simple conversations first
4. Review database to confirm data is saving

---

## ✨ Success Metrics to Track

Monitor these KPIs:
- **Total Conversations**: Growth over time
- **Lead Quality**: Hot vs Warm vs Cold ratio
- **Contact Info Collection Rate**: % of convos with email/phone
- **Response Time**: How fast you follow up with hot leads
- **Conversion Rate**: Leads → Customers

### Sample Dashboard Query

```sql
-- Weekly lead summary
SELECT 
  DATE_TRUNC('week', created_at) as week,
  lead_score,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE user_email IS NOT NULL) as with_email,
  COUNT(*) FILTER (WHERE user_phone IS NOT NULL) as with_phone
FROM conversations
WHERE created_at >= NOW() - INTERVAL '4 weeks'
GROUP BY week, lead_score
ORDER BY week DESC, lead_score;
```

---

🎉 **You're all set!** Your AI chatbot is now an intelligent lead qualification system that will help you capture and convert more customers while providing an excellent experience.
