# 🚀 Deployment Checklist - Lead Qualification System

Complete these steps to activate your intelligent lead qualification chatbot.

---

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run migration: `supabase db push`
- [ ] Verify tables created: Check `conversations` and `lead_notifications` tables exist
- [ ] Test database connection: Try inserting a test record
- [ ] Verify RLS policies: Check policies are active in Supabase dashboard

**How to verify:**
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM conversations; -- Should return 0 (table exists)
SELECT COUNT(*) FROM lead_notifications; -- Should return 0 (table exists)
```

### 2. Environment Variables
- [ ] Frontend: `VITE_SUPABASE_PUBLISHABLE_KEY` set in `.env`
- [ ] Backend: `SUPABASE_URL` in edge function (auto-set by Supabase)
- [ ] Backend: `SUPABASE_SERVICE_ROLE_KEY` in edge function (auto-set by Supabase)
- [ ] Backend: `OPENAI_API_KEY` or `GEMINI_API_KEY` set in Supabase secrets
- [ ] Backend: `RESEND_API_KEY` set in Supabase secrets (optional but recommended)
- [ ] Backend: `BUSINESS_EMAIL` set in Supabase secrets (optional, defaults to JDFperformancemarine@gmail.com)

**Where to set:**
- Frontend: `/workspace/.env` file
- Backend: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/settings/functions

### 3. Edge Function Deployment
- [ ] Deploy function: `supabase functions deploy marine-chat --no-verify-jwt`
- [ ] Check deployment logs for errors
- [ ] Verify function is listed in Supabase dashboard
- [ ] Test function endpoint with sample request

**Test command:**
```bash
curl -X POST https://pqicjnzddgtojxubftgw.supabase.co/functions/v1/marine-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"message":"Hello","history":[]}'
```

### 4. Email Notification Setup (Optional)
- [ ] Sign up for Resend account: https://resend.com
- [ ] Generate API key in Resend dashboard
- [ ] Add API key to Supabase secrets: `RESEND_API_KEY`
- [ ] Set business email: `BUSINESS_EMAIL`
- [ ] Send test email to verify delivery
- [ ] Check spam folder if not receiving

**Test notification:**
Send a hot lead conversation and verify email arrives.

### 5. Frontend Testing
- [ ] Start dev server: `npm run dev`
- [ ] Open chatbot widget
- [ ] Verify initial greeting appears
- [ ] Send test message
- [ ] Verify typing indicators work
- [ ] Check response appears correctly
- [ ] Test session persistence across messages

---

## 🧪 System Testing

### Test 1: Hot Lead Flow
**Goal:** Verify hot lead detection and notification

**Steps:**
1. Open chatbot
2. Send: "I need to schedule a tune-up for my boat ASAP"
3. Provide name when asked
4. Provide email when asked
5. Continue conversation with urgency keywords

**Expected Results:**
- [ ] AI asks for name naturally
- [ ] AI asks for email/phone
- [ ] Conversation saved to database
- [ ] Lead scored as "hot"
- [ ] Email notification sent
- [ ] Notification logged in database

**Verification:**
```sql
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 1;
SELECT * FROM lead_notifications ORDER BY sent_at DESC LIMIT 1;
```

### Test 2: Warm Lead Flow
**Goal:** Verify warm lead detection

**Steps:**
1. Open chatbot (new session)
2. Send: "I'm looking into getting my engine rebuilt next season"
3. Provide contact info during conversation

**Expected Results:**
- [ ] AI engages professionally
- [ ] Collects contact information
- [ ] Lead scored as "warm"
- [ ] Email sent if configured
- [ ] Conversation saved

### Test 3: Cold Lead Flow
**Goal:** Verify cold leads are logged but not alerted

**Steps:**
1. Open chatbot (new session)
2. Send: "What are your hours?"
3. Don't provide contact information

**Expected Results:**
- [ ] AI responds helpfully
- [ ] No aggressive contact info collection
- [ ] Lead scored as "cold"
- [ ] No email notification
- [ ] Still saved to database

### Test 4: Information Extraction
**Goal:** Verify automatic info extraction

**Steps:**
1. Open chatbot
2. Send: "My name is John Smith, email me at john@test.com"

**Expected Results:**
- [ ] Name extracted: "John Smith"
- [ ] Email extracted: "john@test.com"
- [ ] Stored in database correctly

**Verification:**
```sql
SELECT user_name, user_email FROM conversations 
WHERE user_email = 'john@test.com';
```

### Test 5: Human-Like Behavior
**Goal:** Verify natural conversation feel

**Steps:**
1. Have multiple similar conversations
2. Check for response variation
3. Observe typing delays

**Expected Results:**
- [ ] No two responses are identical
- [ ] Typing delays feel natural (1-4 seconds)
- [ ] Initial delay before typing starts
- [ ] Delay varies with message length
- [ ] No obvious patterns or repetition

### Test 6: Error Handling
**Goal:** Verify system fails gracefully

**Steps:**
1. Temporarily disable AI API key (set invalid value)
2. Try sending message
3. Re-enable API key

**Expected Results:**
- [ ] Fallback message shown with phone number
- [ ] No crashes or blank screens
- [ ] Error logged in function logs
- [ ] User can continue chatting after fix

---

## 📊 Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor function logs for errors
- [ ] Check conversation database for entries
- [ ] Verify email notifications arriving
- [ ] Test from different devices/browsers
- [ ] Review initial conversations for quality

**Monitoring URLs:**
- Function Logs: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/functions/marine-chat/logs
- Database: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/editor

### First Week
- [ ] Daily review of hot leads
- [ ] Response time tracking
- [ ] AI response quality check
- [ ] Lead scoring accuracy review
- [ ] Email notification reliability

**Key Metrics to Track:**
```sql
-- Daily summary
SELECT 
    COUNT(*) as total_convos,
    COUNT(*) FILTER (WHERE lead_score = 'hot') as hot_leads,
    COUNT(*) FILTER (WHERE user_email IS NOT NULL) as collected_email
