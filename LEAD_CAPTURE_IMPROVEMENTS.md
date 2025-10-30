# Lead Capture System - Improvements

## Problem Statement

The chatbot was missing valuable leads by not collecting contact information. Example conversation:

**Previous Behavior:**
```
User: "My engine blew up"
Bot: [Provided advice]
User: "Yes" (to scheduling)
Bot: "Please call us at 845-787-4241"
Result: ❌ Lead lost - no contact info collected
```

**Desired Behavior:**
```
User: "My engine blew up" 
Bot: "I'm sorry to hear that! Let me make sure our team reaches out right away. What's the best phone number to contact you?"
User: "555-1234"
Bot: "And your email address?"
User: "matt@email.com"
Result: ✅ Lead captured with full contact info
```

---

## Key Improvements

### 1. **Enhanced System Prompt** 
The AI now has a **mandatory contact collection protocol**:

- **Step 1:** Get their name
- **Step 2:** Understand their needs  
- **Step 3:** Immediately ask for phone when service interest is shown
- **Step 4:** Immediately ask for email after phone
- **Step 5:** Confirm and set expectations

**Critical Rules Added:**
- NEVER just say "call us" without getting THEIR contact info first
- Frame it as "so we can help you faster"
- Emphasize quick response times ("within a few hours")
- For urgent issues, lead with "our team will call you right away"

### 2. **Smart Contact Info Prompting**
Added intelligent logic that overrides or enhances AI responses:

**Confirmation Detection:**
```typescript
// If user says "yes", "ok", "sure" etc. and we don't have contact info
if (userConfirmedInterest && hasName && (!hasPhone || !hasEmail)) {
  aiResponse = "Perfect! What's the best phone number to reach you at?";
}
```

**Proactive Follow-up:**
```typescript
// For hot/warm leads after 3+ messages without contact info
if (isHotOrWarmLead && messageCount >= 3 && missingContactInfo) {
  aiResponse += "\n\nSo I can have our team follow up, what's your phone number?";
}
```

### 3. **Improved Lead Qualification**

**New Tier: CRITICAL Indicators (Always HOT)**
```typescript
const criticalIndicators = [
  "broke down", "broken", "blew up", "not working", 
  "won't start", "emergency", "problem", "repair", "fix"
];
```

These are **immediate hot leads** that trigger urgent notifications.

**Enhanced Scoring Logic:**
- 🔥 **HOT**: Critical issues, confirmed interest, or multiple buying signals
- ⚠️ **WARM**: Service interest, researching, asking questions
- 🧊 **COLD**: General browsing

**Example: Matt's Conversation Would Now Trigger:**
```
Critical indicators found: "blew up"
Hot indicators found: "service"  
Confirmation indicators found: "yes"
→ Result: HOT LEAD 🔥
```

### 4. **Enhanced Notifications**

**Hot leads now trigger notifications even WITHOUT full contact info** to alert the business about missed opportunities:

```typescript
// Alert on hot leads regardless of contact info
const shouldNotify = leadQualification.score === 'hot' || 
                     (hasContactInfo && requiresFollowUp);
```

**Notification Includes:**
- Lead score (HOT/WARM) with visual indicators 🔥⚠️
- Customer information (whatever was collected)
- ⚠️ Warning if contact info is missing
- Full conversation transcript
- Timestamp and urgency indicators

---

## How It Works Now

### Scenario: Customer with Engine Problem

```
Message 1:
User: "Hi"
Bot: "Hi there! I'm the AI assistant for J.D.F. Performance Marine. 
      Who do I have the pleasure of helping today?"

Message 2:
User: "I'm Matt"
Bot: "Great to meet you, Matt! What can I help you with today?"

Message 3:
User: "My engine blew up"
Bot: "I'm sorry to hear that, Matt! Let me make sure our team can 
      reach out to you right away. What's the best phone number to 
      contact you at?"

[SYSTEM: Detected "blew up" → CRITICAL/HOT indicator]

Message 4:
User: "555-1234"
Bot: "Perfect! And what's your email address so we can send you 
      confirmation and details?"

[SYSTEM: Phone extracted → 555-1234]

Message 5:
User: "matt@email.com"
Bot: "Excellent! We have Matt at 555-1234 and matt@email.com. 
      Our team will reach out within 24 hours or sooner for urgent 
      matters. Is there anything else I can help you understand?"

[SYSTEM: Email extracted → matt@email.com]
[SYSTEM: Lead qualified as HOT 🔥]
[SYSTEM: Notification sent to business]
[SYSTEM: Conversation saved to database]
```

### What Gets Saved

**Database Record:**
```json
{
  "session_id": "session_123...",
  "user_name": "Matt",
  "user_email": "matt@email.com",
  "user_phone": "555-1234",
  "lead_score": "hot",
  "lead_notes": "🔥 URGENT: Customer has critical equipment issue requiring immediate attention. Contact info collected.",
  "follow_up_required": true,
  "notification_sent": true,
  "messages": [...full conversation...],
  "conversation_summary": "Customer Matt reported engine failure (blew up). Hot lead with contact info collected."
}
```

**Email Notification Sent To Business:**
- Subject: 🔥🔥🔥 HOT Lead Alert - Matt
- Customer: Matt
- Phone: 555-1234
- Email: matt@email.com  
- Issue: Engine failure (urgent)
- Full conversation transcript
- Action required: Contact ASAP

---

