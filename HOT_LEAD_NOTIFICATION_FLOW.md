# 🔥 Hot Lead Notification Flow

## Overview
When the chatbot identifies a **HOT LEAD**, it immediately sends a notification to the designated business email/person so they can respond within 2 hours.

---

## What Makes a Lead "HOT"?

The system automatically qualifies a lead as **HOT** when it detects:

### 1. **Critical/Urgent Equipment Issues**
- "My engine blew up"
- "Boat broke down"
- "Won't start"
- "Emergency"
- "Not working"
- "Failed"
- "Damaged"

### 2. **Confirmed Interest** 
When customer says "yes", "sure", "ok" after discussing service:
```
Bot: "Would you like to schedule an appointment?"
Customer: "yes"
→ HOT LEAD 🔥
```

### 3. **Multiple Buying Signals + Contact Info**
- Asking for quotes
- Scheduling appointments
- Requesting pricing
- Saying "ASAP" or "urgent"
- Multiple service inquiries

---

## The Automatic Flow

```
┌─────────────────────────────────────────────────────────┐
│  Customer: "My engine blew up"                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  🤖 AI detects "blew up" = CRITICAL indicator           │
│  → Immediately asks for phone number                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Customer: "555-1234"                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  🤖 Immediately asks for email                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Customer: "matt@email.com"                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  💾 System saves to database:                            │
│     - Name: Matt                                         │
│     - Phone: 555-1234                                    │
│     - Email: matt@email.com                              │
│     - Lead Score: HOT 🔥                                 │
│     - Full conversation transcript                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  📧 IMMEDIATE EMAIL NOTIFICATION TO:                     │
│     JDFperformancemarine@gmail.com                      │
│                                                           │
│  Subject: 🔥🔥🔥 HOT Lead - Matt - ⏰ RESPOND WITHIN 2 HOURS │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  🤖 Bot tells customer:                                  │
│  "Perfect! I have your information. Our service team     │
│   will reach out to you within a couple hours to get     │
│   you taken care of."                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  👤 BUSINESS ACTION REQUIRED:                            │
│     Contact Matt at 555-1234 or matt@email.com          │
│     within 2 HOURS                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Email Notification Contents

When you receive a hot lead notification, it includes:

### Header
- 🔥🔥🔥 Visual indicator that it's HOT
- Customer name
- ⏰ RESPOND WITHIN 2 HOURS

### Lead Score Section
- **HOT** badge (red)
- Assessment notes (what triggered the hot lead)
- "Follow-up Required: ✅ YES - Contact ASAP"

### Customer Information
- 📛 Name
- 📧 Email (clickable mailto link)
- 📞 Phone (clickable tel link)
- ⚠️ Warning if any info is missing

### Conversation Transcript
- Full conversation showing exactly what the customer said
- Color-coded (blue for customer, gray for AI)
- Easy to read format

### Urgent Action Box
```
⏰ URGENT - ACTION REQUIRED NOW
Contact this lead within 2 hours for best results!
```

### Quick Action Buttons
- 📧 **Send Email** - Opens email client
- 📞 **Call Now** - Opens dialer on mobile

### Metadata
- Conversation ID (for reference)
- Timestamp
- Session tracking info

---

## Response Time Expectations

### What Customer is Told
- HOT leads: **"within a couple hours"**
- WARM leads: **"soon"** or **"today"**

### What You Should Do
- **HOT leads**: Respond within 2 hours
- **WARM leads**: Respond same day or next business day

### Why 2 Hours Matters
Research shows:
- Responding within 1-2 hours = **60% higher conversion**
- Responding within 5 minutes = **100x more likely to contact lead**
- After 24 hours = lead quality drops significantly

---

## Notification Settings

### Current Configuration
```env
BUSINESS_EMAIL=JDFperformancemarine@gmail.com
BUSINESS_PHONE=845-787-4241
RESEND_API_KEY=[configured for email notifications]
```

### Notification Rules
| Lead Type | Has Contact Info | Notification Sent? |
|-----------|------------------|-------------------|
| HOT       | Yes              | ✅ Immediate       |
| HOT       | No               | ✅ Immediate (alerts to missing info) |
| WARM      | Yes + Follow-up needed | ✅ Immediate |
| WARM      | No               | ❌ Saved but no notification |
| COLD      | Any              | ❌ Saved but no notification |

---

## Checking for Missed Leads

### Email Check
1. Search inbox for: `subject:HOT Lead`
2. Look for unread messages with 🔥🔥🔥
3. Check spam folder (add leads@jdfmarine.com to contacts)

### Database Check
```sql
-- Today's hot leads
SELECT user_name, user_phone, user_email, lead_notes, created_at
FROM conversations
WHERE lead_score = 'hot'
  AND created_at > CURRENT_DATE
