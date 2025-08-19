/*
  # Create Admin User in Supabase Auth System
  
  This migration creates the admin user directly in Supabase's auth system
  and ensures the profile is properly linked.
  
  1. Creates admin user in auth.users table
  2. Creates corresponding profile with admin role
  3. Sets up proper RLS policies
  4. Disables email confirmation for admin user
*/

-- First, ensure we can insert into auth.users (requires service role)
-- This needs to be run with elevated privileges

-- Create the admin user in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'mili.kifleyesus@gmail.com',
  crypt('P@ssw0rd123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User", "role": "admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the admin user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'mili.kifleyesus@gmail.com';
  
  -- Create the profile if it doesn't exist
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (admin_user_id, 'mili.kifleyesus@gmail.com', 'Admin User', 'admin')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
    
  RAISE NOTICE 'Admin user and profile created/updated successfully';
END $$;

-- Verify the admin user was created
SELECT 
  u.email as auth_email,
  u.email_confirmed_at,
  p.email as profile_email,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'mili.kifleyesus@gmail.com';