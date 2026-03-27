-- =============================================
-- EPICAP E-commerce B2B Database Schema
-- Part 1: Products & Categories
-- =============================================

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand TEXT,
  weight DECIMAL(10, 3),
  dimensions JSONB, -- { length, width, height, unit }
  stock_quantity INT DEFAULT 0,
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'on_order')),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_rentable BOOLEAN DEFAULT false,
  rental_price_day DECIMAL(10, 2),
  rental_price_week DECIMAL(10, 2),
  rental_price_month DECIMAL(10, 2),
  images JSONB DEFAULT '[]', -- Array of image URLs
  specifications JSONB DEFAULT '{}', -- Technical specifications
  certifications TEXT[], -- Array of certifications (CE, EN, etc.)
  documents JSONB DEFAULT '[]', -- Technical documents, manuals
  related_products UUID[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants (sizes, colors, etc.)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  stock_quantity INT DEFAULT 0,
  attributes JSONB DEFAULT '{}', -- { size: "XL", color: "Blue" }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON public.products(stock_status);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products 
  USING GIN (to_tsvector('french', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(brand, '')));

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Public read policies (products and categories are public)
CREATE POLICY "categories_public_read" ON public.categories 
  FOR SELECT USING (is_active = true);

CREATE POLICY "products_public_read" ON public.products 
  FOR SELECT USING (is_active = true);

CREATE POLICY "variants_public_read" ON public.product_variants 
  FOR SELECT USING (is_active = true);

-- Admin write policies (authenticated admins only)
-- Note: In production, add an is_admin check on user metadata
CREATE POLICY "categories_admin_all" ON public.categories 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "products_admin_all" ON public.products 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "variants_admin_all" ON public.product_variants 
  FOR ALL USING (auth.role() = 'authenticated');

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
