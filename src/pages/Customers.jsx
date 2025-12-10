import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import { useCustomerStore } from '../stores/customerStore';
import { useOrderStore } from '../stores/orderStore';

const Customers = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const customerStore = useCustomerStore();
  const allCustomers = customerStore.getCustomers();
  const filteredCustomers = searchQuery
    ? customerStore.searchCustomers(searchQuery)
    : allCustomers;

  const escapeRegExp = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlightMatch = (text = '', q = '') => {
    if (!q) return text;
    try {
      const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, 'i'));
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <span key={i} style={{ background: 'rgba(250,215,77,0.35)', padding: '0 4px', borderRadius: 4 }}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    } catch (e) {
      return text;
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
    });
    setEditingCustomerId(null);
  };

  // Add new customer
  const handleAddCustomer = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please fill in name and phone');
      return;
    }

    customerStore.addCustomer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
    });

    resetForm();
    setIsAddModalOpen(false);
    alert('Customer added successfully!');
  };

  // Edit customer
  const handleEditCustomer = (customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });
    setEditingCustomerId(customer.id);
    setIsEditModalOpen(true);
  };

  // Update customer
  const handleUpdateCustomer = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please fill in name and phone');
      return;
    }

    customerStore.updateCustomer(editingCustomerId, {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
    });

    resetForm();
    setIsEditModalOpen(false);
    alert('Customer updated successfully!');
  };

  // Delete customer
  const handleDeleteCustomer = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      customerStore.deleteCustomer(customerId);
      alert('Customer deleted successfully!');
    }
  };

  const customerColumns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
  ];

  // History modal state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyCustomerId, setHistoryCustomerId] = useState(null);
  const orderStore = useOrderStore();
  const getCustomerOrders = (customerId) => orderStore.getOrdersByCustomerId(customerId || 0);

  return (
    <div>
      <div className="page-header mb-8">
        <h1 className="page-title">Customers</h1>
        <Button onClick={() => setIsAddModalOpen(true)} variant="primary">
          <Plus size={20} />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="mb-8" style={{ position: 'relative', maxWidth: 680 }}>
        <Input
          placeholder="Search customers — try a name, phone, or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
          aria-label="Search customers"
        />

        {showSuggestions && (
          <div
            role="listbox"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              marginTop: 8,
              background: 'var(--card-bg, #fff)',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
              borderRadius: 8,
              zIndex: 40,
              overflow: 'hidden',
            }}
          >
            {(searchQuery ? allCustomers.filter(c => {
              const q = searchQuery.toLowerCase();
              return (
                c.name.toLowerCase().includes(q) ||
                (c.phone || '').toLowerCase().includes(q) ||
                (c.email || '').toLowerCase().includes(q)
              );
            }) : allCustomers)
              .slice(0, 8)
              .map((c) => (
                <div
                  key={c.id}
                  role="option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery(c.name);
                    setShowSuggestions(false);
                  }}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,#f3f4f6,#e9eef8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight:700, color:'#111' }}>
                    {c.name.split(' ').map(s=>s[0]).slice(0,2).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{highlightMatch(c.name, searchQuery)}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{c.phone}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, color: 'var(--muted)', fontSize: 13 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Phone size={14} />{c.phone}</div>
                      {c.email && (<div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Mail size={14} />{c.email}</div>)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid mb-8">
        <Card>
          <div style={{ textAlign: 'center' }}>
            <p className="text-muted">Total Customers</p>
            <p style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{allCustomers.length}</p>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <p className="text-muted">Active Customers</p>
            <p style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{filteredCustomers.length}</p>
          </div>
        </Card>
      </div>

      {/* Customers Table */}
      <Card title="Customer List" subtitle={`Total: ${allCustomers.length} customers`}>
        <Table
          columns={customerColumns}
          data={filteredCustomers}
          actions={(row) => [
            <Button
              key="edit"
              variant="secondary"
              size="sm"
              onClick={() => handleEditCustomer(row)}
            >
              <Edit2 size={16} />
            </Button>,
            <Button
              key="history"
              variant="secondary"
              size="sm"
              onClick={() => {
                setHistoryCustomerId(row.id);
                setIsHistoryOpen(true);
              }}
            >
              <Clock size={16} />
            </Button>,
            <Button
              key="delete"
              variant="danger"
              size="sm"
              onClick={() => handleDeleteCustomer(row.id)}
            >
              <Trash2 size={16} />
            </Button>,
          ]}
        />
        {filteredCustomers.length === 0 && (
          <p className="empty-msg">No customers found</p>
        )}
      </Card>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New Customer"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCustomer}>
              Add Customer
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Name"
            placeholder="Enter customer name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Phone"
            placeholder="e.g., 08123456789"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="customer@example.com"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Input
            label="Address"
            placeholder="Enter address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
      </Modal>

      {/* Customer Order History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setHistoryCustomerId(null);
        }}
        title="Customer Order History"
        size="lg"
        footer={<Button variant="secondary" onClick={() => setIsHistoryOpen(false)}>Close</Button>}
      >
        {historyCustomerId ? (
          <div>
            {getCustomerOrders(historyCustomerId).length === 0 ? (
              <p className="empty-msg">No orders found for this customer.</p>
            ) : (
              <Table
                columns={[
                  { key: 'orderNumber', label: 'Order #' },
                  { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleString() },
                  { key: 'items', label: 'Items', render: (r) => r.items.length },
                  { key: 'totalAmount', label: 'Total', render: (r) => r.totalAmount?.toLocaleString ? r.totalAmount.toLocaleString() : r.totalAmount },
                  { key: 'status', label: 'Status', render: (r) => (<span className={r.status === 'active' ? 'badge badge--green' : 'badge badge--gray'}>{r.status}</span>) },
                ]}
                data={getCustomerOrders(historyCustomerId)}
              />
            )}
          </div>
        ) : (
          <p className="empty-msg">Select a customer to view history.</p>
        )}
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Edit Customer"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateCustomer}>
              Update Customer
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Name"
            placeholder="Enter customer name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Phone"
            placeholder="e.g., 08123456789"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="customer@example.com"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Input
            label="Address"
            placeholder="Enter address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
