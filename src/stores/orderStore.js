import { create } from 'zustand';

export const useOrderStore = create((set, get) => ({
  orders: [],
  
  // Add a new order with items
  addOrder: (order) => set((state) => {
    const id = Date.now();
    const orderNumber = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(id).slice(-6)}`;
    return ({
      orders: [
        ...state.orders,
        {
          id,
          orderNumber,
          ...order,
          createdAt: new Date(),
          status: 'active', // active, completed
        },
      ],
    });
  }),

  // Update order status
  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map((order) =>
      order.id === orderId ? { ...order, status } : order
    ),
  })),

  // Delete order
  deleteOrder: (orderId) => set((state) => ({
    orders: state.orders.filter((order) => order.id !== orderId),
  })),

  // Get all orders
  getOrders: () => get().orders,

  // Get active orders
  getActiveOrders: () => get().orders.filter((order) => order.status === 'active'),

  // Get orders by date
  getOrdersByDate: (date) => {
    const orders = get().orders;
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === new Date(date).toDateString();
    });
  },

  // Get orders by customer id
  getOrdersByCustomerId: (customerId) => {
    const orders = get().orders;
    return orders.filter((order) => Number(order.customerId) === Number(customerId));
  },

  // Calculate total kilos for a day
  getTotalKilosInDay: (date) => {
    const orders = get().getOrdersByDate(date);
    return orders.reduce((total, order) => {
      const kiloItems = order.items.filter((item) => item.type === 'kiloan');
      const kilosSum = kiloItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      return total + kilosSum;
    }, 0);
  },

  // Get total revenue for orders (for Finance)
  getTotalRevenue: () => {
    return get().orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      return total + orderTotal;
    }, 0);
  },
}));
