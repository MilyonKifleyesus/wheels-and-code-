# 🚀 New Supabase Project Setup Guide

## **Your New Project Details:**

- **Project ID**: `dlisbapmpxcaittniqmm`
- **URL**: `https://dlisbapmpxcaittniqmm.supabase.co`
- **Admin Email**: `mili.kifleyesus@gmail.com`
- **Admin Password**: `P@ssw0rd123!`

## **📋 Step 1: Create .env File**

Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=https://dlisbapmpxcaittniqmm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaXNiYXBtcHhjYWl0dG5pcW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NDE2OTEsImV4cCI6MjA3MTIxNzY5MX0.9uXSxDAc28owKCqeId5Hsiu25FuW3t3xFIwM2695CDI
```

## **🏗️ Step 2: Set Up Database Tables**

Go to your Supabase Dashboard → SQL Editor and run:

### **Create Profiles Table:**

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('customer', 'admin', 'staff')) DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### **Create Other Tables (if needed):**

```sql
-- Vehicles table
CREATE TABLE vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  license_plate TEXT,
  customer_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  customer_id UUID REFERENCES profiles(id),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## **👤 Step 3: Create Admin User**

### **Option A: Via Supabase Dashboard (Recommended)**

1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Fill in:
   - **Email**: `mili.kifleyesus@gmail.com`
   - **Password**: `P@ssw0rd123!`
   - **Auto Confirm User**: ✅ Check this box
4. Click **"Create user"**

### **Option B: Via Console Script**

1. Go to your admin login page: `/admin`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Run this command:

```javascript
import("./src/lib/setupAdmin.ts").then((module) => {
  module.setupAdminUser();
});
```

## **🧪 Step 4: Test the Setup**

1. **Hard refresh** your browser (Ctrl+Shift+R)
2. **Go to** `/admin` login page
3. **Login with**:
   - Email: `mili.kifleyesus@gmail.com`
   - Password: `P@ssw0rd123!`

## **✅ Expected Results:**

- ✅ **Admin user created** in auth.users table
- ✅ **Admin profile created** in profiles table
- ✅ **Login successful** with admin role
- ✅ **Access to admin panel** features

## **🔧 Troubleshooting:**

If you get errors:

1. **Check console logs** for specific error messages
2. **Verify .env file** has correct credentials
3. **Ensure tables exist** in your database
4. **Check RLS policies** are properly set up

## **📞 Need Help?**

Run this in console to check admin user status:

```javascript
import("./src/lib/setupAdmin.ts").then((module) => {
  module.checkAdminUser();
});
```
