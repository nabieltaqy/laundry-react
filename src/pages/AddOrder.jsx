import React, { useState } from 'react';
import { Plus, Trash2, Check, User, Search } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import { useOrderStore } from '../stores/orderStore';
import { useItemStore } from '../stores/itemStore';
import { useFinanceStore } from '../stores/financeStore';
import { useCustomerStore } from '../stores/customerStore';
import { formatCurrency } from '../utils/formatters';

const AddOrder = () => {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderSuggestions, setShowOrderSuggestions] = useState(false);

  const orderStore = useOrderStore();
  const itemStore = useItemStore();
  const financeStore = useFinanceStore();
  const customerStore = useCustomerStore();

  // Get all orders for listing
  const allOrders = orderStore.getOrders();
  
  // Filter orders by search
  const filteredOrders = searchQuery
    ? allOrders.filter(o => {
        const q = searchQuery.toLowerCase();
        return (
          (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
          (String(o.id).includes(q)) ||
          (o.customerName && o.customerName.toLowerCase().includes(q))
        );
      })
    : allOrders;

  // Get services only (exclude expense items)
  const allItems = itemStore.getItems().filter(item => item.type !== 'product');
  const filteredItems = itemSearchQuery
    ? allItems.filter(item => 
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(itemSearchQuery.toLowerCase())
      )
    : allItems;
  const allCustomers = customerStore.getCustomers();
  const filteredCustomers = customerSearchQuery
    ? customerStore.searchCustomers(customerSearchQuery)
    : allCustomers;
  const selectedCustomer = selectedCustomerId ? customerStore.getCustomerById(Number(selectedCustomerId)) : null;
  const selectedItem = selectedItemId ? itemStore.getItemById(Number(selectedItemId)) : null;

  // Get suggestions when search field is empty or focused
  const suggestedItems = !itemSearchQuery ? allItems.slice(0, 5) : [];
  const suggestedCustomers = !customerSearchQuery ? allCustomers.slice(0, 5) : [];
  const displayItemDropdown = showItemDropdown && (itemSearchQuery || suggestedItems.length > 0);
  const displayCustomerDropdown = showCustomerDropdown && (customerSearchQuery || suggestedCustomers.length > 0);
  const itemsToDisplay = itemSearchQuery ? filteredItems : suggestedItems;
  const customersToDisplay = customerSearchQuery ? filteredCustomers : suggestedCustomers;

  // Add item to order
  const handleAddItem = () => {
    if (!selectedItemId || !quantity) {
      alert('Please select item and quantity');
      return;
    }

    const item = itemStore.getItemById(Number(selectedItemId));
    if (!item) return;

    const newItem = {
      id: Date.now(),
      itemId: item.id,
      name: item.name,
      type: item.type,
      price: item.price,
      quantity: Number(quantity),
    };

    setItems([...items, newItem]);
    setSelectedItemId('');
    setItemSearchQuery('');
    setQuantity('');
  };

  // Remove item from order
  const handleRemoveItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Calculate total
  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit order
  const handleSubmitOrder = async () => {
    // Validate customer
    let customerId;
    let customerName;

    if (isNewCustomerMode) {
      if (!newCustomerData.name.trim() || !newCustomerData.phone.trim()) {
        alert('Please fill in customer name and phone');
        return;
      }
      // Create new customer
      try {
        setIsSubmitting(true);
        const created = await customerStore.addCustomer({
          name: newCustomerData.name,
          phone: newCustomerData.phone,
          email: newCustomerData.email,
          address: newCustomerData.address,
        });
        customerId = created?.id;
        customerName = created?.name || newCustomerData.name;
      } catch (err) {
        console.error('Error creating customer for order:', err);
        alert('Failed to create customer: ' + (err?.message || err));
        setIsSubmitting(false);
        return;
      }
    } else {
      if (!selectedCustomerId) {
        alert('Please select a customer');
        return;
      }
      customerId = Number(selectedCustomerId);
      customerName = selectedCustomer.name;
    }

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const total = calculateTotal();

    // Add order and transaction
    try {
      const createdOrder = await orderStore.addOrder({
        customerId,
        status: 'pending',
        totalPrice: total,
        notes,
      });

      // Create finance transaction (income) and link to created order
      try {
        await financeStore.addTransaction({
          type: 'income',
          amount: total,
          description: `Order from ${customerName}`,
          orderId: createdOrder?.id,
        });
      } catch (txErr) {
        console.error('Failed to create finance transaction:', txErr);
      }

      // Reset form
      setSelectedCustomerId('');
      setCustomerSearchQuery('');
      setShowCustomerDropdown(false);
      setSelectedItemId('');
      setItemSearchQuery('');
      setShowItemDropdown(false);
      setQuantity('');
      setNotes('');
      setItems([]);
      setIsNewCustomerMode(false);
      setNewCustomerData({ name: '', phone: '', email: '', address: '' });
      setIsModalOpen(false);

      alert('Order added successfully!');
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order: ' + (err?.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemColumns = [
    { key: 'name', label: 'Item' },
    { key: 'type', label: 'Type' },
    {
      key: 'price',
      label: 'Price',
      render: (row) => formatCurrency(row.price),
    },
    { key: 'quantity', label: 'Quantity' },
    {
      key: 'subtotal',
      label: 'Subtotal',
      render: (row) => formatCurrency(row.price * row.quantity),
    },
  ];

  return (
    <div>
      <div className="mb-8" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 className="page-title">Orders</h1>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus size={20} />
          New Order
        </Button>
      </div>

      {/* Search Orders */}
      <div className="mb-8" style={{ position: 'relative', maxWidth: 680 }}>
        <Input
          placeholder="Search by order #, customer or id"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowOrderSuggestions(true)}
          onBlur={() => setTimeout(() => setShowOrderSuggestions(false), 120)}
          aria-label="Search orders"
        />

        {showOrderSuggestions && (
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
            {(searchQuery ? filteredOrders : allOrders)
              .slice(0, 8)
              .map((order) => (
                <div
                  key={order.id}
                  role="option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery(order.orderNumber || String(order.id));
                    setShowOrderSuggestions(false);
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
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,#f3f4f6,#e9eef8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight:700, color:'#111', fontSize: 11 }}>
                    {order.orderNumber?.slice(-6) || String(order.id).slice(-6)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{order.orderNumber}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{order.customerName}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Orders List */}
      <Card title="All Orders" subtitle={`Total: ${allOrders.length} orders`}>
        {filteredOrders.length === 0 ? (
          <p className="empty-msg">{searchQuery ? 'No orders found' : 'No orders yet. Create your first order!'}</p>
        ) : (
          <Table
            columns={[
              { key: 'orderNumber', label: 'Order #' },
              { key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleString() },
              { key: 'customerName', label: 'Customer' },
              { key: 'items', label: 'Items', render: (row) => row.items.length },
              { key: 'totalAmount', label: 'Total', render: (row) => formatCurrency(row.totalAmount) },
              { key: 'status', label: 'Status', render: (row) => (
                <span className={row.status === 'active' ? 'badge badge--green' : 'badge badge--gray'}>
                  {row.status}
                </span>
              )},
            ]}
            data={filteredOrders}
            actions={(row) => [
              <Button
                key="complete"
                variant="success"
                size="sm"
                onClick={() => orderStore.updateOrderStatus(row.id, 'completed')}
              >
                <Check size={16} />
              </Button>,
              <Button
                key="delete"
                variant="danger"
                size="sm"
                onClick={() => orderStore.deleteOrder(row.id)}
              >
                <Trash2 size={16} />
              </Button>,
            ]}
          />
        )}
      </Card>

      {/* Modal for Adding Order */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCustomerSearchQuery('');
          setShowCustomerDropdown(false);
          setItemSearchQuery('');
          setShowItemDropdown(false);
        }}
        title="Create New Order"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setCustomerSearchQuery('');
              setShowCustomerDropdown(false);
              setItemSearchQuery('');
              setShowItemDropdown(false);
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitOrder} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Order'}
            </Button>
          </>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {/* Customer Selection */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <h3 style={{fontWeight:700,marginBottom:0}}>
              <User size={18} style={{marginRight:8,display:'inline'}} />
              Customer
            </h3>
            
            {!isNewCustomerMode ? (
              <>
                <div style={{position:'relative'}}>
                  <Input
                    label="Search or Select Customer"
                    placeholder="Type name or phone..."
                    value={customerSearchQuery}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                  
                  {displayCustomerDropdown && (
                    <div style={{
                      position:'absolute',
                      top:'100%',
                      left:0,
                      right:0,
                      background:'var(--panel)',
                      border:'1px solid rgba(15,23,42,0.06)',
                      borderTop:'none',
                      borderRadius:'0 0 8px 8px',
                      maxHeight:200,
                      overflowY:'auto',
                      zIndex:10,
                      marginTop:-8
                    }}>
                      {customersToDisplay.length > 0 ? (
                        <>
                          {!customerSearchQuery && (
                            <div style={{
                              padding:'8px 12px',
                              fontSize:12,
                              fontWeight:600,
                              color:'var(--muted)',
                              borderBottom:'1px solid rgba(15,23,42,0.05)',
                              background:'rgba(15,23,42,0.02)'
                            }}>
                              Suggested Customers
                            </div>
                          )}
                          {customersToDisplay.map((customer) => (
                            <div
                              key={customer.id}
                              onClick={() => {
                                setSelectedCustomerId(customer.id.toString());
                                setCustomerSearchQuery(`${customer.name} - ${customer.phone}`);
                                setShowCustomerDropdown(false);
                              }}
                              style={{
                                padding:'10px 12px',
                                cursor:'pointer',
                                borderBottom:'1px solid rgba(15,23,42,0.02)',
                                transition:'background 0.2s',
                              }}
                              onMouseEnter={(e) => e.target.style.background = 'rgba(15,23,42,0.02)'}
                              onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                              <div style={{fontWeight:600,fontSize:14}}>{customer.name}</div>
                              <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>{customer.phone}</div>
                            </div>
                          ))}
                        </>
                      ) : customerSearchQuery ? (
                        <div style={{
                          padding:'12px',
                          color:'var(--muted)',
                          textAlign:'center',
                          fontSize:13
                        }}>
                          No customers found. Create a new one?
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {selectedCustomerId && (
                  <div style={{
                    padding:12,
                    background:'rgba(37,99,235,0.08)',
                    borderRadius:8,
                    fontSize:13
                  }}>
                    <strong>Selected:</strong> {selectedCustomer?.name} - {selectedCustomer?.phone}
                  </div>
                )}

                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsNewCustomerMode(true);
                    setCustomerSearchQuery('');
                    setShowCustomerDropdown(false);
                  }}
                  style={{textAlign:'center'}}
                >
                  <Plus size={16} />
                  Create New Customer
                </Button>
              </>
            ) : (
              <>
                <Input
                  label="Customer Name"
                  placeholder="Enter customer name"
                  name="name"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  required
                />
                <Input
                  label="Phone"
                  placeholder="e.g., 08123456789"
                  name="phone"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="customer@example.com"
                  name="email"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                />
                <Input
                  label="Address"
                  placeholder="Enter address"
                  name="address"
                  value={newCustomerData.address}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewCustomerMode(false);
                    setNewCustomerData({ name: '', phone: '', email: '', address: '' });
                  }}
                >
                  Back to Select Customer
                </Button>
              </>
            )}

            <Input
              label="Notes"
              placeholder="Special instructions or notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Add Items */}
          <div style={{borderTop:'1px solid rgba(15,23,42,0.04)',paddingTop:16}}>
            <h3 style={{fontWeight:700,marginBottom:12}}>Add Items</h3>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div style={{position:'relative'}}>
                <Input
                  label="Search Item/Service"
                  placeholder="Type item name or type..."
                  value={itemSearchQuery}
                  onChange={(e) => {
                    setItemSearchQuery(e.target.value);
                    setShowItemDropdown(true);
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                />
                
                {displayItemDropdown && (
                  <div style={{
                    position:'absolute',
                    top:'100%',
                    left:0,
                    right:0,
                    background:'var(--panel)',
                    border:'1px solid rgba(15,23,42,0.06)',
                    borderTop:'none',
                    borderRadius:'0 0 8px 8px',
                    maxHeight:200,
                    overflowY:'auto',
                    zIndex:10,
                    marginTop:-8
                  }}>
                    {itemsToDisplay.length > 0 ? (
                      <>
                        {!itemSearchQuery && (
                          <div style={{
                            padding:'8px 12px',
                            fontSize:12,
                            fontWeight:600,
                            color:'var(--muted)',
                            borderBottom:'1px solid rgba(15,23,42,0.05)',
                            background:'rgba(15,23,42,0.02)'
                          }}>
                            Popular Items
                          </div>
                        )}
                        {itemsToDisplay.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedItemId(item.id.toString());
                              setItemSearchQuery(`${item.name} (${item.type})`);
                              setShowItemDropdown(false);
                            }}
                            style={{
                              padding:'10px 12px',
                              cursor:'pointer',
                              borderBottom:'1px solid rgba(15,23,42,0.02)',
                              transition:'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(15,23,42,0.02)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <div style={{fontWeight:600,fontSize:14}}>{item.name}</div>
                            <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>
                              {item.type} • {formatCurrency(item.price)}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : itemSearchQuery ? (
                      <div style={{
                        padding:'12px',
                        color:'var(--muted)',
                        textAlign:'center',
                        fontSize:13
                      }}>
                        No items found
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {selectedItemId && (
                <div style={{
                  padding:12,
                  background:'rgba(16,185,129,0.08)',
                  borderRadius:8,
                  fontSize:13
                }}>
                  <strong>Selected:</strong> {selectedItem?.name} ({selectedItem?.type}) - {formatCurrency(selectedItem?.price)}
                </div>
              )}

              <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                <Input
                  label="Quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                <div>
                  <Button variant="secondary" onClick={handleAddItem}>
                    <Plus size={16} />
                    Add Item
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 && (
              <div style={{borderTop:'1px solid rgba(15,23,42,0.04)',paddingTop:16,marginTop:16}}>
                <h3 style={{fontWeight:700,marginBottom:12}}>Order Items</h3>
                <Table
                columns={itemColumns}
                data={items}
                actions={(row) => [
                  <Button
                    key="delete"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveItem(row.id)}
                  >
                    <Trash2 size={16} />
                  </Button>,
                ]}
              />
              <div style={{marginTop:16,padding:14,background:'rgba(15,23,42,0.02)',borderRadius:8}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontWeight:700}}>Total:</span>
                  <span style={{fontSize:20,fontWeight:700,color:'var(--primary)'}}>
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AddOrder;
