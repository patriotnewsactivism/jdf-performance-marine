-- Create conversations table to store all chat interactions
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- User information (collected during conversation)
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    
    -- Lead qualification
    lead_score TEXT CHECK (lead_score IN ('cold', 'warm', 'hot')),
    lead_notes TEXT,
    
    -- Conversation data
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    conversation_summary TEXT,
    
    -- Follow-up tracking
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    user_agent TEXT,
    ip_address TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_score ON conversations(lead_score);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_follow_up ON conversations(follow_up_required, follow_up_completed);

-- Create notifications table for tracking alerts sent
CREATE TABLE IF NOT EXISTS lead_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    notification_type TEXT CHECK (notification_type IN ('email', 'sms', 'both')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    sent_to TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT
);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_conversation ON lead_notifications(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON lead_notifications(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (edge functions can access everything)
CREATE POLICY "Service role can do everything on conversations" ON conversations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on notifications" ON lead_notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy for anon users to insert conversations (for the chatbot)
CREATE POLICY "Anon users can insert conversations" ON conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon users can update their own conversations" ON conversations
    FOR UPDATE USING (true);
