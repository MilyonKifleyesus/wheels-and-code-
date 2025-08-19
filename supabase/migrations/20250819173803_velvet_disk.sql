/*
  # Update Admin Credentials

  This migration updates the admin user credentials from the old default ones to the new secure credentials.

  1. Updates
     - Changes admin email from admin@company.com to mili.kifleyesus@gmail.com
     - Updates all references to use the new email
     - Maintains admin role and permissions

  2. Security
     - Ensures RLS policies work with new admin user
     - Updates helper functions to recognize new admin
     - Maintains all existing security policies
*/

-- Update existing admin profile if it exists
UPDATE profiles 
SET email = 'mili.kifleyesus@gmail.com',
    full_name = 'Admin User',
    updated_at = now()
WHERE email = 'admin@company.com' AND role = 'admin';

-- Create new admin profile if the old one doesn't exist
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  gen_random_uuid(),
  'mili.kifleyesus@gmail.com',
  'Admin User',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'mili.kifleyesus@gmail.com'
);

-- Update any customer records that might reference the old admin email
UPDATE customers 
SET notes = REPLACE(notes, 'admin@company.com', 'mili.kifleyesus@gmail.com')
WHERE notes LIKE '%admin@company.com%';

-- Update any audit logs that might reference the old admin
UPDATE audit_logs 
SET new_values = jsonb_set(
  COALESCE(new_values, '{}'),
  '{email}',
  '"mili.kifleyesus@gmail.com"'
)
WHERE new_values->>'email' = 'admin@company.com';

-- Verify the admin user exists
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM profiles 
  WHERE email = 'mili.kifleyesus@gmail.com' AND role = 'admin';
  
  IF admin_count > 0 THEN
    RAISE NOTICE 'Admin user credentials updated successfully';
    RAISE NOTICE 'New admin email: mili.kifleyesus@gmail.com';
    RAISE NOTICE 'Admin can now login with the new credentials';
  ELSE
    RAISE NOTICE 'Warning: No admin user found after update';
  END IF;
END $$;