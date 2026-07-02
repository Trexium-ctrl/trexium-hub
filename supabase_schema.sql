-- Trexium Hub — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============ LEADS ============
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  industry TEXT,
  website_url TEXT,
  current_website_quality TEXT DEFAULT 'None',
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  source TEXT,
  status TEXT DEFAULT 'Not contacted',
  priority TEXT DEFAULT 'Medium',
  last_contacted_date DATE,
  next_follow_up_date DATE,
  assigned_partner TEXT DEFAULT 'Owner',
  estimated_value NUMERIC,
  services_needed TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id TEXT
);
CREATE TRIGGER leads_updated BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ============ CUSTOMERS ============
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  domain_provider TEXT,
  hosting_status TEXT,
  service_package TEXT,
  monthly_payment_amount NUMERIC,
  setup_fee NUMERIC,
  hosting_fee NUMERIC,
  maintenance_fee NUMERIC,
  payment_due_day INTEGER,
  payment_method TEXT,
  status TEXT DEFAULT 'Active',
  assigned_partner TEXT DEFAULT 'Owner',
  start_date DATE,
  renewal_date DATE,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id TEXT
);
CREATE TRIGGER customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ============ PROJECTS ============
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT,
  project_type TEXT DEFAULT 'New website',
  status TEXT DEFAULT 'Not started',
  start_date DATE,
  target_launch_date DATE,
  actual_launch_date DATE,
  assigned_partner TEXT DEFAULT 'Owner',
  website_package TEXT,
  domain_connected BOOLEAN DEFAULT false,
  hosting_connected BOOLEAN DEFAULT false,
  customer_added BOOLEAN DEFAULT false,
  questionnaire_sent BOOLEAN DEFAULT false,
  questionnaire_completed BOOLEAN DEFAULT false,
  domain_info_received BOOLEAN DEFAULT false,
  logo_received BOOLEAN DEFAULT false,
  photos_received BOOLEAN DEFAULT false,
  copy_written BOOLEAN DEFAULT false,
  homepage_built BOOLEAN DEFAULT false,
  inner_pages_built BOOLEAN DEFAULT false,
  mobile_checked BOOLEAN DEFAULT false,
  contact_form_tested BOOLEAN DEFAULT false,
  seo_added BOOLEAN DEFAULT false,
  analytics_added BOOLEAN DEFAULT false,
  customer_approved BOOLEAN DEFAULT false,
  website_launched BOOLEAN DEFAULT false,
  payment_confirmed BOOLEAN DEFAULT false,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id TEXT
);
CREATE TRIGGER projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ============ PAYMENTS ============
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT,
  customer_name TEXT,
  amount NUMERIC NOT NULL,
  payment_type TEXT DEFAULT 'Monthly hosting',
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  status TEXT DEFAULT 'Due soon',
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id TEXT
);
CREATE TRIGGER payments_updated BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ============ TASKS ============
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  related_customer_id TEXT,
  related_customer_name TEXT,
  related_project_id TEXT,
  assigned_to TEXT DEFAULT 'Owner',
  due_date DATE,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'To do',
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id TEXT
);
CREATE TRIGGER tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ============ CALENDAR EVENTS ============
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT DEFAULT 'Customer meeting',
  related_lead_id TEXT,
  related_customer_id TEXT,
  related_project_id TEXT,
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  assigned_partner TEXT DEFAULT 'Owner',
  reminder_enabled BOOLEAN DEFAULT false,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id TEXT
);
CREATE TRIGGER calendar_events_updated BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ============ QUESTIONNAIRES ============
CREATE TABLE IF NOT EXISTS questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT,
  customer_name TEXT,
  project_id TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'Blank template',
  ai_build_notes TEXT,
  uploaded_by TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id TEXT
);
CREATE TRIGGER questionnaires_updated BEFORE UPDATE ON questionnaires FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ============ CLIENT FILES ============
CREATE TABLE IF NOT EXISTS client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT,
  customer_name TEXT,
  project_id TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_category TEXT DEFAULT 'Other',
  uploaded_by TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id TEXT
);
CREATE TRIGGER client_files_updated BEFORE UPDATE ON client_files FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ============ ROW LEVEL SECURITY ============
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to all tables
CREATE POLICY "auth_full_leads" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_customers" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_payments" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_tasks" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_calendar_events" ON calendar_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_questionnaires" ON questionnaires FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_client_files" ON client_files FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "auth_upload_files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'files');
CREATE POLICY "auth_read_files" ON storage.objects FOR SELECT USING (bucket_id = 'files');
CREATE POLICY "auth_delete_files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'files');