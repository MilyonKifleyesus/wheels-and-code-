/*
  # Fix content_sections table and profiles policy recursion

  1. New Tables
    - `content_sections`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `section_type` (text, not null)
      - `title` (text, not null)
      - `visible` (boolean, default true, not null)
      - `sort_order` (integer, default 0, not null)
      - `content` (jsonb, default {})
      - `created_at` (timestamptz, default now(), not null)
      - `updated_at` (timestamptz, default now(), not null)

  2. Security
    - Enable RLS on `content_sections` table
    - Add policies for public read access and authenticated write access
    - Fix infinite recursion in profiles policies by removing circular references

  3. Data
    - Insert default content sections for website functionality

  4. Changes
    - Drop problematic profiles policies causing infinite recursion
    - Create simple, non-recursive policies for profiles table
*/

-- First, fix the profiles table infinite recursion by dropping all existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all customers" ON customers;
DROP POLICY IF EXISTS "Users can view own customer record" ON customers;
DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON bookings;

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

-- Create simple policies for customers without profile table references
CREATE POLICY "Users can view own customer record"
  ON customers
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Create simple policies for bookings without complex profile references
CREATE POLICY "Authenticated users can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Now create the missing content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  title text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  content jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on content_sections
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for content_sections
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

-- Insert default content sections
INSERT INTO content_sections (section_type, title, visible, sort_order, content) VALUES
('hero', 'Hero Section', true, 1, '{
  "heading": "Premium Auto Sales & Service",
  "subheading": "Your trusted partner for quality vehicles and expert automotive care",
  "backgroundImage": "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
  "ctaText": "Browse Inventory",
  "ctaLink": "/inventory"
}'),
('services', 'Services Section', true, 2, '{
  "heading": "Our Services",
  "subheading": "Complete automotive solutions for all your needs",
  "services": [
    {
      "title": "Vehicle Sales",
      "description": "Quality pre-owned vehicles with comprehensive warranties",
      "icon": "car"
    },
    {
      "title": "Auto Repair",
      "description": "Expert mechanical repairs and maintenance services",
      "icon": "wrench"
    },
    {
      "title": "Financing",
      "description": "Flexible financing options to fit your budget",
      "icon": "credit-card"
    }
  ]
}'),
('new-arrivals', 'New Arrivals Section', true, 3, '{
  "heading": "New Arrivals",
  "subheading": "Check out our latest inventory additions",
  "showCount": 6,
  "ctaText": "View All Vehicles",
  "ctaLink": "/inventory"
}'),
('finance', 'Finance Section', true, 4, '{
  "heading": "Easy Financing Options",
  "subheading": "Get pre-approved in minutes with competitive rates",
  "features": [
    "Quick online application",
    "Competitive interest rates",
    "Flexible payment terms",
    "Bad credit? No problem!"
  ],
  "ctaText": "Apply Now",
  "ctaLink": "/contact"
}'),
('trust', 'Trust Section', true, 5, '{
  "heading": "Why Choose Us",
  "subheading": "Your satisfaction is our priority",
  "features": [
    {
      "title": "Quality Guarantee",
      "description": "All vehicles undergo thorough inspection",
      "icon": "shield-check"
    },
    {
      "title": "Expert Service",
      "description": "Certified technicians with years of experience",
      "icon": "users"
    },
    {
      "title": "Fair Pricing",
      "description": "Competitive prices with no hidden fees",
      "icon": "dollar-sign"
    }
  ]
}'),
('promo', 'Promo Section', true, 6, '{
  "heading": "Special Offers",
  "subheading": "Limited time deals on select vehicles and services",
  "offers": [
    {
      "title": "Free Oil Change",
      "description": "With any vehicle purchase this month",
      "validUntil": "2024-12-31"
    }
  ],
  "ctaText": "View Offers",
  "ctaLink": "/contact"
}'),
('contact', 'Contact Section', true, 7, '{
  "heading": "Get In Touch",
  "subheading": "Ready to find your next vehicle or schedule service?",
  "phone": "(555) 123-4567",
  "email": "info@autocare.com",
  "address": "123 Main Street, Your City, State 12345",
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