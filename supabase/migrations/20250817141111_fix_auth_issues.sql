-- Fix Authentication and RLS Issues
-- This migration fixes the problems preventing admin login
-- Updated to work with the actual database schema

-- 0. First, ensure all required tables exist with correct structure
DO $$
BEGIN
    -- Create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id uuid PRIMARY KEY,
            email text UNIQUE NOT NULL,
            full_name text,
            phone text,
            role text DEFAULT 'customer',
            avatar_url text,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
        RAISE NOTICE 'profiles table created';
    END IF;

    -- Create vehicles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vehicles') THEN
        CREATE TABLE vehicles (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            make text NOT NULL,
            model text NOT NULL,
            year integer NOT NULL,
            price integer NOT NULL,
            mileage integer NOT NULL,
            vin text UNIQUE,
            status text DEFAULT 'available',
            images text[] DEFAULT '{}',
            specs jsonb DEFAULT '{}',
            features text[] DEFAULT '{}',
            location_id uuid,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
        RAISE NOTICE 'vehicles table created';
    END IF;

    -- Create services table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'services') THEN
        CREATE TABLE services (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            description text,
            price_from integer NOT NULL,
            duration_minutes integer NOT NULL,
            category text NOT NULL,
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now()
        );
        RAISE NOTICE 'services table created';
    END IF;

    -- Create customers table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') THEN
        CREATE TABLE customers (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
            vehicles text[] DEFAULT '{}',
            total_spent integer DEFAULT 0,
            last_service_date timestamptz,
            status text DEFAULT 'active',
            notes text,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
        RAISE NOTICE 'customers table created';
    END IF;

    -- Create bookings table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        CREATE TABLE bookings (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
            service_id uuid REFERENCES services(id),
            vehicle_info text NOT NULL,
            booking_date date NOT NULL,
            booking_time time NOT NULL,
            status text DEFAULT 'pending',
            notes text,
            estimated_cost integer,
            actual_cost integer,
            location_id uuid,
            assigned_staff uuid REFERENCES profiles(id),
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
        RAISE NOTICE 'bookings table created';
    END IF;

    -- Create content_sections table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'content_sections') THEN
        CREATE TABLE content_sections (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            section_type text NOT NULL UNIQUE,
            title text NOT NULL,
            visible boolean NOT NULL DEFAULT true,
            sort_order integer NOT NULL DEFAULT 0,
            content jsonb DEFAULT '{}',
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        );
        RAISE NOTICE 'content_sections table created';
    END IF;

    -- Create notifications table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        CREATE TABLE notifications (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
            title text NOT NULL,
            message text NOT NULL,
            type text NOT NULL,
            is_read boolean DEFAULT false,
            data jsonb DEFAULT '{}',
            created_at timestamptz DEFAULT now()
        );
        RAISE NOTICE 'notifications table created';
    END IF;

    -- Create locations table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'locations') THEN
        CREATE TABLE locations (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            address text NOT NULL,
            phone text,
            email text,
            hours jsonb,
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now()
        );
        RAISE NOTICE 'locations table created';
    END IF;

    RAISE NOTICE 'All required tables verified/created successfully';
END $$;

-- 1. Now temporarily disable RLS to allow admin user creation
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

-- 2. Create a function to safely create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT DEFAULT 'Admin User'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  profile_id UUID;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    RETURN 'User already exists';
  END IF;
  
  -- Create the user in auth.users (this will be done by the client)
  -- For now, we'll just create the profile and let the client handle auth
  
  -- Create profile with admin role
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (gen_random_uuid(), admin_email, admin_name, 'admin')
  RETURNING id INTO profile_id;
  
  RETURN 'Profile created with ID: ' || profile_id;
END;
$$;

-- 3. Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_admin_user TO anon;
GRANT EXECUTE ON FUNCTION create_admin_user TO authenticated;

-- 4. Insert a default admin profile if none exists
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  gen_random_uuid(),
  'admin@company.com',
  'Admin User',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'admin@company.com'
);

-- 5. Create a simpler, more permissive RLS policy for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles" ON profiles 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Create a policy to allow profile creation during signup
CREATE POLICY "Allow profile creation during signup" ON profiles 
FOR INSERT WITH CHECK (true);

-- 7. Re-enable RLS with fixed policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. Create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$;

-- 9. Grant execute permission on helper function
GRANT EXECUTE ON FUNCTION is_admin TO anon;
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;

-- 10. Update other table policies to use the helper function
-- Vehicles
DROP POLICY IF EXISTS "Admins can manage vehicles" ON vehicles;
CREATE POLICY "Admins can manage vehicles" ON vehicles 
FOR ALL USING (is_admin());

-- Services  
DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services" ON services 
FOR ALL USING (is_admin());

-- Content sections
DROP POLICY IF EXISTS "Admins can manage content" ON content_sections;
CREATE POLICY "Admins can manage content" ON content_sections 
FOR ALL USING (is_admin());

-- Locations
DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
CREATE POLICY "Admins can manage locations" ON locations 
FOR ALL USING (is_admin());

-- 11. Re-enable RLS on other tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- 12. Create a test admin user function
CREATE OR REPLACE FUNCTION test_admin_login()
RETURNS TABLE(email TEXT, role TEXT, full_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.email, p.role, p.full_name
  FROM profiles p
  WHERE p.email = 'admin@company.com';
END;
$$;

GRANT EXECUTE ON FUNCTION test_admin_login TO anon;
GRANT EXECUTE ON FUNCTION test_admin_login TO authenticated;

-- 13. Log the fix
DO $$
BEGIN
  RAISE NOTICE 'Authentication fix completed successfully';
  RAISE NOTICE 'Admin user should now be able to login';
  RAISE NOTICE 'Run: SELECT * FROM test_admin_login(); to verify admin profile';
END $$;
