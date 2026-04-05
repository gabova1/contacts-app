import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  photo: string | null;
  created_at: string;
};

export type ContactList = {
  id: string;
  name: string;
  created_at: string;
};

export type ContactListAssignment = {
  contact_id: string;
  list_id: string;
};
