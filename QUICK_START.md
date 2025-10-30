# ⚡ Quick Start Guide - 5 Minutes to Launch

Get your intelligent lead qualification chatbot running in 5 minutes.

---

## 🎯 Three-Step Setup

### Step 1: Database (1 minute)

Run the migration to create tables:

```bash
supabase db push
```

**That's it!** Tables `conversations` and `lead_notifications` are now ready.

### Step 2: Deploy Function (1 minute)

Deploy the updated edge function:

```bash
supabase functions deploy marine-chat --no-verify-jwt
```

**Done!** Your AI now has lead qualification superpowers.

### Step 3: Email Alerts (2 minutes) *Optional*

Get notified when hot leads come in:

1. **Sign up:** https://resend.com (free)
2. **Get API key:** API Keys section in dashboard
3. **Add to Supabase:**
   - Go to: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/settings/functions
   - Add secret: `RESEND_API_KEY` = `re_xxxxx`
   - Add secret: `BUSINESS_EMAIL` = `JDFperformancemarine@gmail.com`

**All set!** You'll now get email alerts for qualified leads.

---

## ✅ Test It (1 minute)

### Quick Test Conversation

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open chatbot and type:**
   ```
   "I need to schedule a tune-up for my boat"
   ```

3. **Give your info when asked:**
   ```
   "I'm John Smith, email john@test.com"
   ```

4. **Check results:**
   - ✅ Conversation saved to database
   - ✅ Lead scored as "hot"
   - ✅ Email sent to your business email (if configured)

---

## 📊 View Your Leads

Open Supabase and run:

```sql
SELECT 
    user_name,
    user_email,
    lead_score,
    created_at
FROM conversations 
ORDER BY created_at DESC 
LIMIT 10;
```

**Or use the dashboard:**
https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/editor

---

## 🎯 What Just Happened?

Your chatbot now:

✅ **Collects info naturally** - Gets name, email, phone in conversation  
✅ **Scores leads** - Rates as Cold, Warm, or Hot automatically  
✅ **Saves everything** - Full conversation history in database  
✅ **Sends alerts** - Email notifications for qualified leads  
✅ **Feels human** - Varied responses, realistic typing delays  

---

## 📚 Learn More

- **Full Documentation:** `LEAD_QUALIFICATION_SETUP.md`
- **Features Overview:** `FEATURES_SUMMARY.md`
- **Deployment Guide:** `DEPLOYMENT_CHECKLIST.md`
- **Database Queries:** `supabase/view_leads.sql`

---

## 🚨 Troubleshooting

**Chatbot not loading?**
- Check `.env` has `VITE_SUPABASE_PUBLISHABLE_KEY`
- Restart dev server: `npm run dev`

**AI not responding?**
- Check function logs: https://supabase.com/dashboard/project/pqicjnzddgtojxubftgw/functions/marine-chat/logs
- Verify `OPENAI_API_KEY` is set in Supabase secrets

**No emails?**
- Check `RESEND_API_KEY` is set
- Lead must be hot/warm AND have contact info
- Check spam folder

---

## 💡 Pro Tips

1. **Check leads daily** - Hot leads convert best within 1 hour
2. **Use the SQL queries** - `view_leads.sql` has helpful queries
3. **Monitor the logs** - Function logs show what AI is thinking
4. **Mark follow-ups** - Update `follow_up_completed` after contact

---

## 🎉 You're Ready!

Your chatbot is now an intelligent lead qualification machine.

**Next Steps:**
1. Test a few different conversation types
2. Review your first real leads in the database
3. Set up your daily lead review routine
4. Start converting those hot leads! 🔥

---

**Questions?** See the full docs or check function logs for details.

**Ready to scale?** See `DEPLOYMENT_CHECKLIST.md` for production setup.
