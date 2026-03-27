-- =============================================
-- EPICAP E-commerce B2B Database Schema
-- Part 2: Customers & B2B Accounts
-- =============================================

-- B2B Companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  siret TEXT UNIQUE,
  vat_number TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  billing_address JSONB, -- { street, city, postal_code, country }
  shipping_addresses JSONB DEFAULT '[]', -- Array of addresses
  payment_terms TEXT DEFAULT 'immediate', -- immediate, net30, net60
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'company_admin', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_siret ON public.companies(siret);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Company policies (users can see their own company)
CREATE POLICY "companies_select_own" ON public.companies 
  FOR SELECT USING (
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Admin policies for companies
CREATE POLICY "companies_admin_all" ON public.companies 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
