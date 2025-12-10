import { create } from 'zustand';

export const useFinanceStore = create((set, get) => ({
  transactions: [],

  // Add transaction (income or expense)
  addTransaction: (transaction) => set((state) => ({
    transactions: [
      ...state.transactions,
      {
        id: Date.now(),
        ...transaction,
        createdAt: new Date(),
      },
    ],
  })),

  // Get all transactions
  getTransactions: () => get().transactions,

  // Get transactions by type (income, expense)
  getTransactionsByType: (type) => {
    return get().transactions.filter((t) => t.type === type);
  },

  // Get transactions by date range
  getTransactionsByDateRange: (startDate, endDate) => {
    return get().transactions.filter((t) => {
      const transDate = new Date(t.createdAt);
      return transDate >= startDate && transDate <= endDate;
    });
  },

  // Get total income
  getTotalIncome: () => {
    return get().transactions
      .filter((t) => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
  },

  // Get total expense
  getTotalExpense: () => {
    return get().transactions
      .filter((t) => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
  },

  // Get income by date
  getIncomeByDate: (date) => {
    const transactions = get().transactions.filter((t) => {
      const transDate = new Date(t.createdAt);
      return (
        t.type === 'income' &&
        transDate.toDateString() === new Date(date).toDateString()
      );
    });
    return transactions.reduce((total, t) => total + t.amount, 0);
  },

  // Get income for month
  getIncomeByMonth: (year, month) => {
    const transactions = get().transactions.filter((t) => {
      const transDate = new Date(t.createdAt);
      return (
        t.type === 'income' &&
        transDate.getFullYear() === year &&
        transDate.getMonth() === month
      );
    });
    return transactions.reduce((total, t) => total + t.amount, 0);
  },

  // Get balance
  getBalance: () => {
    const income = get().getTotalIncome();
    const expense = get().getTotalExpense();
    return income - expense;
  },
}));
