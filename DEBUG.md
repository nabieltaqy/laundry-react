# Debug Guide: Data Not Saving to Supabase

## Step 1: Check Browser Console
1. Open your app in browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for logs starting with 🔧, ✅, ❌, 📤, etc.
5. **Screenshot any errors and share them**

## Step 2: Verify Supabase Connection
You should see in the console:
```
🔧 Supabase Config:
URL: https://odvpltixchiblfxdqsub.supabase.co
Key exists: true
✅ Supabase client initialized
```

If you see errors about missing credentials, check `.env.local` file.

## Step 3: Try to Add a Customer
1. Login to the app
2. Go to Customers page
3. Click "Add Customer"
4. Fill in form:
   - Name: "Test Customer"
   - Phone: "08123456789"
5. Click "Add Customer" button
6. **Check console** - you should see:
```
📤 Creating customer: {name: "Test Customer", phone: "08123456789", ...}
✅ Created customer: [{id: 123, name: "Test Customer", ...}]
```

## Step 4: Check Row Level Security (RLS)
The most common issue is RLS blocking access. 

1. Go to Supabase Dashboard
2. Click on **Authentication** → **Policies**
3. Check if each table (customers, items, orders, etc.) has RLS enabled
4. If RLS is **ENABLED**, run the `DISABLE_RLS.sql` script:
   - Go to SQL Editor
   - Copy all SQL from `DISABLE_RLS.sql`
   - Run it

## Step 5: Verify Tables Exist
1. Go to Supabase Dashboard
2. Click **Table Editor**
3. You should see these tables:
   - customers
   - items
   - orders
   - order_items
   - transactions

If any table is missing, run `supabase_schema.sql` again.

## Common Errors and Solutions

### Error: "relation 'customers' does not exist"
**Solution:** Run `supabase_schema.sql` to create tables

### Error: "permission denied for schema public"
**Solution:** Run `DISABLE_RLS.sql` to disable Row Level Security

### Error: "Invalid API key"
**Solution:** Check `.env.local` - make sure you have correct VITE_SUPABASE_ANON_KEY

### Data appears but disappears on reload
**Solution:** The data IS being saved! The issue is the store doesn't reload on page load. The app needs to call `fetchCustomers()` on component mount, which should already be happening.

## Check API Response
In browser console, after trying to save:
```javascript
// Copy this in console to test the API manually
import { customerService } from '/src/services/supabaseService.js'
const result = await customerService.getAll()
console.log(result)
```

If you see data, it means Supabase IS working!

## Next: Report These Logs
When reporting an issue, include:
1. The console logs (screenshot or copy-paste)
2. The exact error messages
3. Steps you took
4. Whether you ran DISABLE_RLS.sql
