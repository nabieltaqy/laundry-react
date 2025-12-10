// Calculate statistics for dashboard
export const calculateDashboardStats = (orders, financeTransactions) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Today's orders
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  // Active orders
  const activeOrders = orders.filter((order) => order.status === 'active');

  // Today's revenue
  const todayRevenue = todayOrders.reduce((total, order) => {
    const orderTotal = order.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    return total + orderTotal;
  }, 0);

  // Month revenue
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getMonth() === currentMonth &&
      orderDate.getFullYear() === currentYear
    );
  });

  const monthRevenue = monthOrders.reduce((total, order) => {
    const orderTotal = order.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    return total + orderTotal;
  }, 0);

  // Total kilos today
  const totalKilos = todayOrders.reduce((total, order) => {
    const kiloItems = order.items.filter((item) => item.type === 'kiloan');
    const kilosSum = kiloItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return total + kilosSum;
  }, 0);

  return {
    activeOrdersCount: activeOrders.length,
    todayRevenue,
    monthRevenue,
    totalKilos,
  };
};