## Lead Temperature Guide

### 🔥 HOT LEADS (Immediate Action Required)
**Triggers:**
- Critical equipment issues (broke down, won't start, blew up, etc.)
- Confirmed interest after service discussion (said "yes" to appointment)
- Multiple buying signals + contact info

**Business Action:**
- Contact within 2 hours (customer is told "within a couple hours")
- Prioritize over warm leads
- Notification sent IMMEDIATELY to designated employee/admin

### ⚠️ WARM LEADS (Follow-up Needed)
**Triggers:**
- Service interest with contact info
- Researching options with contact info
- Multiple questions about services

**Business Action:**
- Contact within 24 hours
- Send detailed information
- Nurture the relationship

### 🧊 COLD LEADS (Low Priority)
**Triggers:**
- General browsing
- Single question
- No service interest indicated

**Business Action:**
- No immediate follow-up needed
- May convert to warm/hot in same conversation

---

## Viewing Leads

### Check Leads in Supabase Dashboard

1. Open Supabase Dashboard
2. Go to Table Editor → `conversations`
3. Filter by:
   - `lead_score = 'hot'` for urgent leads
   - `follow_up_required = true` for all leads needing attention
   - `notification_sent = false` for leads that didn't trigger notifications

### SQL Query for Today's Hot Leads
```sql
SELECT 
  user_name,
  user_email,
  user_phone,
  lead_score,
  lead_notes,
  created_at
FROM conversations
WHERE lead_score = 'hot'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## Testing the System

### Test Scenario 1: Hot Lead with Contact Info ✅
```
1. "Hi, I'm John"
2. "My boat won't start"
3. [Bot asks for phone]
4. "555-1234"  
5. [Bot asks for email]
6. "john@email.com"

Expected: HOT lead, notification sent, full contact info saved
```

### Test Scenario 2: Confirmed Interest ✅
```
1. "I'm Sarah"
2. "I need a tune-up"
3. [Bot asks if they want to schedule]
4. "Yes"
5. [Bot immediately asks for phone]
6. "555-5678"

Expected: HOT lead detected after "yes", contact info collected
```

### Test Scenario 3: Warm Lead Research ✅
```
1. "I'm Mike"  
2. "Tell me about your services"
3. [Bot explains services]
4. "How much for an oil change?"
5. [Bot offers to send quote, asks for email]
6. "mike@email.com"

Expected: WARM lead, notification sent, contact info saved
```

---

## Configuration

### Environment Variables Required

```bash
# AI Service (at least one required)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Database
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Notifications (optional but recommended)
RESEND_API_KEY=re_...
BUSINESS_EMAIL=JDFperformancemarine@gmail.com
BUSINESS_PHONE=845-787-4241
```

### Notification Settings

Notifications are sent via email using [Resend](https://resend.com). To enable:

1. Sign up at resend.com
2. Verify your sending domain
3. Get API key
4. Set `RESEND_API_KEY` environment variable

**Without RESEND_API_KEY:** Leads are still saved to database but no email alerts sent.

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Lead Capture Rate**
   ```sql
   SELECT 
     lead_score,
     COUNT(*) as count,
     SUM(CASE WHEN user_email IS NOT NULL THEN 1 ELSE 0 END) as with_email,
     SUM(CASE WHEN user_phone IS NOT NULL THEN 1 ELSE 0 END) as with_phone
   FROM conversations
   WHERE created_at > NOW() - INTERVAL '7 days'
   GROUP BY lead_score;
   ```

2. **Contact Info Collection Rate**
   ```sql
   SELECT 
     COUNT(*) as total_leads,
     SUM(CASE WHEN user_email IS NOT NULL AND user_phone IS NOT NULL THEN 1 ELSE 0 END) as complete_info,
     ROUND(100.0 * SUM(CASE WHEN user_email IS NOT NULL AND user_phone IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
   FROM conversations
   WHERE lead_score IN ('hot', 'warm')
     AND created_at > NOW() - INTERVAL '7 days';
   ```

3. **Response Time** (manual tracking recommended)
   - How fast are hot leads contacted?
   - Target: < 2 hours for hot leads (customers are promised "within a couple hours")
   - Notifications are sent IMMEDIATELY when lead is qualified

---

## Future Improvements

### Potential Enhancements
- [ ] SMS notifications via Twilio for hot leads
- [ ] CRM integration (HubSpot, Salesforce, etc.)
- [ ] Automated follow-up sequences
- [ ] Lead scoring ML model based on conversion data
- [ ] Multi-language support
- [ ] Voice integration for phone leads
- [ ] Calendar integration for automatic appointment booking

### A/B Testing Ideas
- Different contact collection approaches
- Timing of contact info requests
- Incentives for providing contact info
- Response time impact on conversion

---

## Support

For issues or questions:
- Check Supabase logs: Dashboard → Logs → Edge Functions
- Review conversation data: Table Editor → conversations
- Test the chatbot: Visit website and interact
- Contact: developer@jdfmarine.com

## Change Log

**Version 2.0 (Current)**
- ✅ Enhanced system prompt with mandatory contact collection
- ✅ Smart confirmation detection
- ✅ Improved lead qualification with critical indicators
- ✅ Notifications for hot leads even without complete info
- ✅ Better conversation tracking

**Version 1.0 (Previous)**
- Basic chatbot functionality
- Passive lead tracking
- Regex-based contact extraction
- Limited lead qualification
