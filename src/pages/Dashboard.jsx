import React from 'react';
import { BarChart3, DollarSign, Package, Zap } from 'lucide-react';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Table from '../components/common/Table';
import { useOrderStore } from '../stores/orderStore';
import { calculateDashboardStats } from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/formatters';

const Dashboard = () => {
  const orders = useOrderStore((state) => state.getOrders());
  const stats = calculateDashboardStats(orders, []);

  // Get active orders details
  const activeOrders = orders.filter((order) => order.status === 'active');

  const orderColumns = [
    { key: 'id', label: 'Order ID' },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'items',
      label: 'Items',
      render: (row) => row.items.map((item) => item.name).join(', '),
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => {
        const total = row.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return formatCurrency(total);
      },
    },
  ];

  return (
    <div>
      <h1 className="page-title mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="stats-grid mb-8">
        <StatCard
          icon={Zap}
          label="Active Orders"
          value={stats.activeOrdersCount}
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          label="Today Revenue"
          value={formatCurrency(stats.todayRevenue)}
          color="green"
        />
        <StatCard
          icon={BarChart3}
          label="Month Revenue"
          value={formatCurrency(stats.monthRevenue)}
          color="yellow"
        />
        <StatCard
          icon={Package}
          label="Total Kilos"
          value={`${stats.totalKilos} kg`}
          color="red"
        />
      </div>

      {/* Active Orders */}
      <Card title="Active Orders" subtitle={`${activeOrders.length} orders in progress`}>
        <Table
          columns={orderColumns}
          data={activeOrders}
        />
        {activeOrders.length === 0 && (
          <p className="empty-msg">
            No active orders at the moment
          </p>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
