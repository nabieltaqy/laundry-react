import { create } from 'zustand';
import { itemService } from '../services/supabaseService';

export const useItemStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  // Fetch all items from Supabase
  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const data = await itemService.getAll();
      set({ items: data || [] });
    } catch (error) {
      console.error('Error fetching items:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Add new item
  addItem: async (item) => {
    set({ loading: true, error: null });
    try {
      console.log('📤 Creating item:', item);
      const newItem = await itemService.create(item);
      set((state) => ({
        items: [...state.items, newItem],
      }));
      console.log('✅ Created item:', newItem);
      // Refresh authoritative data
      try { await get().fetchItems(); } catch (e) { /* ignore */ }
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update item
  updateItem: async (itemId, updatedItem) => {
    set({ loading: true, error: null });
    try {
      const updated = await itemService.update(itemId, updatedItem);
      // Refresh authoritative data
      try { await get().fetchItems(); } catch (e) { /* ignore */ }
      return updated;
    } catch (error) {
      console.error('Error updating item:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete item
  deleteItem: async (itemId) => {
    set({ loading: true, error: null });
    try {
      await itemService.delete(itemId);
      // Refresh authoritative data
      try { await get().fetchItems(); } catch (e) { /* ignore */ }
    } catch (error) {
      console.error('Error deleting item:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Get all items
  getItems: () => get().items,

  // Get items by type
  getItemsByType: (type) => get().items.filter((item) => item.type === type),

  // Get item by id
  getItemById: (itemId) => get().items.find((item) => String(item.id) === String(itemId)),
}));
