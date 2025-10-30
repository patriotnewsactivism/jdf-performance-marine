-- ============================================
-- J.D.F. Performance Marine - Lead Management
-- Quick queries for viewing and managing leads
-- ============================================

-- ========================================
-- 1. VIEW ALL HOT LEADS (Needs immediate follow-up)
-- ========================================
SELECT 
    id,
    user_name,
    user_email,
    user_phone,
    lead_score,
    lead_notes,
    follow_up_completed,
    notification_sent,
    created_at,
    updated_at
FROM conversations 
WHERE lead_score = 'hot' 
AND follow_up_required = true
ORDER BY created_at DESC;

-- ========================================
-- 2. VIEW ALL WARM LEADS (With contact info)
-- ========================================
SELECT 
    id,
    user_name,
    user_email,
    user_phone,
    lead_score,
    lead_notes,
    follow_up_required,
    follow_up_completed,
    created_at
FROM conversations 
WHERE lead_score = 'warm' 
AND (user_email IS NOT NULL OR user_phone IS NOT NULL)
ORDER BY created_at DESC;

-- ========================================
-- 3. TODAY'S CONVERSATIONS (All leads from today)
-- ========================================
SELECT 
    user_name,
    user_email,
    user_phone,
    lead_score,
    lead_notes,
    follow_up_required,
    created_at
FROM conversations 
WHERE created_at >= CURRENT_DATE
ORDER BY 
  CASE lead_score 
    WHEN 'hot' THEN 1 
    WHEN 'warm' THEN 2 
    ELSE 3 
  END,
  created_at DESC;

-- ========================================
-- 4. LEADS NEEDING FOLLOW-UP (Not yet contacted)
-- ========================================
SELECT 
    id,
    user_name,
    user_email,
    user_phone,
    lead_score,
    lead_notes,
    created_at,
    -- Calculate how long ago the conversation happened
    NOW() - created_at as time_since_conversation
FROM conversations 
WHERE follow_up_required = true 
AND follow_up_completed = false
ORDER BY 
  CASE lead_score 
    WHEN 'hot' THEN 1 
    WHEN 'warm' THEN 2 
    ELSE 3 
  END,
  created_at ASC;

-- ========================================
-- 5. VIEW FULL CONVERSATION (Replace 'conversation-id' with actual ID)
-- ========================================
SELECT 
    user_name,
    user_email,
    user_phone,
    lead_score,
    lead_notes,
    messages,
    created_at,
    updated_at
FROM conversations 
WHERE id = 'conversation-id-here';

-- To view messages in a readable format:
SELECT 
    user_name,
    user_email,
    lead_score,
    jsonb_pretty(messages) as conversation
FROM conversations 
WHERE id = 'conversation-id-here';

-- ========================================
-- 6. WEEKLY SUMMARY (Lead stats by week)
-- ========================================
SELECT 
    DATE_TRUNC('week', created_at) as week_starting,
    lead_score,
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE user_email IS NOT NULL) as conversations_with_email,
    COUNT(*) FILTER (WHERE user_phone IS NOT NULL) as conversations_with_phone,
    COUNT(*) FILTER (WHERE follow_up_required = true) as requiring_followup,
    COUNT(*) FILTER (WHERE follow_up_completed = true) as followup_completed
FROM conversations
WHERE created_at >= NOW() - INTERVAL '4 weeks'
GROUP BY week_starting, lead_score
ORDER BY week_starting DESC, lead_score;

-- ========================================
-- 7. NOTIFICATION HISTORY (Sent alerts)
-- ========================================
SELECT 
    n.sent_at,
    n.notification_type,
    n.sent_to,
    n.status,
    c.user_name,
    c.user_email,
    c.lead_score,
    n.error_message
FROM lead_notifications n
JOIN conversations c ON n.conversation_id = c.id
ORDER BY n.sent_at DESC
LIMIT 50;

-- ========================================
-- 8. FAILED NOTIFICATIONS (Need attention)
-- ========================================
SELECT 
    n.sent_at,
    n.notification_type,
    n.sent_to,
    n.error_message,
    c.id as conversation_id,
    c.user_name,
    c.user_email,
    c.lead_score
FROM lead_notifications n
JOIN conversations c ON n.conversation_id = c.id
WHERE n.status = 'failed'
ORDER BY n.sent_at DESC;

-- ========================================
-- 9. CONVERSION FUNNEL (Lead quality over time)
-- ========================================
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE lead_score = 'hot') as hot_leads,
    COUNT(*) FILTER (WHERE lead_score = 'warm') as warm_leads,
    COUNT(*) FILTER (WHERE lead_score = 'cold') as cold_leads,
    COUNT(*) FILTER (WHERE user_email IS NOT NULL OR user_phone IS NOT NULL) as with_contact_info,
    ROUND(100.0 * COUNT(*) FILTER (WHERE user_email IS NOT NULL OR user_phone IS NOT NULL) / COUNT(*), 1) as contact_collection_rate
FROM conversations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ========================================
-- 10. TOP QUESTIONS/TOPICS (Most common inquiries)
-- ========================================
-- Note: This is a simple version - you could enhance with NLP
SELECT 
    lead_score,
    conversation_summary,
    COUNT(*) as frequency
