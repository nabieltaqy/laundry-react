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

const Services = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'satuan',
    price: '',
    description: '',
  });

  const itemStore = useItemStore();
  // services: only 'satuan' and 'kiloan'
  const services = itemStore.getItems().filter(i => i.type === 'satuan' || i.type === 'kiloan');

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
    setFormData({ name: '', type: 'satuan', price: '', description: '' });
    setEditingItemId(null);
  };

  // Add new service
  const handleAddItem = () => {
    if (!formData.name.trim() || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    itemStore.addItem({
      name: formData.name,
      type: formData.type,
      price: formData.price,
      description: formData.description,
      priceEditable: false,
    });

    resetForm();
    setIsAddModalOpen(false);
    alert('Service added successfully!');
  };

  // Edit service
  const handleEditItem = (item) => {
    setFormData({ name: item.name, type: item.type, price: item.price, description: item.description });
    setEditingItemId(item.id);
    setIsEditModalOpen(true);
  };

  // Update service
  const handleUpdateItem = () => {
    if (!formData.name.trim() || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    itemStore.updateItem(editingItemId, {
      name: formData.name,
      type: formData.type,
      price: formData.price,
      description: formData.description,
      priceEditable: false,
    });

    resetForm();
    setIsEditModalOpen(false);
    alert('Service updated successfully!');
  };

  // Delete service
  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      itemStore.deleteItem(itemId);
      alert('Service deleted successfully!');
    }
  };

  const itemColumns = [
    { key: 'name', label: 'Service Name' },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className={row.type === 'kiloan' ? 'badge badge--blue' : 'badge badge--green'}>{row.type}</span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => formatCurrency(row.price),
    },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div>
      <div className="mb-8" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 className="page-title">Services</h1>
        <Button onClick={() => setIsAddModalOpen(true)} variant="primary">
          <Plus size={20} />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-8">
        <Card>
          <div style={{textAlign:'center'}}>
            <p className="text-muted">Total Services</p>
            <p style={{fontSize:28,fontWeight:700,marginTop:8}}>{services.length}</p>
          </div>
        </Card>
      </div>

      {/* Services Table */}
      <Card title="All Services" subtitle={`Total: ${services.length} services`}>
        <Table
          columns={itemColumns}
          data={services}
          actions={(row) => [
            <Button key="edit" variant="secondary" size="sm" onClick={() => handleEditItem(row)}>
              <Edit2 size={16} />
            </Button>,
            <Button key="delete" variant="danger" size="sm" onClick={() => handleDeleteItem(row.id)}>
              <Trash2 size={16} />
            </Button>,
          ]}
        />
      </Card>

      {/* Add Service Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm(); }} title="Add New Service" size="md" footer={(
        <>
          <Button variant="secondary" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleAddItem}>Add Service</Button>
        </>
      )}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input label="Service Name" placeholder="e.g., Regular Wash" name="name" value={formData.name} onChange={handleInputChange} required />
          <Select label="Type" options={[{ id: 'satuan', name: 'Satuan (Per Unit)' }, { id: 'kiloan', name: 'Kiloan (Per KG)' }]} name="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required />
          <Input label="Price" type="number" placeholder="Enter price" name="price" value={formData.price} onChange={handleInputChange} required />
          <Input label="Description" placeholder="Describe this service" name="description" value={formData.description} onChange={handleInputChange} />
        </div>
      </Modal>

      {/* Edit Service Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); resetForm(); }} title="Edit Service" size="md" footer={(
        <>
          <Button variant="secondary" onClick={() => { setIsEditModalOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdateItem}>Update Service</Button>
        </>
      )}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input label="Service Name" placeholder="e.g., Regular Wash" name="name" value={formData.name} onChange={handleInputChange} required />
          <Select label="Type" options={[{ id: 'satuan', name: 'Satuan (Per Unit)' }, { id: 'kiloan', name: 'Kiloan (Per KG)' }]} name="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required />
          <Input label="Price" type="number" placeholder="Enter price" name="price" value={formData.price} onChange={handleInputChange} required />
          <Input label="Description" placeholder="Describe this service" name="description" value={formData.description} onChange={handleInputChange} />
        </div>
      </Modal>
    </div>
  );
};

export default Services;
