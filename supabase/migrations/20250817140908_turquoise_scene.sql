/*
  # Create content_sections table and fix profiles policy infinite recursion

  1. New Tables
    - `content_sections`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `section_type` (text, not null)
      - `title` (text, not null)
      - `visible` (boolean, default true, not null)
      - `sort_order` (integer, default 0, not null)
      - `content` (jsonb, default {})
      - `created_at` (timestamp with time zone, default now(), not null)
      - `updated_at` (timestamp with time zone, default now(), not null)

  2. Security
    - Enable RLS on `content_sections` table
    - Add policies for public read access and authenticated write access
    - Fix infinite recursion in profiles policies by removing circular references

  3. Data
    - Insert default content sections for website
*/

-- First, fix the infinite recursion in profiles policies
-- Drop all existing policies on profiles table that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

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

-- Create the content_sections table
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
  "title": "Premium Auto Sales & Service",
  "subtitle": "Your trusted partner for quality vehicles and expert automotive care",
  "backgroundImage": "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  "ctaText": "Browse Inventory",
  "ctaLink": "/inventory"
}'),
('services', 'Services Preview', true, 2, '{
  "title": "Expert Automotive Services",
  "subtitle": "Professional care for your vehicle",
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
('new-arrivals', 'New Arrivals', true, 3, '{
  "title": "Latest Arrivals",
  "subtitle": "Check out our newest inventory additions",
  "showCount": 6,
  "ctaText": "View All Vehicles",
  "ctaLink": "/inventory"
}'),
('finance', 'Finance Section', true, 4, '{
  "title": "Flexible Financing Options",
  "subtitle": "Get approved today with competitive rates",
  "features": [
    "Quick pre-approval process",
    "Competitive interest rates",
    "Flexible payment terms",
    "Bad credit? No problem!"
  ],
  "ctaText": "Apply Now",
  "ctaLink": "/contact"
}'),
('trust', 'Trust Section', true, 5, '{
  "title": "Why Choose Us",
  "subtitle": "Your satisfaction is our priority",
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
      "title": "Customer Support",
      "description": "Dedicated support team ready to help",
      "icon": "headphones"
    }
  ]
}'),
('promo', 'Promotional Section', true, 6, '{
  "title": "Special Offers",
  "subtitle": "Limited time deals you don''t want to miss",
  "offers": [
    {
      "title": "Free Oil Change",
      "description": "With any service over $200",
      "validUntil": "2024-12-31"
    },
    {
      "title": "10% Off Brake Service",
      "description": "New customers only",
      "validUntil": "2024-12-31"
    }
  ]
}'),
('contact', 'Contact Section', true, 7, '{
  "title": "Get In Touch",
  "subtitle": "Ready to find your perfect vehicle or schedule service?",
  "phone": "(555) 123-4567",
  "email": "info@autocare.com",
  "address": "123 Main Street, Your City, ST 12345",
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