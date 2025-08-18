/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - Current RLS policies on profiles table are causing infinite recursion
    - Policies are referencing themselves in a circular manner
    - This prevents any profile data from being fetched

  2. Solution
    - Drop all existing problematic policies
    - Create simple, non-recursive policies
    - Ensure policies don't reference the same table they're protecting

  3. Security
    - Users can view and update their own profile
    - Admins can view all profiles
    - No circular references in policy logic
*/

-- Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create simple, non-recursive policies
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
    auth.uid() IN (
      SELECT auth.uid()
      FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@company.com'
    )
  );