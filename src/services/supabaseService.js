import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const useApi = Boolean(apiBaseUrl);
const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (useApi) {
  console.log('🔧 Using Go API backend for data:', apiBaseUrl);
}

if (!supabaseConfigured) {
  console.warn('⚠️ Supabase credentials not found. Auth features will be disabled.');
}

export const supabase = supabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
};

// Customer Service
export const customerService = {
  getAll: async () => {
    if (useApi) {
      return apiRequest('/customers');
    }
    ensureSupabase();
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
    if (useApi) {
      return apiRequest(`/customers/${id}`);
    }
    ensureSupabase();
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
    if (useApi) {
      return apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(customer),
      });
    }
    ensureSupabase();
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
    if (useApi) {
      return apiRequest(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customer),
      });
    }
    ensureSupabase();
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
    if (useApi) {
      await apiRequest(`/customers/${id}`, { method: 'DELETE' });
      return;
    }
    ensureSupabase();
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
    if (useApi) {
      return apiRequest('/items');
    }
    ensureSupabase();
    const { data, error } = await supabase
      .from('items')
      .select('*');
    if (error) throw error;
    return data;
  },
  getById: async (id) => {
    if (useApi) {
      return apiRequest(`/items/${id}`);
    }
    ensureSupabase();
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  create: async (item) => {
    if (useApi) {
      return apiRequest('/items', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    }
    ensureSupabase();
    const { data, error } = await supabase
      .from('items')
      .insert([item])
      .select();
    if (error) throw error;
    return data[0];
  },
  update: async (id, item) => {
    if (useApi) {
      return apiRequest(`/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
      });
    }
    ensureSupabase();
    const { data, error } = await supabase
      .from('items')
      .update(item)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    if (useApi) {
      await apiRequest(`/items/${id}`, { method: 'DELETE' });
      return;
    }
    ensureSupabase();
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
    if (useApi) {
      return apiRequest('/orders');
    }
    ensureSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*');
    if (error) throw error;
    return data;
  },
  getById: async (id) => {
    if (useApi) {
      return apiRequest(`/orders/${id}`);
    }
    ensureSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  create: async (order) => {
    if (useApi) {
      return apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      });
    }
    ensureSupabase();
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select();
    if (error) throw error;
    return data[0];
  },
  update: async (id, order) => {
    if (useApi) {
      return apiRequest(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(order),
      });
    }
    ensureSupabase();
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    if (useApi) {
      await apiRequest(`/orders/${id}`, { method: 'DELETE' });
      return;
    }
    ensureSupabase();
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
    if (useApi) {
      return apiRequest('/transactions');
    }
    ensureSupabase();
    const { data, error } = await supabase
      .from('transactions')
      .select('*');
    if (error) throw error;
    return data;
  },
  create: async (transaction) => {
    if (useApi) {
      return apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });
    }
    ensureSupabase();
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
    if (useApi) {
      const data = await apiRequest('/analytics/total-revenue');
      return data.total || 0;
    }
    ensureSupabase();
    const { data, error } = await supabase
      .from('transactions')
      .select('amount');
    if (error) throw error;
    return data.reduce((sum, t) => sum + (t.amount || 0), 0);
  },
  getTotalOrders: async () => {
    if (useApi) {
      const data = await apiRequest('/analytics/total-orders');
      return data.count || 0;
    }
    ensureSupabase();
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count;
  },
};
