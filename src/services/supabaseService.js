import React, { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Customer Service
export const customerService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*');
    if (error) throw error;
    return data;
  },
  getById: async (id) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  create: async (customer) => {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select();
    if (error) throw error;
    return data[0];
  },
  update: async (id, customer) => {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
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
