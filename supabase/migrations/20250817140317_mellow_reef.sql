/*
  # Fix Database Errors

  1. Missing Tables
    - Create `content_sections` table with proper structure
  
  2. Security
    - Enable RLS on content_sections table
    - Add simple policies without recursion
    - Fix profiles table policy recursion issue
*/

-- Create content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  title text NOT NULL,
  visible boolean DEFAULT true NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  content jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on content_sections
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

-- Add simple policies for content_sections (no recursion)
CREATE POLICY "Anyone can view content sections"
  ON content_sections
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage content sections"
  ON content_sections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fix profiles table policies to prevent infinite recursion
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Simple admin policy without recursion
CREATE POLICY "Service role can manage all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default content sections
INSERT INTO content_sections (section_type, title, visible, sort_order, content) VALUES
  ('hero', 'Hero Section', true, 1, '{"heading": "PRECISION PERFORMANCE PERFECTION", "subheading": "Premium automotive services and quality pre-owned vehicles", "buttonText": "EXPLORE INVENTORY", "buttonLink": "/inventory", "backgroundColor": "#1a1a1a", "textColor": "#ffffff"}'),
  ('services', 'Services Preview', true, 2, '{"heading": "Professional Automotive Services", "description": "Expert maintenance and repair services for all vehicle makes and models", "backgroundColor": "#f8fafc", "textColor": "#1e293b"}'),
  ('new_arrivals', 'New Arrivals', true, 3, '{"heading": "Latest Arrivals", "description": "Check out our newest inventory additions", "backgroundColor": "#ffffff", "textColor": "#1e293b"}'),
  ('finance', 'Finance Section', true, 4, '{"heading": "Flexible Financing Options", "description": "Get pre-approved for financing with competitive rates", "backgroundColor": "#f1f5f9", "textColor": "#1e293b"}'),
  ('trust', 'Trust Section', true, 5, '{"heading": "Why Choose Us", "description": "Quality, reliability, and exceptional service", "backgroundColor": "#ffffff", "textColor": "#1e293b"}'),
  ('promo', 'Promotional Section', true, 6, '{"heading": "Special Offers", "description": "Limited time deals and promotions", "backgroundColor": "#1e40af", "textColor": "#ffffff"}'),
  ('contact', 'Contact Section', true, 7, '{"heading": "Get In Touch", "description": "Contact us for more information", "backgroundColor": "#f8fafc", "textColor": "#1e293b"}')
ON CONFLICT (section_type) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_sections_updated_at
    BEFORE UPDATE ON content_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();