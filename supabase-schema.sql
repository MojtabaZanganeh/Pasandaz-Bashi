-- ============================================
-- پس‌انداز باشی- Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor to set up the database
-- This creates a custom auth system with username/password only (no email)

-- ============================================
-- 1. USERS TABLE (without email)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- 2. SAVINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS savings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  hours DECIMAL(10, 2) NOT NULL,
  month VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_savings_user_id ON savings(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_month ON savings(month);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;

-- Allow all operations (since we handle auth in our app with JWT)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on savings" ON savings FOR ALL USING (true);

-- ============================================
-- 4. TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTES
-- ============================================
-- 1. Incomes are stored only in localStorage (not in database)
--    for security reasons - user income data never leaves their device
-- 2. Only savings are synced to the database for logged-in users
-- 3. Auth is handled with custom JWT (see lib/auth.ts)
--    not Supabase Auth, which requires email
