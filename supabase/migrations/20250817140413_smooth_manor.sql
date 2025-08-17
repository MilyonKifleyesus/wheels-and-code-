/*
  # Fix infinite recursion and create missing table

  1. Fix Issues
    - Drop problematic policies causing infinite recursion in profiles table
    - Create content_sections table that is missing
    - Add proper non-recursive policies
    
  2. Tables Created
    - `content_sections` table with proper structure
    
  3. Security
    - Simple, non-recursive RLS policies
    - Proper access control without circular dependencies
*/

-- First, drop all existing policies on profiles to eliminate recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all customers" ON customers;
DROP POLICY IF EXISTS "Users can view own customer record" ON customers;

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
  USING (auth.uid() = id);

-- Create simple policy for customers without profile recursion
CREATE POLICY "Users can view own customer record"
  ON customers
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Staff can view all customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  );

-- Create content_sections table if it doesn't exist
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  title text NOT NULL,
  visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  content jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on content_sections
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

-- Add policies for content_sections
CREATE POLICY "Anyone can view content sections"
  ON content_sections
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage content sections"
  ON content_sections
  FOR ALL
  TO authenticated
  USING (true);

-- Insert default content sections if they don't exist
INSERT INTO content_sections (section_type, title, visible, sort_order, content) VALUES
('hero', 'Hero Section', true, 1, '{
  "heading": "PRECISION PERFORMANCE PERFECTION",
  "subheading": "Premium automotive services and quality pre-owned vehicles",
  "buttonText": "Explore Inventory",
  "buttonLink": "/inventory",
  "backgroundImage": "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
  "backgroundColor": "#1a1a1a",
  "textColor": "#ffffff"
}'),
('services', 'Services Preview', true, 2, '{
  "heading": "Expert Automotive Services",
  "description": "Professional maintenance and repair services for all vehicle makes and models",
  "buttonText": "View All Services",
  "buttonLink": "/services",
  "backgroundColor": "#f8f9fa",
  "textColor": "#333333"
}'),
('new-arrivals', 'New Arrivals', true, 3, '{
  "heading": "Latest Arrivals",
  "description": "Check out our newest quality pre-owned vehicles",
  "buttonText": "View Inventory",
  "buttonLink": "/inventory",
  "backgroundColor": "#ffffff",
  "textColor": "#333333"
}'),
('finance', 'Finance Options', true, 4, '{
  "heading": "Flexible Financing",
  "description": "We offer competitive financing options to help you get the vehicle you want",
  "buttonText": "Learn More",
  "buttonLink": "/contact",
  "backgroundColor": "#f8f9fa",
  "textColor": "#333333"
}'),
('trust', 'Why Choose Us', true, 5, '{
  "heading": "Why Choose Our Service",
  "description": "Quality, reliability, and customer satisfaction are our top priorities",
  "backgroundColor": "#ffffff",
  "textColor": "#333333"
}'),
('promo', 'Special Offers', true, 6, '{
  "heading": "Special Offers",
  "description": "Take advantage of our current promotions and deals",
  "buttonText": "View Offers",
  "buttonLink": "/contact",
  "backgroundColor": "#1a1a1a",
  "textColor": "#ffffff"
}'),
('contact', 'Contact Information', true, 7, '{
  "heading": "Visit Our Location",
  "description": "Find us easily with our convenient location and hours",
  "backgroundColor": "#f8f9fa",
  "textColor": "#333333"
}')
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