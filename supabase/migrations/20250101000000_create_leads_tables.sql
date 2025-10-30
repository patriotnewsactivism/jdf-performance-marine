-- Create leads table to store contact information
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Contact information
    name TEXT,
    email TEXT,
    phone TEXT,
    
    -- Lead classification
    status TEXT NOT NULL DEFAULT 'cold' CHECK (status IN ('cold', 'warm', 'hot')),
    
    -- Lead details
    interest_description TEXT,
    boat_type TEXT,
    service_interest TEXT,
    
    -- Tracking
    session_id TEXT NOT NULL,
    source TEXT DEFAULT 'website_chat',
    
    -- Metadata
    first_contact_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    last_contact_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    notification_sent BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- Create conversations table to store chat history
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Link to lead
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    
    -- Message content
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_session_id ON public.leads(session_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON public.conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON public.conversations(session_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for leads table
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies to allow service role (backend) full access
CREATE POLICY "Service role can manage leads" ON public.leads
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage conversations" ON public.conversations
    FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to service role
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.conversations TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
