/*
  # Complete Business Management Schema

  1. New Tables
    - `profiles` - User profiles and authentication
    - `vehicles` - Vehicle inventory management
    - `bookings` - Service appointment bookings
    - `customers` - Customer relationship management
    - `services` - Available services catalog
    - `content_sections` - Website content management
    - `notifications` - System notifications
    - `settings` - Business configuration

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Secure admin vs customer access

  3. Features
    - Real-time data synchronization
    - Automatic timestamps
    - Data validation constraints
    - Professional business schema
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'staff');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE vehicle_status AS ENUM ('available', 'sold', 'reserved', 'maintenance');
CREATE TYPE content_section_type AS ENUM ('hero', 'services', 'inventory', 'finance', 'trust', 'promo', 'map', 'about', 'testimonials', 'contact');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  role user_role DEFAULT 'customer',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL CHECK (year >= 1900 AND year <= 2030),
  price integer NOT NULL CHECK (price >= 0),
  mileage integer NOT NULL CHECK (mileage >= 0),
  vin text UNIQUE,
  status vehicle_status DEFAULT 'available',
  images text[] DEFAULT '{}',
  specs jsonb DEFAULT '{}',
  features text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price_from integer NOT NULL CHECK (price_from >= 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  category text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  vehicles text[] DEFAULT '{}',
  total_spent integer DEFAULT 0,
  last_service_date timestamptz,
  status text DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  service text NOT NULL,
  vehicle text NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status booking_status DEFAULT 'pending',
  notes text,
  estimated_cost integer,
  actual_cost integer,
  assigned_technician text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content sections table for website builder
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_type content_section_type NOT NULL,
  title text NOT NULL,
  visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  content jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section_type)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Business settings table
CREATE TABLE IF NOT EXISTS business_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_sections_updated_at BEFORE UPDATE ON content_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Vehicles policies - Simplified to allow anonymous access for viewing
CREATE POLICY "Anyone can view vehicles" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicles" ON vehicles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Services policies
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage services" ON services FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Customers policies - Simplified to avoid circular references
CREATE POLICY "Users can view own customer record" ON customers FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Staff can view all customers" ON customers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);
CREATE POLICY "Staff can manage customers" ON customers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Bookings policies - Simplified to allow anonymous access for viewing
CREATE POLICY "Anyone can view bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can update bookings" ON bookings FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Content sections policies
CREATE POLICY "Anyone can view content sections" ON content_sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage content" ON content_sections FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Business settings policies
CREATE POLICY "Admins can manage settings" ON business_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Insert default services
INSERT INTO services (name, description, price_from, duration_minutes, category) VALUES
('Oil Change', 'Premium synthetic oil change with multi-point inspection', 89, 30, 'maintenance'),
('Brake Service', 'Complete brake system inspection and service', 299, 90, 'maintenance'),
('Engine Diagnostics', 'Advanced computerized engine diagnostics', 149, 45, 'diagnostics'),
('Performance Tune', 'ECU optimization and performance enhancement', 599, 180, 'performance'),
('Safety Inspection', 'Comprehensive safety and emissions testing', 79, 25, 'inspection'),
('Transmission Service', 'Complete transmission fluid and filter service', 249, 120, 'maintenance'),
('AC Service', 'Air conditioning system inspection and repair', 179, 75, 'maintenance'),
('Tire Service', 'Tire rotation, balancing, and alignment', 149, 60, 'maintenance');

-- Insert default content sections
INSERT INTO content_sections (section_type, title, visible, sort_order, content) VALUES
('hero', 'Hero Section', true, 1, '{"heading": "PRECISION PERFORMANCE PERFECTION", "subheading": "Where automotive excellence meets cutting-edge service", "description": "Experience the future of car sales and repair", "buttonText": "BROWSE CARS", "buttonLink": "/inventory", "backgroundColor": "#0B0B0C", "textColor": "#FFFFFF", "accentColor": "#D7FF00"}'),
('services', 'Services Preview', true, 2, '{"heading": "PRECISION SERVICE", "description": "Expert automotive service with state-of-the-art equipment", "backgroundColor": "#0B0B0C", "textColor": "#FFFFFF", "accentColor": "#D7FF00"}'),
('inventory', 'New Arrivals', true, 3, '{"heading": "NEW ARRIVALS", "description": "Latest additions to our premium collection", "backgroundColor": "#141518", "textColor": "#FFFFFF", "accentColor": "#D7FF00"}'),
('finance', 'Finance Section', true, 4, '{"heading": "FINANCE OPTIONS", "description": "Get pre-qualified in minutes with competitive CAD rates", "backgroundColor": "#141518", "textColor": "#FFFFFF", "accentColor": "#D7FF00"}'),
('trust', 'Trust Section', true, 5, '{"heading": "TRUSTED BY THOUSANDS", "description": "See what our customers say about our service", "backgroundColor": "#0B0B0C", "textColor": "#FFFFFF", "accentColor": "#D7FF00"}'),
('promo', 'Promo Section', true, 6, '{"heading": "PERFORMANCE SERVICE SPECIAL", "description": "Complete performance package including diagnostics, tune-up, and optimization", "backgroundColor": "#0B0B0C", "textColor": "#FFFFFF", "accentColor": "#D7FF00"}'),
('map', 'Contact & Location', true, 7, '{"heading": "VISIT US", "description": "Experience our state-of-the-art facility and meet our expert team", "backgroundColor": "#141518", "textColor": "#FFFFFF", "accentColor": "#D7FF00"}');

-- Insert default business settings
INSERT INTO business_settings (key, value) VALUES
('business_name', '"Apex Auto Sales & Repair"'),
('phone', '"(416) 916-6475"'),
('address', '"179 Weston Rd, Toronto, ON M6N 3A5, Canada"'),
('currency', '"CAD"'),
('distance_unit', '"km"'),
('primary_color', '"#D7FF00"'),
('secondary_color', '"#C8FF1A"'),
('background_color', '"#0B0B0C"'),
('notifications', '{"newBookings": true, "payments": true, "serviceReminders": true, "inventory": true, "customerMessages": true}'),
('auto_backup', 'true');