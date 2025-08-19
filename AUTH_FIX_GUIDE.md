# 🔐 Authentication Fix Guide

## **Current Issue**

You're experiencing authentication timeouts and admin login failures. The main problems are:

1. **Missing Environment Variables**: No `.env` file with Supabase credentials
2. **Profile Creation Delays**: The safety timeout (3s) is too short for profile creation
3. **Admin User Setup**: Admin user may not exist in Supabase auth system

## **Step 1: Create Environment Variables**

Create a `.env` file in your project root with your Supabase credentials:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### How to get your credentials:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project
4. Go to **Settings** → **API**
5. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public** key → Use as `VITE_SUPABASE_ANON_KEY`

## **Step 2: Fix Admin User Authentication**

The admin user needs to exist in Supabase's authentication system, not just as a profile.

### Option A: Use Supabase Dashboard (Recommended)

1. In your Supabase dashboard, go to **Authentication** → **Users**
2. Click **"Add user"**
3. Fill in:
   - **Email**: `mili.kifleyesus@gmail.com`
   - **Password**: Choose a secure password
   - **Auto Confirm User**: ✅ Check this box
4. Click **"Create user"**

### Option B: Use the Setup Script

1. Go to your admin login page: `/admin`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Run this command:

```javascript
import("./src/lib/setupAdmin.ts").then((module) => {
  module.setupAdminUser();
});
```

## **Step 3: Verify Database Setup**

Make sure your database tables exist by running the migrations:

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the migration files from `supabase/migrations/` in order:
   - Start with `20250817135951_pale_base.sql`
   - Then run any subsequent migrations

## **Step 4: Check Row Level Security (RLS)**

The authentication might be failing due to restrictive RLS policies. You can temporarily disable RLS for testing:

```sql
-- Temporarily disable RLS for testing (run in SQL Editor)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

## **What I've Fixed in the Code**

1. **Increased Safety Timeout**: From 3 seconds to 10 seconds to allow profile creation
2. **Better Error Handling**: Added detailed logging for profile creation failures
3. **Fallback Profile Creation**: Multiple attempts to create admin profile with minimal fields
4. **Improved Error Messages**: More descriptive logging to help debug issues

## **Testing Your Fix**

After completing the steps above:

1. **Restart your development server**
2. **Check the browser console** for connection messages
3. **Look for these success messages**:
   - ✅ "Supabase configuration validated successfully"
   - ✅ "Supabase connection test successful"
   - ✅ "User profile loaded" or "Admin profile created and loaded"

## **Common Issues and Solutions**

### Issue: "Missing Supabase environment variables"

**Solution**: Make sure your `.env` file exists and has the correct variable names

### Issue: "Profile not found" errors

**Solution**: Run the database migrations and check RLS policies

### Issue: "Invalid login credentials"

**Solution**: Create the admin user in Supabase Authentication → Users

### Issue: Still getting timeouts

**Solution**: Check your internet connection and Supabase project status

## **Next Steps**

1. Create the `.env` file with your credentials
2. Set up the admin user in Supabase
3. Run database migrations
4. Test the login again
5. Check the console for any remaining errors

## **Need More Help?**

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase project is active and not paused
3. Ensure your database has the required tables
4. Check if your Supabase plan allows the operations you're trying to perform

The authentication system should now be more robust and provide better error messages to help you debug any remaining issues.
