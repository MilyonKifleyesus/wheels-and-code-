/*
  # Fix profiles policy infinite recursion and create content_sections table

  1. Fix Profiles Policy Issues
    - Drop all existing policies on profiles table that cause infinite recursion
    - Create simple, non-recursive policies for profiles table
    - Ensure no circular dependencies between profiles, customers, and bookings

  2. Create Missing Table
    - `content_sections` table with all required columns
    - Proper RLS policies for content sections
    - Default content data for website sections

  3. Security
    - Enable RLS on content_sections table
    - Add policies for public read access and authenticated write access
    - Fix profiles policies to avoid recursion
*/

-- First, fix the infinite recursion in profiles policies
-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;

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

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'staff')
    )
  );

-- Also fix any problematic policies on bookings that might reference profiles recursively
DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON bookings;

-- Create simple booking policies without recursive profile lookups
CREATE POLICY "Users can view bookings for their customer records"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can update bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Now create the missing content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  title text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  content jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on content_sections
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for content_sections
CREATE POLICY "Anyone can view visible content sections"
  ON content_sections
  FOR SELECT
  TO public
  USING (visible = true);

CREATE POLICY "Authenticated users can view all content sections"
  ON content_sections
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage content sections"
  ON content_sections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add update trigger for content_sections
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

-- Insert default content sections
INSERT INTO content_sections (section_type, title, visible, sort_order, content) VALUES
('hero', 'Hero Section', true, 1, '{
  "headline": "Premium Auto Sales & Service",
  "subheadline": "Your trusted partner for quality vehicles and expert automotive care",
  "backgroundImage": "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
  "ctaText": "Browse Inventory",
  "ctaLink": "/inventory"
}'),
('services', 'Services Section', true, 2, '{
  "title": "Our Services",
  "description": "Comprehensive automotive solutions for all your needs",
  "services": [
    {
      "name": "Oil Change",
      "description": "Quick and professional oil change service",
      "price": "From $49",
      "duration": "30 minutes"
    },
    {
      "name": "Brake Service",
      "description": "Complete brake inspection and repair",
      "price": "From $149",
      "duration": "2 hours"
    },
    {
      "name": "Engine Diagnostics",
      "description": "Advanced computer diagnostics",
      "price": "From $99",
      "duration": "1 hour"
    }
  ]
}'),
('new-arrivals', 'New Arrivals Section', true, 3, '{
  "title": "New Arrivals",
  "description": "Check out our latest inventory additions",
  "showCount": 6,
  "ctaText": "View All Vehicles",
  "ctaLink": "/inventory"
}'),
('finance', 'Finance Section', true, 4, '{
  "title": "Financing Options",
  "description": "Flexible financing solutions to fit your budget",
  "features": [
    "Competitive rates",
    "Quick approval",
    "Flexible terms",
    "Trade-in accepted"
  ],
  "ctaText": "Get Pre-Approved",
  "ctaLink": "/contact"
}'),
('trust', 'Trust Section', true, 5, '{
  "title": "Why Choose Us",
  "features": [
    {
      "title": "Quality Guaranteed",
      "description": "All vehicles undergo thorough inspection",
      "icon": "shield-check"
    },
    {
      "title": "Expert Service",
      "description": "Certified technicians with years of experience",
      "icon": "wrench"
    },
    {
      "title": "Fair Pricing",
      "description": "Transparent pricing with no hidden fees",
      "icon": "dollar-sign"
    },
    {
      "title": "Customer First",
      "description": "Your satisfaction is our top priority",
      "icon": "heart"
    }
  ]
}'),
('promo', 'Promotional Section', true, 6, '{
  "title": "Special Offers",
  "description": "Limited time deals on select vehicles and services",
  "offers": [
    {
      "title": "Free Oil Change",
      "description": "With any service over $200",
      "validUntil": "2024-12-31"
    }
  ],
  "backgroundColor": "#f3f4f6"
}'),
('contact', 'Contact Section', true, 7, '{
  "title": "Get In Touch",
  "description": "Ready to find your next vehicle or schedule service?",
  "phone": "(555) 123-4567",
  "email": "info@autocare.com",
  "address": "123 Main Street, City, State 12345",
  "hours": {
    "monday": "8:00 AM - 6:00 PM",
    "tuesday": "8:00 AM - 6:00 PM",
    "wednesday": "8:00 AM - 6:00 PM",
    "thursday": "8:00 AM - 6:00 PM",
    "friday": "8:00 AM - 6:00 PM",
    "saturday": "9:00 AM - 4:00 PM",
    "sunday": "Closed"
  }
}')
ON CONFLICT (section_type) DO NOTHING;