-- Create default admin user
-- Password: admin123 (this will be hashed by Supabase)
-- Run this after the first admin signs up through Supabase Auth

-- Note: In production, you'll create the first admin through Supabase Auth UI
-- Then update their role manually or through an admin script

-- Example: After admin@wallflower.com signs up, update their role:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@wallflower.com';
