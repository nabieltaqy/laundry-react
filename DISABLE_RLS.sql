-- Check and fix RLS policies for all tables
-- This allows unauthenticated access to the tables for development

-- For customers table
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- For items table
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- For orders table
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- For order_items table
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- For transactions table
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'items', 'orders', 'order_items', 'transactions');
