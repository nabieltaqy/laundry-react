# Supabase Setup Instructions

## Before running the app, you MUST create the database tables in Supabase!

### Steps to set up your database:

1. **Go to your Supabase project**: https://app.supabase.com
2. **Navigate to SQL Editor**
3. **Create a new query**
4. **Copy and paste the SQL schema** from `supabase_schema.sql`
5. **Run the query** to create all tables

### What the schema creates:
- `customers` - Store customer information
- `items` - Store laundry services/items
- `orders` - Store customer orders
- `order_items` - Line items for each order
- `transactions` - Payment records

### Why data isn't saving:
Without these tables in Supabase, any attempt to save data will fail. The app uses Supabase API to:
1. Authenticate users ✅ (working)
2. Store customer data ❌ (needs tables)
3. Store order data ❌ (needs tables)
4. Store item data ❌ (needs tables)

### Your Supabase credentials are already configured in `.env.local`:
```
VITE_SUPABASE_URL=https://odvpltixchiblfxdqsub.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Foqj5IeWPIGj76f2CDC9Jg_DIBa7Lse
```

### After creating the tables:
1. Restart your app (npm start)
2. Login with a test account
3. Try adding a customer - it should now save to Supabase!

### Test the connection:
After tables are created, try these operations:
- Add a customer
- Add an item
- Create an order
- Check your Supabase table data to verify it was saved

If you still have issues, check the browser console (F12) for error messages.
