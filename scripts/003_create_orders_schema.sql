-- =============================================
-- EPICAP E-commerce B2B Database Schema
-- Part 3: Orders & Quotes
-- =============================================

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded', 'partial'
  )),
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  shipping_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  billing_address JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  shipping_method TEXT,
  tracking_number TEXT,
  notes TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  is_rental BOOLEAN DEFAULT false,
  rental_start_date DATE,
  rental_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes / Devis
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'
  )),
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  valid_until DATE,
  notes TEXT,
  internal_notes TEXT,
  converted_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote items
CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  is_rental BOOLEAN DEFAULT false,
  rental_days INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate order number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'CMD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate quote number function
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quote_number = 'DEV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(NEXTVAL('quote_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequences for order/quote numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

-- Triggers for auto-generating numbers
DROP TRIGGER IF EXISTS generate_order_number_trigger ON public.orders;
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION public.generate_order_number();

DROP TRIGGER IF EXISTS generate_quote_number_trigger ON public.quotes;
CREATE TRIGGER generate_quote_number_trigger
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  WHEN (NEW.quote_number IS NULL)
  EXECUTE FUNCTION public.generate_quote_number();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_company ON public.orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company ON public.quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON public.quote_items(quote_id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Orders policies (users see their own orders)
CREATE POLICY "orders_select_own" ON public.orders 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "orders_insert_own" ON public.orders 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Order items follow parent order
CREATE POLICY "order_items_select" ON public.order_items 
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- Quotes policies
CREATE POLICY "quotes_select_own" ON public.quotes 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "quotes_insert_own" ON public.quotes 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "quote_items_select" ON public.quote_items 
  FOR SELECT USING (
    quote_id IN (SELECT id FROM public.quotes WHERE user_id = auth.uid())
  );

-- Admin policies
CREATE POLICY "orders_admin_all" ON public.orders 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "order_items_admin_all" ON public.order_items 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "quotes_admin_all" ON public.quotes 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "quote_items_admin_all" ON public.quote_items 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Updated at triggers
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
