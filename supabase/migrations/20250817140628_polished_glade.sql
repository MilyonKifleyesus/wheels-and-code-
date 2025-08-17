/*
  # Fix content_sections table and profiles policy recursion

  1. New Tables
    - `content_sections`
      - `id` (uuid, primary key)
      - `section_type` (text, not null)
      - `title` (text, not null)
      - `visible` (boolean, default true)
      - `sort_order` (integer, default 0)
      - `content` (jsonb, default {})
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `content_sections` table
    - Add simple policies for content access
    - Fix infinite recursion in profiles policies by removing circular references

  3. Data
    - Insert default content sections for website
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

-- Add policies for content_sections (simple, non-recursive)
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

-- Fix profiles table policies by removing all existing ones and creating simple ones
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

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

-- Insert default content sections
INSERT INTO content_sections (section_type, title, visible, sort_order, content) VALUES
('hero', 'Hero Section', true, 1, '{
  "heading": "PRECISION PERFORMANCE PERFECTION",
  "subheading": "Experience automotive excellence with our premium selection of vehicles and professional services",
  "buttonText": "Explore Inventory",
  "buttonLink": "/inventory",
  "backgroundImage": "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
  "backgroundColor": "#1a1a1a",
  "textColor": "#ffffff",
  "accentColor": "#3b82f6"
}'),
('services', 'Services Preview', true, 2, '{
  "heading": "Professional Automotive Services",
  "description": "From routine maintenance to complex repairs, our certified technicians deliver excellence",
  "buttonText": "View All Services",
  "buttonLink": "/services",
  "backgroundColor": "#f8fafc",
  "textColor": "#1e293b",
  "accentColor": "#3b82f6"
}'),
('new-arrivals', 'New Arrivals', true, 3, '{
  "heading": "Latest Arrivals",
  "description": "Discover our newest additions to the premium vehicle collection",
  "buttonText": "View All Vehicles",
  "buttonLink": "/inventory",
  "backgroundColor": "#ffffff",
  "textColor": "#1e293b",
  "accentColor": "#3b82f6"
}'),
('finance', 'Finance Section', true, 4, '{
  "heading": "Flexible Financing Options",
  "description": "Get pre-approved for financing with competitive rates and flexible terms",
  "buttonText": "Apply Now",
  "buttonLink": "/contact",
  "backgroundColor": "#1e293b",
  "textColor": "#ffffff",
  "accentColor": "#3b82f6"
}'),
('trust', 'Trust Section', true, 5, '{
  "heading": "Why Choose Us",
  "description": "Trusted by thousands of customers for quality vehicles and exceptional service",
  "backgroundColor": "#f1f5f9",
  "textColor": "#1e293b",
  "accentColor": "#3b82f6"
}'),
('promo', 'Promo Section', true, 6, '{
  "heading": "Special Offers",
  "description": "Limited time promotions on select vehicles and services",
  "buttonText": "View Offers",
  "buttonLink": "/inventory",
  "backgroundColor": "#3b82f6",
  "textColor": "#ffffff",
  "accentColor": "#ffffff"
}'),
('contact', 'Contact Section', true, 7, '{
  "heading": "Get In Touch",
  "description": "Contact our team for personalized service and expert advice",
  "buttonText": "Contact Us",
  "buttonLink": "/contact",
  "backgroundColor": "#ffffff",
  "textColor": "#1e293b",
  "accentColor": "#3b82f6"
}')
ON CONFLICT (section_type) DO NOTHING;

-- Create update trigger for content_sections
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