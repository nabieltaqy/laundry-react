import React, { useState } from 'react';
import { Search, Trash2, Eye } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import { useOrderStore } from '../stores/orderStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const Orders = () => {
  const orderStore = useOrderStore();
  const allOrders = orderStore.getOrders();
  const [query, setQuery] = useState('');

  const filtered = query
    ? allOrders.filter(o => {
        const q = query.toLowerCase();
        return (
          (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
          (String(o.id).includes(q)) ||
          (o.customerName && o.customerName.toLowerCase().includes(q))
        );
      })
    : allOrders;

  const columns = [
    { key: 'orderNumber', label: 'Order #' },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'customerName', label: 'Customer' },
    { key: 'items', label: 'Items', render: (row) => row.items.length },
    { key: 'totalAmount', label: 'Total', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'status', label: 'Status', render: (row) => <span className={row.status === 'active' ? 'badge badge--green' : 'badge badge--gray'}>{row.status}</span> },
  ];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <h1 className="page-title">Orders</h1>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <Input
            placeholder="Search by order #, customer or id"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Card title="All Orders" subtitle={`Total: ${allOrders.length} orders`}>
        {filtered.length === 0 ? (
          <p className="empty-msg">No orders found</p>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            actions={(row) => [
              <Button key="view" variant="secondary" size="sm">
                <Eye size={16} />
              </Button>,
              <Button key="delete" variant="danger" size="sm" onClick={() => orderStore.deleteOrder(row.id)}>
                <Trash2 size={16} />
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default Orders;
