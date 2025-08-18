/*
  # Fix Authentication and RLS Policy Issues

  1. Security Updates
    - Drop and recreate problematic RLS policies to fix infinite recursion
    - Create proper admin detection function
    - Set up correct permissions for profiles table
    
  2. Policy Changes
    - Fix recursive policy issues on profiles table
    - Ensure admin users can manage all profiles
    - Allow users to view and update their own profiles
    - Enable profile creation during signup
    
  3. Admin Setup
    - Create admin user if it doesn't exist
    - Set up proper admin permissions
*/

-- Drop existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;

-- Create a simple admin detection function that doesn't cause recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@company.com'
  );
$$;

-- Create new, non-recursive policies for profiles
CREATE POLICY "Enable read access for own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable admin full access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = 'admin@company.com'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = 'admin@company.com'
    )
  );

-- Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create admin user profile if it doesn't exist
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get admin user ID from auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@company.com' 
  LIMIT 1;
  
  -- If admin user exists but no profile, create profile
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (admin_user_id, 'admin@company.com', 'Admin User', 'admin')
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      full_name = COALESCE(profiles.full_name, 'Admin User');
  END IF;
END $$;

-- Fix other tables' policies that might reference profiles incorrectly
DROP POLICY IF EXISTS "Staff can view all customers" ON customers;
DROP POLICY IF EXISTS "Users can view own customer record" ON customers;

-- Recreate customer policies without recursion
CREATE POLICY "Enable read for own customer record"
  ON customers
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Enable admin access to customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = 'admin@company.com'
    )
  );

-- Enable RLS on customers if not already enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Fix bookings policies
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;

-- Recreate booking policies
CREATE POLICY "Enable read for own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for authenticated users"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Enable admin access to bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = 'admin@company.com'
    )
  );

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;