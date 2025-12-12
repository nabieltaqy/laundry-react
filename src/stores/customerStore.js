import { create } from 'zustand';
import { customerService } from '../services/supabaseService';

export const useCustomerStore = create((set, get) => ({
  customers: [],
  loading: false,
  error: null,

  // Fetch all customers from Supabase
  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await customerService.getAll();
      set({ customers: data || [] });
    } catch (error) {
      console.error('Error fetching customers:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Add new customer to Supabase
  addCustomer: async (customer) => {
    set({ loading: true, error: null });
    try {
      const newCustomer = await customerService.create(customer);
      set((state) => ({
        customers: [...state.customers, newCustomer],
      }));
      // Refresh authoritative data
      try { await get().fetchCustomers(); } catch (e) { /* ignore */ }
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update customer in Supabase
  updateCustomer: async (customerId, updatedCustomer) => {
    set({ loading: true, error: null });
    try {
      const updated = await customerService.update(customerId, updatedCustomer);
      // Refresh authoritative data
      try { await get().fetchCustomers(); } catch (e) { /* ignore */ }
      return updated;
    } catch (error) {
      console.error('Error updating customer:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete customer from Supabase
  deleteCustomer: async (customerId) => {
    set({ loading: true, error: null });
    try {
      await customerService.delete(customerId);
      // Refresh authoritative data
      try { await get().fetchCustomers(); } catch (e) { /* ignore */ }
    } catch (error) {
      console.error('Error deleting customer:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Search customers
  searchCustomers: (query) => {
    const { customers } = get();
    if (!query) return customers;
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q)
    );
  },

  // Get customers list
  getCustomers: () => get().customers,

  // Get customer by id
  getCustomerById: (customerId) =>
    get().customers.find((c) => String(c.id) === String(customerId)),
}));
