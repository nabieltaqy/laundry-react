import { create } from 'zustand';

export const useCustomerStore = create((set, get) => ({
  customers: [
    {
      id: 1,
      name: 'John Doe',
      phone: '08123456789',
      address: '123 Main St',
      email: 'john@example.com',
      createdAt: new Date(),
    },
    {
      id: 2,
      name: 'Jane Smith',
      phone: '08987654321',
      address: '456 Oak Ave',
      email: 'jane@example.com',
      createdAt: new Date(),
    },
  ],

  // Add new customer
  addCustomer: (customer) =>
    set((state) => ({
      customers: [
        ...state.customers,
        {
          id: Date.now(),
          ...customer,
          createdAt: new Date(),
        },
      ],
    })),

  // Update customer
  updateCustomer: (customerId, updatedCustomer) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? { ...customer, ...updatedCustomer }
          : customer
      ),
    })),

  // Delete customer
  deleteCustomer: (customerId) =>
    set((state) => ({
      customers: state.customers.filter((customer) => customer.id !== customerId),
    })),

  // Get all customers
  getCustomers: () => get().customers,

  // Get customer by id
  getCustomerById: (customerId) =>
    get().customers.find((customer) => customer.id === customerId),

  // Search customers by name or phone
  searchCustomers: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowerQuery) ||
        customer.phone.includes(query)
    );
  },
}));
