# 🔧 Admin Login Fix - Step by Step

## **The Problem**

Your admin login is failing with "Invalid login credentials" because:

1. The admin user account doesn't exist in Supabase's authentication system
2. Only a profile record exists, but no actual auth user
3. Supabase requires users to be created in the auth.users table to login

## **The Solution**

You need to create the admin user in Supabase's authentication system. There are two ways to do this:

## **Method 1: Use Supabase Dashboard (Recommended)**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `otogefbrswdxyvvageop`
3. Go to **Authentication** → **Users**
4. Click **"Add user"**
5. Fill in:
   - **Email**: `mili.kifleyesus@gmail.com`
   - **Password**: `P@ssw0rd123!`
   - **Auto Confirm User**: ✅ Check this box
6. Click **"Create user"**

## **Method 2: Use the Setup Script**

1. Go to your admin login page: `/admin`
2. Press `F12` to open Developer Tools  
3. Go to the **Console** tab
4. Run this command:

```javascript
import("./src/lib/setupAdmin.ts").then((module) => {
  module.setupAdminUser();
});
```

5. This will attempt to create the user via signUp

## **Step 3: Test the Login**

After creating the user, try logging in with:

- **Email**: `admin@company.com`
- **Password**: `admin123456`

## **Why This Happens**

The error occurs because:
- Supabase requires users to exist in the `auth.users` table to authenticate
- Previous setup only created a profile record, not an auth user
- The `signInWithPassword` function checks against `auth.users`, not `profiles`

## **Verification**

After creating the user, you should be able to:
1. ✅ See the user in Supabase Dashboard → Authentication → Users
2. ✅ Login successfully with the credentials
3. ✅ Access the admin panel features

## **Important Notes**

- **Method 1 (Dashboard)** is more reliable and recommended
- **Method 2 (Script)** may fail due to email confirmation requirements
- Make sure to check "Auto Confirm User" when creating via dashboard
- The profile record should already exist from previous setup attempts
