# Supabase Setup Guide

## Current Issue

You're experiencing 500 server errors when trying to fetch data from your Supabase database. This is typically caused by missing or incorrect configuration.

## Step 1: Create Environment Variables

Create a `.env` file in your project root with the following content:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 2: Get Your Supabase Credentials

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (or create a new one)
4. Go to **Settings** → **API**
5. Copy the following values:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public** key → Use as `VITE_SUPABASE_ANON_KEY`

## Step 3: Verify Database Setup

Make sure your database tables exist by running the migrations:

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the migration files from `supabase/migrations/` in order:
   - Start with `20250817135951_pale_base.sql`
   - Then run any subsequent migrations

## Step 4: Check Row Level Security (RLS)

The 500 errors might be caused by restrictive RLS policies. You can temporarily disable RLS for testing:

```sql
-- Temporarily disable RLS for testing (run in SQL Editor)
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

## Step 5: Test Your Configuration

1. Restart your development server
2. Check the browser console for connection messages
3. Look for "Supabase connection test successful" message

## Common Issues and Solutions

### Issue: "Missing Supabase environment variables"

**Solution**: Make sure your `.env` file exists and has the correct variable names

### Issue: "Invalid Supabase URL format"

**Solution**: URL must be in format: `https://your-project-id.supabase.co`

### Issue: "Invalid Supabase anon key format"

**Solution**: Make sure you're using the "anon public" key, not the "service_role" key

### Issue: 500 Server Errors

**Possible causes**:

- Database tables don't exist
- RLS policies are too restrictive
- Database connection issues
- Invalid API key

**Solutions**:

1. Run database migrations
2. Check RLS policies
3. Verify API key permissions
4. Check Supabase project status

## Testing Your Setup

After configuration, you should see:

- ✅ "Supabase configuration validated successfully" in console
- ✅ "Supabase connection test successful" in console
- ✅ No more 500 errors when fetching data
- ✅ Data loading properly in your app

## Need Help?

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase project is active and not paused
3. Ensure your database has the required tables
4. Check if your Supabase plan allows the operations you're trying to perform
