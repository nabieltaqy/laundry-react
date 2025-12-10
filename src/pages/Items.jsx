import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import { useItemStore } from '../stores/itemStore';
import { formatCurrency } from '../utils/formatters';

const Items = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'satuan',
    price: '',
    description: '',
  });

  const itemStore = useItemStore();
  // items page now shows expense items / products (type 'product' or priceEditable)
  const allItems = itemStore.getItems().filter(i => i.type === 'product' || i.priceEditable === true);
  
  // Search filter
  const filteredItems = searchQuery
    ? allItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase())))
    : allItems;

  // Helper functions for highlighting matches
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
      [name]: name === 'price' ? parseFloat(value) || '' : value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'product',
      price: '',
      priceEditable: true,
      description: '',
    });
    setEditingItemId(null);
  };

  // Add new item
  const handleAddItem = () => {
    if (!formData.name.trim()) {
      alert('Please enter item name');
      return;
    }

    // Create expense item (product) without fixed price; price is entered at expense time
    itemStore.addItem({
      name: formData.name,
      type: 'product',
      price: 0,
      priceEditable: true,
      description: formData.description,
    });

    resetForm();
    setIsAddModalOpen(false);
    alert('Item added successfully!');
  };

  // Edit item
  const handleEditItem = (item) => {
    setFormData({
      name: item.name,
      type: item.type,
      price: item.price,
      priceEditable: item.priceEditable || true,
      description: item.description,
    });
    setEditingItemId(item.id);
    setIsEditModalOpen(true);
  };

  // Update item
  const handleUpdateItem = () => {
    if (!formData.name.trim()) {
      alert('Please enter item name');
      return;
    }

    itemStore.updateItem(editingItemId, {
      name: formData.name,
      type: 'product',
      price: 0,
      priceEditable: true,
      description: formData.description,
    });

    resetForm();
    setIsEditModalOpen(false);
    alert('Item updated successfully!');
  };

  // Delete item
  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      itemStore.deleteItem(itemId);
      alert('Item deleted successfully!');
    }
  };

  // Items page shows expense items only; service counts removed

  const itemColumns = [
    { key: 'name', label: 'Item Name' },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className={row.type === 'kiloan' ? 'badge badge--blue' : 'badge badge--green'}>{row.type}</span>
      ),
    },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div>
      <div className="mb-8" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 className="page-title">Items</h1>
        <Button onClick={() => setIsAddModalOpen(true)} variant="primary">
          <Plus size={20} />
          Add Item
        </Button>
      </div>

      {/* Search */}
      <div className="mb-8" style={{ position: 'relative', maxWidth: 680 }}>
        <Input
          placeholder="Search items — try a name or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
          aria-label="Search items"
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
            {(searchQuery ? filteredItems : allItems)
              .slice(0, 8)
              .map((item) => (
                <div
                  key={item.id}
                  role="option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery(item.name);
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
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,#f3f4f6,#e9eef8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight:700, color:'#111', fontSize: 12 }}>
                    {item.name.split(' ').map(s=>s[0]).slice(0,2).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{highlightMatch(item.name, searchQuery)}</div>
                    {item.description && (<div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{item.description}</div>)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid mb-8">
        <Card>
          <div style={{textAlign:'center'}}>
            <p className="text-muted">Total Items</p>
            <p style={{fontSize:28,fontWeight:700,marginTop:8}}>{allItems.length}</p>
          </div>
        </Card>
      </div>

      {/* Items Table */}
      <Card title="All Items" subtitle={`Total: ${allItems.length} items`}>
        <Table
          columns={itemColumns}
          data={filteredItems}
          actions={(row) => [
            <Button
              key="edit"
              variant="secondary"
              size="sm"
              onClick={() => handleEditItem(row)}
            >
              <Edit2 size={16} />
            </Button>,
            <Button
              key="delete"
              variant="danger"
              size="sm"
              onClick={() => handleDeleteItem(row.id)}
            >
              <Trash2 size={16} />
            </Button>,
          ]}
        />
      </Card>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New Item"
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
            <Button variant="primary" onClick={handleAddItem}>
              Add Item
            </Button>
          </>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input
            label="Item Name"
            placeholder="e.g., Regular Wash"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          {/* Items page is for expense items (products). Type is fixed to 'product' and price is entered when recording expense. */}
          <Input
            label="Description"
            placeholder="Describe this item"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Edit Item"
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
            <Button variant="primary" onClick={handleUpdateItem}>
              Update Item
            </Button>
          </>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input
            label="Item Name"
            placeholder="e.g., Regular Wash"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          {/* Type and Price removed for expense items — items are products whose price is entered when recording an expense */}
          <Input
            label="Description"
            placeholder="Describe this service"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Items;
