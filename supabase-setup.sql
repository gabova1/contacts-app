-- Run this in your Supabase SQL editor to create the contacts table

CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow all operations with anon key (single-user app with password screen)
CREATE POLICY "Allow all" ON contacts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: index for faster search
CREATE INDEX IF NOT EXISTS contacts_name_idx ON contacts (name);
