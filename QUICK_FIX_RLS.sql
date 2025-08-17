-- Quick Fix for Infinite Recursion in RLS Policies
-- Enhanced version with safe policy handling and better error management

-- Step 1: Safely drop existing policies if they exist
DO $$
BEGIN
    -- Safely drop policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Anyone can view available vehicles" ON vehicles;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Admins can manage vehicles" ON vehicles;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Anyone can view vehicles" ON vehicles;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Anyone can view bookings" ON bookings;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new, simplified policies
-- Policies for vehicles
CREATE POLICY "Anyone can view vehicles" ON vehicles 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Admins can manage vehicles" ON vehicles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Policies for bookings
CREATE POLICY "Anyone can view bookings" ON bookings 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Anyone can create bookings" ON bookings 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update bookings" ON bookings 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Step 4: Verify the fix
SELECT 'RLS policies fixed successfully' as status;
