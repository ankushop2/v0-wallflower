-- Seed default admin user
-- This creates the admin user in the public.users table
-- The admin will need to use Supabase password reset on first login

-- Create a simple admin record that will be linked when they sign in
-- Note: In production, you should create the auth user via Supabase Dashboard or API first

-- Insert into users table only (admin must be created in Supabase Auth Dashboard first)
-- To create the admin user:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > Email: admin@wallflower.com, Password: granola123
-- 3. Run this script to add them to the users table with admin role

-- For development, we can use a simpler approach:
-- Create the user profile (assumes auth user exists or will be created on first login)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Try to find existing auth user
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@wallflower.com';
  
  -- If found, insert/update the profile
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, role, created_at)
    VALUES (admin_user_id, 'admin@wallflower.com', 'admin', NOW())
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'Admin user profile created/updated';
  ELSE
    RAISE NOTICE 'Auth user not found. Please create admin@wallflower.com in Supabase Auth Dashboard first';
  END IF;
END $$;
