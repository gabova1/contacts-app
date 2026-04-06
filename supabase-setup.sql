-- =============================================
-- PART 1: Contacts table (run if not already done)
-- =============================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON contacts
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS contacts_name_idx ON contacts (name);

-- Add photo column (run if contacts table already exists)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS photo TEXT;

-- Add rating column (0-3, default 0)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS rating INTEGER NOT NULL DEFAULT 0;


-- =============================================
-- PART 2: Lists (groups) — run in Supabase SQL editor
-- =============================================

CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add order column if table already exists
ALTER TABLE lists ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON lists
  FOR ALL
  USING (true)
  WITH CHECK (true);


-- =============================================
-- PART 3: Contact–List assignments (many-to-many)
-- =============================================

CREATE TABLE IF NOT EXISTS contact_lists (
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  list_id    UUID NOT NULL REFERENCES lists(id)    ON DELETE CASCADE,
  PRIMARY KEY (contact_id, list_id)
);

ALTER TABLE contact_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON contact_lists
  FOR ALL
  USING (true)
  WITH CHECK (true);
