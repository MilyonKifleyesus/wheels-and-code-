# Website Setup Instructions

Your website has data loading and admin login issues. Here's how to fix them:

## 🔧 Step 1: Configure Supabase Environment Variables

1. **Create a `.env` file** in your project root (if it doesn't exist)
2. **Get your Supabase credentials:**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in and select your project
   - Go to **Settings** → **API**
   - Copy the following values:

3. **Add to your `.env` file:**
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🗄️ Step 2: Run Database Migrations

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run the migration files in order (they should already be applied)

## 👤 Step 3: Create Admin User

### Option A: Use the Admin Login Page
1. Go to `/admin` on your website
2. Click "Use Default Admin Credentials"
3. Login with:
   - **Email:** `admin@company.com`
   - **Password:** `admin123456`

### Option B: Manual Database Setup
If the automatic creation doesn't work:

1. Go to **SQL Editor** in Supabase
2. Run this SQL:
```sql
-- Create admin profile
INSERT INTO profiles (id, email, full_name, role)
VALUES (gen_random_uuid(), 'admin@company.com', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;
```

## 🚀 Step 4: Test Your Setup

1. **Check Data Loading:**
   - Visit your homepage
   - Check if vehicles and services are displayed
   - If empty, the system will automatically add sample data

2. **Test Admin Login:**
   - Go to `/admin`
   - Login with `admin@company.com` / `admin123456`
   - You should see the admin dashboard

## 🔍 Troubleshooting

### If data is still not loading:
- Check browser console for errors
- Verify your `.env` file is in the project root
- Restart your development server: `npm run dev`

### If admin login fails:
- Check the browser console for detailed error messages
- Verify your Supabase project is active (not paused)
- Try the manual database setup option above

### Common Issues:
1. **"Missing Supabase environment variables"** → Check your `.env` file
2. **"Invalid Supabase URL format"** → URL must be `https://your-project-id.supabase.co`
3. **"500 Server Error"** → Check if your Supabase project is paused
4. **"Invalid login credentials"** → Admin user might not exist, try Option B above

## 📞 Need More Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify your Supabase project status in the dashboard
3. Make sure all migration files have been applied
4. Try creating the admin user manually using the SQL provided above

The system is now configured to automatically create sample data and handle admin user creation, so these issues should be resolved once your Supabase connection is properly configured.