FROM conversations
WHERE conversation_summary IS NOT NULL
GROUP BY lead_score, conversation_summary
ORDER BY frequency DESC
LIMIT 20;


-- ============================================
-- MANAGEMENT ACTIONS
-- ============================================

-- ========================================
-- MARK LEAD AS CONTACTED (After follow-up)
-- ========================================
-- UPDATE conversations 
-- SET 
--     follow_up_completed = true,
--     updated_at = NOW()
-- WHERE id = 'conversation-id-here';

-- ========================================
-- MARK MULTIPLE LEADS AS CONTACTED
-- ========================================
-- UPDATE conversations 
-- SET 
--     follow_up_completed = true,
--     updated_at = NOW()
-- WHERE id IN ('id1', 'id2', 'id3');

-- ========================================
-- UPDATE LEAD SCORE MANUALLY (If needed)
-- ========================================
-- UPDATE conversations 
-- SET 
--     lead_score = 'hot',  -- or 'warm' or 'cold'
--     lead_notes = 'Manual override: [reason]',
--     updated_at = NOW()
-- WHERE id = 'conversation-id-here';

-- ========================================
-- DELETE OLD COLD LEADS (Cleanup)
-- ========================================
-- Be careful with this! Only delete after proper backup
-- DELETE FROM conversations 
-- WHERE lead_score = 'cold' 
-- AND created_at < NOW() - INTERVAL '90 days'
-- AND (user_email IS NULL AND user_phone IS NULL);

-- ========================================
-- EXPORT LEADS TO CSV (For external CRM)
-- ========================================
-- Run this in Supabase dashboard and export results:
SELECT 
    created_at::date as date,
    user_name as name,
    user_email as email,
    user_phone as phone,
    lead_score as score,
    lead_notes as notes,
    follow_up_completed as contacted,
    created_at::text as timestamp
FROM conversations
WHERE (user_email IS NOT NULL OR user_phone IS NOT NULL)
AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;


-- ============================================
-- ANALYTICS QUERIES
-- ============================================

-- ========================================
-- RESPONSE TIME ANALYSIS (How fast are you following up?)
-- ========================================
-- Note: You'd need to add a 'contacted_at' field to track this
-- This is a placeholder for future enhancement
SELECT 
    lead_score,
    AVG(updated_at - created_at) as avg_response_time,
    MIN(updated_at - created_at) as fastest_response,
    MAX(updated_at - created_at) as slowest_response,
    COUNT(*) as total_leads
FROM conversations
WHERE follow_up_completed = true
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY lead_score;

-- ========================================
-- PEAK CONVERSATION TIMES (When are people chatting?)
-- ========================================
SELECT 
    EXTRACT(HOUR FROM created_at) as hour_of_day,
    EXTRACT(DOW FROM created_at) as day_of_week,  -- 0=Sunday, 6=Saturday
    COUNT(*) as conversation_count,
    COUNT(*) FILTER (WHERE lead_score IN ('hot', 'warm')) as quality_leads
FROM conversations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY hour_of_day, day_of_week
ORDER BY conversation_count DESC
LIMIT 20;

-- ========================================
-- INFORMATION COLLECTION SUCCESS RATE
-- ========================================
SELECT 
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE user_name IS NOT NULL) as collected_name,
    COUNT(*) FILTER (WHERE user_email IS NOT NULL) as collected_email,
    COUNT(*) FILTER (WHERE user_phone IS NOT NULL) as collected_phone,
    COUNT(*) FILTER (WHERE user_name IS NOT NULL AND user_email IS NOT NULL) as name_and_email,
    COUNT(*) FILTER (WHERE user_name IS NOT NULL AND user_email IS NOT NULL AND user_phone IS NOT NULL) as all_three,
    ROUND(100.0 * COUNT(*) FILTER (WHERE user_name IS NOT NULL) / COUNT(*), 1) as name_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE user_email IS NOT NULL) / COUNT(*), 1) as email_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE user_phone IS NOT NULL) / COUNT(*), 1) as phone_rate
FROM conversations
WHERE created_at >= NOW() - INTERVAL '30 days';


-- ============================================
-- QUICK DASHBOARD VIEW
-- ============================================
-- Run this for a quick overview of your leads
SELECT 
    'Hot Leads Needing Follow-up' as metric,
    COUNT(*) as count
FROM conversations 
WHERE lead_score = 'hot' AND follow_up_required = true AND follow_up_completed = false

UNION ALL

SELECT 
    'Warm Leads with Contact Info' as metric,
    COUNT(*) as count
FROM conversations 
WHERE lead_score = 'warm' AND (user_email IS NOT NULL OR user_phone IS NOT NULL)

UNION ALL

SELECT 
    'Total Conversations Today' as metric,
    COUNT(*) as count
FROM conversations 
WHERE created_at >= CURRENT_DATE

UNION ALL

SELECT 
    'Notifications Sent Today' as metric,
    COUNT(*) as count
FROM lead_notifications 
WHERE sent_at >= CURRENT_DATE AND status = 'sent'

UNION ALL

SELECT 
    'Failed Notifications' as metric,
    COUNT(*) as count
FROM lead_notifications 
WHERE status = 'failed'

UNION ALL

SELECT 
    'Total Leads This Month' as metric,
    COUNT(*) as count
FROM conversations 
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);
