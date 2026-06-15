-- Run this in the Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  mpin_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'employee', 'admin')),
  name TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customer Details Table
CREATE TABLE customer_details (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  medical_issues TEXT,
  device_support TEXT
);

-- 3. Employee Details Table
CREATE TABLE employee_details (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  experience TEXT NOT NULL,
  shift_preference TEXT NOT NULL CHECK (shift_preference IN ('morning', 'evening')),
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  kyc_document_details TEXT NOT NULL
);

-- 4. Orders Table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_device_type TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  locked_price NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status TEXT NOT NULL DEFAULT 'unassigned' CHECK (order_status IN ('unassigned', 'assigned', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - Optional but recommended. 
-- For MVP, we will allow all access for demonstration.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert access" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update access" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Allow all read access" ON customer_details FOR SELECT USING (true);
CREATE POLICY "Allow all insert access" ON customer_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update access" ON customer_details FOR UPDATE USING (true);

CREATE POLICY "Allow all read access" ON employee_details FOR SELECT USING (true);
CREATE POLICY "Allow all insert access" ON employee_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update access" ON employee_details FOR UPDATE USING (true);

CREATE POLICY "Allow all read access" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow all insert access" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update access" ON orders FOR UPDATE USING (true);
