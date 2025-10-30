# Email Configuration for Lead Notifications

## Current Configuration (Testing)

**Notification Email:** `patriotnewsactivism@gmail.com`

This is set for **testing purposes only**. All hot lead notifications will be sent to this address.

---

## Changing to Production Email

When you're ready to go live, change the notification email to the business email:

### Option 1: Update Environment Variable (Recommended)

1. Go to Supabase Dashboard
2. Navigate to: **Settings** → **Edge Functions** → **Secrets**
3. Add/Update the secret:
   - Name: `BUSINESS_EMAIL`
   - Value: `JDFperformancemarine@gmail.com`
4. Click **Save**
5. The function will automatically use this email

### Option 2: Update the Code

1. Open `/workspace/supabase/functions/marine-chat/index.ts`
2. Find the line (around line 192):
   ```typescript
   const BUSINESS_EMAIL = Deno.env.get("BUSINESS_EMAIL") || "patriotnewsactivism@gmail.com";
   ```
3. Change to:
   ```typescript
   const BUSINESS_EMAIL = Deno.env.get("BUSINESS_EMAIL") || "JDFperformancemarine@gmail.com";
   ```
4. Deploy the updated function

---

## Testing the Notification System

### Test Conversation
1. Open the website with the chatbot
2. Start a conversation:
   ```
   You: "I'm John Test"
   Bot: [Asks what you need]
   You: "My engine blew up"
   Bot: [Asks for phone]
   You: "555-1234"
   Bot: [Asks for email]
   You: "test@example.com"
   Bot: [Confirms within couple hours]
   ```

3. **Check your email:** `patriotnewsactivism@gmail.com`
   - Subject: `🔥🔥🔥 HOT Lead - John Test - ⏰ RESPOND WITHIN 2 HOURS`
   - Should arrive within seconds

### Verify in Database
```sql
SELECT 
  user_name, 
  user_email, 
  user_phone, 
  lead_score, 
  notification_sent,
  created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 5;
```

### Check Notification Log
```sql
SELECT 
  sent_to,
  status,
  sent_at,
  error_message
FROM lead_notifications
ORDER BY sent_at DESC
LIMIT 5;
```

---

## Current Setup Summary

| Setting | Current Value | Production Value |
|---------|---------------|------------------|
| Notification Email | patriotnewsactivism@gmail.com | JDFperformancemarine@gmail.com |
| Business Phone | 845-787-4241 | 845-787-4241 |
| From Address | leads@jdfmarine.com | leads@jdfmarine.com |

---

## Important Notes

1. **Email Deliverability:**
   - Make sure `patriotnewsactivism@gmail.com` has `leads@jdfmarine.com` whitelisted
   - Check spam folder if you don't receive notifications
   - Gmail may flag automated emails initially

2. **Response Time:**
   - Notifications are sent **immediately** when a hot lead is qualified
   - Typically arrives within 5-10 seconds

3. **Multiple Recipients (Future):**
   - You can send to multiple emails by updating the code to:
     ```typescript
     to: ["patriotnewsactivism@gmail.com", "JDFperformancemarine@gmail.com"]
     ```

4. **Switching Back:**
   - When testing is complete, simply update the environment variable or code
   - No need to redeploy if using environment variables

---

## Troubleshooting

### Not Receiving Emails?

**1. Check Spam Folder**
   - Add `leads@jdfmarine.com` to Gmail contacts
   - Mark as "Not Spam" if found there

**2. Verify Resend API Key**
   - Go to Supabase Dashboard → Settings → Edge Functions → Secrets
   - Confirm `RESEND_API_KEY` is set

**3. Check Supabase Logs**
   ```
   Dashboard → Logs → Edge Functions → marine-chat
   Look for: "🚨 Sending HOT lead notification"
   And: "✅ HOT lead notification sent successfully"
   ```

**4. Check Notification Status in Database**
   ```sql
   SELECT * FROM lead_notifications
   WHERE sent_to = 'patriotnewsactivism@gmail.com'
   ORDER BY sent_at DESC
   LIMIT 5;
   ```
   - If `status` = 'failed', check `error_message` column

---

## Quick Switch Command

When ready to go live, run this in your Supabase SQL editor:

```sql
-- This doesn't change code, but you can track it
UPDATE conversations 
SET lead_notes = CONCAT(lead_notes, ' [Switched to production email]')
WHERE created_at > NOW() - INTERVAL '1 hour';
```

Then update the environment variable as described above.

---

Last Updated: 2025-10-30
Current Mode: **TESTING** 🧪