ORDER BY created_at DESC;

-- Hot leads not yet followed up
SELECT user_name, user_phone, user_email, lead_notes, created_at
FROM conversations
WHERE lead_score = 'hot'
  AND follow_up_required = true
  AND follow_up_completed = false
ORDER BY created_at DESC;
```

### Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor"
4. Select `conversations` table
5. Filter: `lead_score = 'hot'`
6. Sort by: `created_at DESC`

---

## Mobile Notifications (Future)

Currently set up for email only. Future enhancements could include:

### SMS Notifications
- Twilio integration for text alerts
- Immediate SMS when hot lead comes in
- Example: "🔥 HOT LEAD: Matt needs engine repair. Call 555-1234"

### Slack/Discord
- Direct message to service manager
- Channel alerts for hot leads
- Bot integration for quick responses

### Phone Call
- Automated voice notification
- "You have a new hot lead from Matt..."

---

## Testing the System

### Test Hot Lead Scenario
1. Open website chatbot
2. Start conversation:
   ```
   You: "Hi, I'm John"
   Bot: "Great to meet you, John! What can I help you with?"
   You: "My boat won't start"
   Bot: [Should ask for phone number]
   You: "555-1234"
   Bot: [Should ask for email]
   You: "john@test.com"
   Bot: [Should confirm and say "within a couple hours"]
   ```
3. Check email: JDFperformancemarine@gmail.com
4. Should receive: "🔥🔥🔥 HOT Lead - John - ⏰ RESPOND WITHIN 2 HOURS"

### Verify in Database
```sql
SELECT * FROM conversations
WHERE user_name = 'John'
ORDER BY created_at DESC
LIMIT 1;
```

Should show:
- `lead_score` = 'hot'
- `follow_up_required` = true
- `notification_sent` = true

---

## Troubleshooting

### Not Receiving Notifications?

**Check 1: RESEND_API_KEY configured?**
```bash
# In Supabase dashboard → Settings → Edge Functions → Secrets
# Verify RESEND_API_KEY is set
```

**Check 2: Email in spam?**
- Add `leads@jdfmarine.com` to contacts
- Check spam folder
- Whitelist domain: `*.jdfmarine.com`

**Check 3: Check Supabase logs**
```
Dashboard → Logs → Edge Functions → marine-chat
Look for: "🚨 Sending HOT lead notification"
```

**Check 4: Database notifications table**
```sql
SELECT * FROM lead_notifications
ORDER BY sent_at DESC
LIMIT 10;
```
Look at `status` column - should be 'sent', not 'failed'

### Lead Not Detected as Hot?

Review the conversation in database:
```sql
SELECT messages, lead_notes, lead_score
FROM conversations
ORDER BY created_at DESC
LIMIT 1;
```

Check if keywords were present:
- Critical: blew up, broken, won't start, emergency, problem
- Hot: service, appointment, schedule, quote, yes (after service discussion)

---

## Best Practices

### ✅ DO
- Check email notifications within 30 minutes
- Respond to hot leads within 2 hours
- Keep your contact info in the notification handy
- Mark leads as contacted in your CRM/system
- Track response times to improve

### ❌ DON'T
- Let hot leads sit overnight
- Assume the customer will call you
- Ignore notification if contact info incomplete (reach out via chatbot)
- Delete notifications before following up

---

## Support

Questions about the notification system?
- Check Supabase logs for errors
- Review database for stored leads
- Test with a sample conversation
- Verify environment variables are set

**System Working? You should see:**
- ✅ Hot leads detected automatically
- ✅ Contact info collected
- ✅ Email notifications sent immediately
- ✅ Conversations saved to database
- ✅ Customer told "within a couple hours"

---

## Summary

🔥 **Hot leads are now automatically:**
1. Detected based on keywords and behavior
2. Contact info collected immediately
3. Saved to database with full conversation
4. Notification sent to JDFperformancemarine@gmail.com
5. Customer told "within a couple hours"

👤 **Your job:**
- Check email notifications regularly
- Respond within 2 hours
- Follow up with customer
- Close the sale!

---

Last Updated: 2025-10-30
Version: 2.0
