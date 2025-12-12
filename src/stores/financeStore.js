import { create } from 'zustand';
import { transactionService, analyticsService } from '../services/supabaseService';

export const useFinanceStore = create((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  // Fetch all transactions from Supabase
  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await transactionService.getAll();
      set({ transactions: data || [] });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Add transaction (income or expense)
  addTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      console.log('📤 Creating transaction:', transaction);
      const newTransaction = await transactionService.create(transaction);
      set((state) => ({
        transactions: [...state.transactions, newTransaction],
      }));
      console.log('✅ Created transaction:', newTransaction);
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Get all transactions
  getTransactions: () => get().transactions,

  // Get transactions by type (income, expense)
  getTransactionsByType: (type) => {
    return get().transactions.filter((t) => t.type === type);
  },

  // Get transactions by date range
  getTransactionsByDateRange: (startDate, endDate) => {
    return get().transactions.filter((t) => {
      const transDate = new Date(t.created_at);
      return transDate >= startDate && transDate <= endDate;
    });
  },

  // Get total income
  getTotalIncome: () => {
    return get().transactions
      .filter((t) => t.type === 'income')
      .reduce((total, t) => total + (t.amount || 0), 0);
  },

  // Get total expense
  getTotalExpense: () => {
    return get().transactions
      .filter((t) => t.type === 'expense')
      .reduce((total, t) => total + (t.amount || 0), 0);
  },

  // Get balance
  getBalance: () => {
    const income = get().getTotalIncome();
    const expense = get().getTotalExpense();
    return income - expense;
  },
}));