FROM conversations
WHERE created_at >= CURRENT_DATE;
```

### Ongoing
- [ ] Weekly lead review meeting
- [ ] Monthly conversion analysis
- [ ] Quarterly system prompt updates
- [ ] Regular database cleanup
- [ ] Backup verification

---

## 🚨 Troubleshooting Common Issues

### Issue: Chatbot not appearing
**Solutions:**
- [ ] Check console for JavaScript errors
- [ ] Verify Supabase API key in `.env`
- [ ] Restart dev server: `npm run dev`
- [ ] Clear browser cache

### Issue: AI not responding
**Solutions:**
- [ ] Check function logs for errors
- [ ] Verify AI API key in Supabase secrets
- [ ] Test function directly with curl
- [ ] Check API quota/billing

### Issue: No emails being sent
**Solutions:**
- [ ] Verify `RESEND_API_KEY` is set
- [ ] Check lead is hot/warm with contact info
- [ ] Review `lead_notifications` table for failed sends
- [ ] Check Resend dashboard for delivery issues
- [ ] Verify email not in spam folder

### Issue: Information not extracted
**Solutions:**
- [ ] Check conversation text format
- [ ] Verify regex patterns match your data
- [ ] Test extraction logic manually
- [ ] Review function logs for extraction attempts

### Issue: Wrong lead scoring
**Solutions:**
- [ ] Review scoring criteria in edge function
- [ ] Adjust indicator keywords
- [ ] Check contact info collection
- [ ] Monitor false positives/negatives

### Issue: Slow responses
**Solutions:**
- [ ] Check OpenAI API status
- [ ] Review typing delay settings
- [ ] Monitor function execution time
- [ ] Consider reducing delay caps

---

## 📋 Production Readiness Checklist

### Security
- [ ] Environment variables not committed to git
- [ ] API keys stored in secure secrets
- [ ] RLS policies active on database
- [ ] CORS properly configured
- [ ] No sensitive data in logs

### Performance
- [ ] Database indexes created
- [ ] Function response time <3s average
- [ ] Email delivery <5s average
- [ ] No memory leaks in frontend
- [ ] Mobile responsive testing complete

### Legal/Privacy
- [ ] Privacy policy updated to mention chatbot
- [ ] Data collection disclosed to users
- [ ] Data retention policy defined
- [ ] GDPR compliance reviewed (if applicable)
- [ ] Contact info for data deletion requests

### Documentation
- [ ] Team trained on system use
- [ ] Lead follow-up process documented
- [ ] Database query guide available (`view_leads.sql`)
- [ ] Escalation path defined for issues
- [ ] Success metrics dashboard created

### Backup/Recovery
- [ ] Database backups enabled (automatic in Supabase)
- [ ] Edge function code in version control
- [ ] Environment variables documented
- [ ] Disaster recovery plan documented
- [ ] Test restoration procedure

---

## 🎯 Success Criteria

### Week 1 Goals
- [ ] 10+ conversations recorded
- [ ] 2+ hot leads identified
- [ ] Email notifications working
- [ ] Zero critical errors
- [ ] Positive user feedback

### Month 1 Goals
- [ ] 100+ conversations recorded
- [ ] 20+ qualified leads (hot/warm)
- [ ] 40%+ contact info collection rate
- [ ] <1 hour hot lead response time
- [ ] 30%+ hot lead conversion

### Quarter 1 Goals
- [ ] 500+ conversations
- [ ] 100+ qualified leads
- [ ] System refinements based on data
- [ ] CRM integration (if planned)
- [ ] ROI positive vs traditional marketing

---

## 📈 Optimization Roadmap

### Phase 1: Stabilization (Weeks 1-2)
- Fix any bugs found in testing
- Adjust lead scoring based on initial data
- Optimize email templates
- Train team on follow-up process

### Phase 2: Enhancement (Weeks 3-4)
- A/B test different conversation approaches
- Add more targeted questions based on patterns
- Improve information extraction accuracy
- Create analytics dashboard

### Phase 3: Scale (Month 2+)
- Add SMS notifications
- Integrate with CRM
- Implement automated follow-up sequences
- Add appointment booking
- Multilingual support

---

## ✅ Final Sign-Off

Before going live, confirm:

- [ ] All checklist items completed
- [ ] System tested end-to-end
- [ ] Team trained on usage
- [ ] Monitoring in place
- [ ] Support process defined
- [ ] Success metrics tracked

**Deployed by:** ________________
**Date:** ________________
**Next review:** ________________

---

## 🆘 Emergency Contacts

**Technical Issues:**
- Supabase Support: support@supabase.com
- OpenAI Support: https://help.openai.com
- Resend Support: support@resend.com

**Critical Failure Response:**
1. Check function logs immediately
2. Verify all API services operational
3. Test with curl command to isolate issue
4. Temporarily disable chatbot if needed
5. Provide phone number as fallback

---

**Good luck with your deployment! 🚀**

Your intelligent lead qualification system is ready to transform conversations into customers.
