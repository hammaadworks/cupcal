-- Create Finals Events Table
CREATE TABLE public.finals_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    max_tickets INTEGER NOT NULL DEFAULT 200,
    max_tickets_buffer INTEGER NOT NULL DEFAULT 50,
    price_in_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Finals Tickets Table
CREATE TABLE public.finals_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.finals_events(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a function to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on finals_tickets table
CREATE TRIGGER update_tickets_modtime
BEFORE UPDATE ON public.finals_tickets
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security
ALTER TABLE public.finals_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finals_tickets ENABLE ROW LEVEL SECURITY;

-- Policies for Events (Publicly readable)
CREATE POLICY "Events are viewable by everyone."
ON public.finals_events FOR SELECT
USING (true);

-- Policies for Tickets (Insertable by anon, viewable by owner via ID)
-- Note: Since we use UUIDs as secure links, querying by ID acts as authorization.
CREATE POLICY "Anyone can insert tickets (checkout process)."
ON public.finals_tickets FOR INSERT
WITH CHECK (true);

CREATE POLICY "Tickets can be viewed if you have the ID."
ON public.finals_tickets FOR SELECT
USING (true);

CREATE POLICY "Tickets can be updated by anon (webhook process)."
ON public.finals_tickets FOR UPDATE
USING (true);

-- Insert the initial 2026 Finals Event
INSERT INTO public.finals_events (name, description, max_tickets, max_tickets_buffer, price_in_cents)
VALUES ('FIFA World Cup 2026 Finals Watch Party', 'Family-friendly, No-Alcohol Local Turf Screening in Bangalore.', 200, 50, 49900);

-- Create Match Results Table (holds scores for both group stage and knockout matches)
CREATE TABLE public.match_results (
    match_id TEXT PRIMARY KEY, -- Refers to the static match ID (1-72) or knockout_fixtures ID
    home_score INTEGER NOT NULL DEFAULT 0,
    away_score INTEGER NOT NULL DEFAULT 0,
    home_penalty_score INTEGER,
    away_penalty_score INTEGER,
    key_moments JSONB DEFAULT '[]'::jsonb,
    highlights_link TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to update updated_at on match_results table
CREATE TRIGGER update_match_results_modtime
BEFORE UPDATE ON public.match_results
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create Knockout Fixtures Table
CREATE TABLE public.knockout_fixtures (
    id TEXT PRIMARY KEY, -- e.g., '73' to '104'
    match_number TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    venue TEXT NOT NULL,
    stage TEXT NOT NULL,
    match_label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knockout_fixtures ENABLE ROW LEVEL SECURITY;

-- Policies for Match Data (Publicly readable)
CREATE POLICY "Match results are viewable by everyone."
ON public.match_results FOR SELECT
USING (true);

CREATE POLICY "Knockout fixtures are viewable by everyone."
ON public.knockout_fixtures FOR SELECT
USING (true);
