import { create } from 'zustand';
import { orderService } from '../services/supabaseService';

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  // Fetch all orders from Supabase
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const data = await orderService.getAll();
      set({ orders: data || [] });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Add a new order with items
  addOrder: async (order) => {
    set({ loading: true, error: null });
    try {
      console.log('📤 Creating order:', order);
      const newOrder = await orderService.create({
        customer_id: order.customerId,
        status: order.status || 'pending',
        total_price: order.totalPrice || 0,
        notes: order.notes || null,
      });
      
      set((state) => ({
        orders: [...state.orders, newOrder],
      }));
      
      console.log('✅ Created order:', newOrder);
      // Refresh authoritative data
      try { await get().fetchOrders(); } catch (e) { /* ignore */ }
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    set({ loading: true, error: null });
    try {
      const updated = await orderService.update(orderId, { status });
      // Refresh authoritative data
      try { await get().fetchOrders(); } catch (e) { /* ignore */ }
      return updated;
    } catch (error) {
      console.error('Error updating order status:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete order
  deleteOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      await orderService.delete(orderId);
      // Refresh authoritative data
      try { await get().fetchOrders(); } catch (e) { /* ignore */ }
    } catch (error) {
      console.error('Error deleting order:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Get all orders
  getOrders: () => get().orders,

  // Get active orders
  getActiveOrders: () => get().orders.filter((order) => order.status === 'active' || order.status === 'pending'),

  // Get orders by customer id
  getOrdersByCustomerId: (customerId) => {
    const orders = get().orders;
    return orders.filter((order) => String(order.customer_id) === String(customerId));
  },

  // Get total revenue for orders (for Finance)
  getTotalRevenue: () => {
    return get().orders.reduce((total, order) => {
      return total + (order.total_price || 0);
    }, 0);
  },
}));
