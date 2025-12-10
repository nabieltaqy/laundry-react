import { create } from 'zustand';

export const useItemStore = create((set, get) => ({
  items: [
    // Sample data
    {
      id: 1,
      name: 'Regular Wash',
      type: 'satuan',
      price: 15000,
      description: 'Regular washing service',
      createdAt: new Date(),
    },
    {
      id: 2,
      name: 'Kiloan Wash',
      type: 'kiloan',
      price: 5000,
      description: 'Washing per kilogram',
      createdAt: new Date(),
    },
    {
      id: 3,
      name: 'Sabun',
      type: 'product',
      price: 0,
      description: 'Laundry soap / detergent',
      priceEditable: true,
      createdAt: new Date(),
    },
    {
      id: 4,
      name: 'Electrical Token',
      type: 'product',
      price: 0,
      description: 'Prepaid electricity token (enter custom amount)',
      priceEditable: true,
      createdAt: new Date(),
    },
  ],

  // Add new item
  addItem: (item) => set((state) => ({
    items: [
      ...state.items,
      {
        id: Date.now(),
        ...item,
        priceEditable: item.priceEditable || false,
        createdAt: new Date(),
      },
    ],
  })),

  // Update item
  updateItem: (itemId, updatedItem) => set((state) => ({
    items: state.items.map((item) =>
      item.id === itemId ? { ...item, ...updatedItem } : item
    ),
  })),

  // Delete item
  deleteItem: (itemId) => set((state) => ({
    items: state.items.filter((item) => item.id !== itemId),
  })),

  // Get all items
  getItems: () => get().items,

  // Get items by type
  getItemsByType: (type) => get().items.filter((item) => item.type === type),

  // Get item by id
  getItemById: (itemId) => get().items.find((item) => item.id === itemId),
}));
