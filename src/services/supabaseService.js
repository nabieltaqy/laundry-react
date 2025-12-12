import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config:');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error('Missing Supabase credentials in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase client initialized');

// Customer Service
export const customerService = {
  getAll: async () => {
    try {
      console.log('📥 Fetching all customers...');
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      if (error) {
        console.error('❌ Fetch error:', error);
        throw error;
      }
      console.log('✅ Fetched customers:', data);
      return data;
    } catch (err) {
      console.error('❌ Exception in getAll:', err);
      throw err;
    }
  },
  getById: async (id) => {
    try {
      console.log('📥 Fetching customer:', id);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('❌ Exception in getById:', err);
      throw err;
    }
  },
  create: async (customer) => {
    try {
      console.log('📤 Creating customer:', customer);
      
      // Add user_id for tracking (optional but recommended)
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          address: customer.address || null,
        }])
        .select();
      
      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw new Error(`Supabase error: ${error.message} (${error.code})`);
      }
      
      if (!data || data.length === 0) {
        console.error('❌ No data returned from insert');
        throw new Error('Insert succeeded but no data returned');
      }
      
      console.log('✅ Created customer:', data[0]);
      return data[0];
    } catch (err) {
      console.error('❌ Exception in create:', err);
      throw err;
    }
  },
  update: async (id, customer) => {
    try {
      console.log('📝 Updating customer:', id, customer);
      const { data, error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)
        .select();
      if (error) throw error;
      console.log('✅ Updated customer:', data);
      return data[0];
    } catch (err) {
      console.error('❌ Exception in update:', err);
      throw err;
    }
  },
  delete: async (id) => {
    try {
      console.log('🗑️ Deleting customer:', id);
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      console.log('✅ Deleted customer');
    } catch (err) {
      console.error('❌ Exception in delete:', err);
      throw err;
    }
  },
};

// Item Service
export const itemService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*');
    if (error) throw error;
    return data;
  },
  getById: async (id) => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  create: async (item) => {
    const { data, error } = await supabase
      .from('items')
      .insert([item])
      .select();
    if (error) throw error;
    return data[0];
  },
  update: async (id, item) => {
    const { data, error } = await supabase
      .from('items')
      .update(item)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Order Service
export const orderService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*');
    if (error) throw error;
    return data;
  },
  getById: async (id) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  create: async (order) => {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select();
    if (error) throw error;
    return data[0];
  },
  update: async (id, order) => {
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Transaction Service
export const transactionService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*');
    if (error) throw error;
    return data;
  },
  create: async (transaction) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select();
    if (error) throw error;
    return data[0];
  },
};

// Analytics Service
export const analyticsService = {
  getTotalRevenue: async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount');
    if (error) throw error;
    return data.reduce((sum, t) => sum + (t.amount || 0), 0);
  },
  getTotalOrders: async () => {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count;
  },
};
