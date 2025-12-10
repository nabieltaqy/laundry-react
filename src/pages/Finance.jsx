import React, { useState, useMemo } from 'react';
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import StatCard from '../components/common/StatCard';
import { useFinanceStore } from '../stores/financeStore';
import { useOrderStore } from '../stores/orderStore';
import { useItemStore } from '../stores/itemStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const Finance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
  });
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [isNewItemMode, setIsNewItemMode] = useState(false);
  const [newItemData, setNewItemData] = useState({ name: '', type: 'satuan', price: '', priceEditable: false });

  const financeStore = useFinanceStore();
  const orderStore = useOrderStore();
  const itemStore = useItemStore();

  const transactions = financeStore.getTransactions();
  const totalIncome = financeStore.getTotalIncome();
  const totalExpense = financeStore.getTotalExpense();
  const balance = financeStore.getBalance();

  // Get orders to calculate income from orders
  const orders = orderStore.getOrders();
  const ordersRevenue = orders.reduce((total, order) => {
    const orderTotal = order.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    return total + orderTotal;
  }, 0);

  // Use only expense items (products) for expenses — exclude services (satuan/kiloan)
  const expenseItems = itemStore.getItems().filter(i => i.type === 'product' || i.priceEditable === true);
  const filteredItems = itemSearchQuery
    ? expenseItems.filter(item =>
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        (item.type || '').toLowerCase().includes(itemSearchQuery.toLowerCase())
      )
    : [];
  const suggestedItems = !itemSearchQuery ? expenseItems.slice(0, 8) : [];
  const displayItemDropdown = showItemDropdown && (itemSearchQuery || suggestedItems.length > 0);
  const itemsToDisplay = itemSearchQuery ? filteredItems : suggestedItems;
  const selectedItem = selectedItemId ? expenseItems.find(item => item.id === Number(selectedItemId)) : null;

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || '' : value,
    });
  };

  // Add transaction
  const handleAddTransaction = () => {
    // For expense, validate depending on item type
    if (formData.type === 'expense') {
      if (!selectedItemId) {
        alert('Please select an item for expense');
        return;
      }
      const selItem = expenseItems.find(i => i.id === Number(selectedItemId));
      if (!selItem) {
        alert('Selected item not found');
        return;
      }
      if (selItem.priceEditable) {
        if (!formData.amount) {
          alert('Please enter amount for this item');
          return;
        }
      } else {
        if (!itemQuantity) {
          alert('Please enter quantity for this item');
          return;
        }
      }
    } else {
      // For income, validate amount and description
      if (!formData.amount || !formData.description.trim()) {
        alert('Please fill in all required fields');
        return;
      }
    }

    let description = formData.description;
    let amount = formData.amount;

    // For expenses with items, calculate amount based on item settings
    if (formData.type === 'expense' && selectedItemId) {
      const item = expenseItems.find(i => i.id === Number(selectedItemId));
      if (item) {
        if (item.priceEditable) {
          amount = parseFloat(formData.amount) || 0;
          description = `${item.name} (custom amount)`;
        } else {
          amount = item.price * Number(itemQuantity);
          description = `${item.name} (${itemQuantity}x @ ${formatCurrency(item.price)})`;
        }
      }
    }

    financeStore.addTransaction({
      type: formData.type,
      amount: amount,
      description: description,
    });

    setFormData({
      type: 'income',
      amount: '',
      description: '',
    });
    setItemSearchQuery('');
    setSelectedItemId('');
    setItemQuantity('');
    setIsNewItemMode(false);
    setNewItemData({ name: '', type: 'satuan', price: '', priceEditable: false });
    setIsModalOpen(false);
    alert('Transaction added successfully!');
  };

  // Handle add new item for expense
  const handleAddNewItem = () => {
    if (!newItemData.name.trim() || (!newItemData.price && !newItemData.priceEditable)) {
      alert('Please fill in item name and price (or mark price editable)');
      return;
    }

    itemStore.addItem({
      name: newItemData.name,
      type: newItemData.type,
      price: newItemData.priceEditable ? 0 : parseFloat(newItemData.price),
      priceEditable: !!newItemData.priceEditable,
      description: `Expense item - ${newItemData.name}`,
    });

    // Reset and select the new item
    const updatedItems = itemStore.getItems();
    const newItem = updatedItems[updatedItems.length - 1];
    setSelectedItemId(String(newItem.id));
    setItemSearchQuery('');
    setShowItemDropdown(false);
    setIsNewItemMode(false);
    setNewItemData({ name: '', type: 'satuan', price: '', priceEditable: false });
  };

  // Delete transaction
  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      // Since Zustand doesn't have a delete method in financeStore,
      // we'll add it. For now, just show a message
      alert('Delete functionality needs to be added to financeStore');
    }
  };

  const transactionColumns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => formatDate(row.createdAt),
    },
    { key: 'description', label: 'Description' },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className={row.type === 'income' ? 'badge badge--green' : 'badge badge--red'}>{row.type}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span style={{fontWeight:700,color: row.type === 'income' ? 'var(--success)' : 'var(--danger)'}}>
          {row.type === 'income' ? '+' : '-'} {formatCurrency(row.amount)}
        </span>
      ),
    },
  ];

  // Get data for last 7 days
  const chartData = useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Create last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: dayNames[date.getDay()],
        income: 0,
        expense: 0,
      });
    }

    // Add transaction data
    transactions.forEach((transaction) => {
      const txDate = new Date(transaction.createdAt).toISOString().split('T')[0];
      const dayData = days.find((d) => d.date === txDate);
      if (dayData) {
        if (transaction.type === 'income') {
          dayData.income += transaction.amount;
        } else {
          dayData.expense += transaction.amount;
        }
      }
    });

    // Add orders revenue to today
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      const todayDate = new Date().toISOString().split('T')[0];
      if (orderDate === todayDate) {
        const orderTotal = order.items.reduce((sum, item) => {
          return sum + item.price * item.quantity;
        }, 0);
        const dayData = days.find((d) => d.date === todayDate);
        if (dayData) {
          dayData.income += orderTotal;
        }
      }
    });

    return days;
  }, [transactions, orders]);

  // Get max value for scaling
  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.income, d.expense)),
    1
  );

  return (
    <div>
      <div className="mb-8" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 className="page-title">Finance</h1>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus size={20} />
          Add Transaction
        </Button>
      </div>

      {/* Financial Stats */}
      <div className="stats-grid mb-8">
        <StatCard
          icon={TrendingUp}
          label="Total Income"
          value={formatCurrency(totalIncome + ordersRevenue)}
          color="green"
        />
        <StatCard
          icon={TrendingDown}
          label="Total Expense"
          value={formatCurrency(totalExpense)}
          color="red"
        />
        <StatCard
          icon={DollarSign}
          label="Balance"
          value={formatCurrency(balance + ordersRevenue)}
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          label="Orders Revenue"
          value={formatCurrency(ordersRevenue)}
          color="yellow"
        />
      </div>

      {/* Summary Cards */}
      <div className="stats-grid mb-8">
        <Card>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <p className="text-muted">This Month Income</p>
              <p style={{fontSize:26,fontWeight:700,marginTop:8}}>{formatCurrency(totalIncome + ordersRevenue)}</p>
            </div>
            <TrendingUp size={44} style={{opacity:0.12,color:'var(--success)'}} />
          </div>
        </Card>

        <Card>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <p className="text-muted">This Month Expense</p>
              <p style={{fontSize:26,fontWeight:700,marginTop:8}}>{formatCurrency(totalExpense)}</p>
            </div>
            <TrendingDown size={44} style={{opacity:0.12,color:'var(--danger)'}} />
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card title="Last 7 Days Revenue" subtitle="Income vs Expenses">
        <div style={{padding:'20px 0'}}>
          <div style={{display:'flex',gap:24,alignItems:'flex-end',justifyContent:'space-around',minHeight:280}}>
            {chartData.map((day) => (
              <div key={day.date} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flex:1}}>
                {/* Bars Container */}
                <div style={{display:'flex',gap:6,alignItems:'flex-end',height:220,width:'100%',justifyContent:'center',position:'relative'}}>
                  {/* Income Bar */}
                  <div
                    style={{
                      width:'35%',
                      height:`${(day.income / maxValue) * 180}px`,
                      background:'linear-gradient(180deg, var(--success), rgba(16,185,129,0.6))',
                      borderRadius:'6px 6px 0 0',
                      transition:'all 0.3s ease',
                      minHeight:2,
                      cursor:'pointer',
                      opacity:day.income > 0 ? 1 : 0.3,
                      position:'relative',
                    }}
                    onMouseEnter={() => setHoveredBar(`${day.date}-income`)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Amount on hover */}
                    {hoveredBar === `${day.date}-income` && day.income > 0 && (
                      <div style={{
                        position:'absolute',
                        bottom:'100%',
                        left:'50%',
                        transform:'translateX(-50%)',
                        background:'rgba(0,0,0,0.8)',
                        color:'white',
                        padding:'6px 10px',
                        borderRadius:'4px',
                        fontSize:'12px',
                        fontWeight:'600',
                        whiteSpace:'nowrap',
                        marginBottom:'8px',
                        zIndex:10,
                      }}>
                        {formatCurrency(day.income)}
                      </div>
                    )}
                    {/* Amount on bar */}
                    {day.income > 0 && (day.income / maxValue) * 180 > 40 && (
                      <div style={{
                        position:'absolute',
                        top:'50%',
                        left:'50%',
                        transform:'translate(-50%, -50%)',
                        color:'white',
                        fontSize:'11px',
                        fontWeight:'700',
                        textAlign:'center',
                        textShadow:'0 1px 2px rgba(0,0,0,0.3)',
                        pointerEvents:'none',
                      }}>
                        {formatCurrency(day.income)}
                      </div>
                    )}
                  </div>
                  {/* Expense Bar */}
                  <div
                    style={{
                      width:'35%',
                      height:`${(day.expense / maxValue) * 180}px`,
                      background:'linear-gradient(180deg, var(--danger), rgba(239,68,68,0.6))',
                      borderRadius:'6px 6px 0 0',
                      transition:'all 0.3s ease',
                      minHeight:2,
                      cursor:'pointer',
                      opacity:day.expense > 0 ? 1 : 0.3,
                      position:'relative',
                    }}
                    onMouseEnter={() => setHoveredBar(`${day.date}-expense`)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Amount on hover */}
                    {hoveredBar === `${day.date}-expense` && day.expense > 0 && (
                      <div style={{
                        position:'absolute',
                        bottom:'100%',
                        left:'50%',
                        transform:'translateX(-50%)',
                        background:'rgba(0,0,0,0.8)',
                        color:'white',
                        padding:'6px 10px',
                        borderRadius:'4px',
                        fontSize:'12px',
                        fontWeight:'600',
                        whiteSpace:'nowrap',
                        marginBottom:'8px',
                        zIndex:10,
                      }}>
                        {formatCurrency(day.expense)}
                      </div>
                    )}
                    {/* Amount on bar */}
                    {day.expense > 0 && (day.expense / maxValue) * 180 > 40 && (
                      <div style={{
                        position:'absolute',
                        top:'50%',
                        left:'50%',
                        transform:'translate(-50%, -50%)',
                        color:'white',
                        fontSize:'11px',
                        fontWeight:'700',
                        textAlign:'center',
                        textShadow:'0 1px 2px rgba(0,0,0,0.3)',
                        pointerEvents:'none',
                      }}>
                        {formatCurrency(day.expense)}
                      </div>
                    )}
                  </div>
                </div>
                {/* Label */}
                <p style={{fontSize:12,fontWeight:600,color:'var(--muted)',marginTop:8}}>{day.dayName}</p>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div style={{display:'flex',gap:24,justifyContent:'center',marginTop:20,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:16,height:16,background:'var(--success)',borderRadius:4}}></div>
              <span style={{fontSize:13}}>Income</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:16,height:16,background:'var(--danger)',borderRadius:4}}></div>
              <span style={{fontSize:13}}>Expense</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card title="Transaction History" subtitle={`Total: ${transactions.length} transactions`}>
        <Table
          columns={transactionColumns}
          data={transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
          actions={(row) => [
            <Button
              key="delete"
              variant="danger"
              size="sm"
              onClick={() => handleDeleteTransaction(row.id)}
            >
              <Trash2 size={16} />
            </Button>,
          ]}
        />
        {transactions.length === 0 && (
          <p className="empty-msg">No transactions recorded yet</p>
        )}
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            type: 'income',
            amount: '',
            description: '',
          });
          setItemSearchQuery('');
          setSelectedItemId('');
          setItemQuantity('');
          setIsNewItemMode(false);
          setNewItemData({ name: '', type: 'satuan', price: '', priceEditable: false });
        }}
        title="Add Transaction"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({
                  type: 'income',
                  amount: '',
                  description: '',
                });
                setItemSearchQuery('');
                setSelectedItemId('');
                setItemQuantity('');
                setIsNewItemMode(false);
                setNewItemData({ name: '', type: 'satuan', price: '', priceEditable: false });
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddTransaction}>
              Add Transaction
            </Button>
          </>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Select
            label="Type"
            options={[
              { id: 'income', name: 'Income' },
              { id: 'expense', name: 'Expense' },
            ]}
            name="type"
            value={formData.type}
            onChange={(e) => {
              setFormData({ ...formData, type: e.target.value });
              if (e.target.value === 'income') {
                setSelectedItemId('');
                setItemQuantity('');
              }
            }}
            required
          />

          {formData.type === 'income' ? (
            <>
              <Input
                label="Amount"
                type="number"
                placeholder="Enter amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Description"
                placeholder="e.g., Sales, Bonus"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </>
          ) : (
            <>
              {!isNewItemMode ? (
                <>
                  <div style={{position:'relative'}}>
                    <Input
                      label="Search Item/Service"
                      placeholder="Type item name..."
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
                                  setSelectedItemId(String(item.id));
                                  setItemSearchQuery(`${item.name} (${item.type})`);
                                  setShowItemDropdown(false);
                                  // clear amount/quantity depending on item
                                  setFormData({ ...formData, amount: '' });
                                  setItemQuantity('');
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
                      background:'rgba(239,68,68,0.08)',
                      borderRadius:8,
                      fontSize:13
                    }}>
                      <strong>Selected:</strong> {selectedItem?.name} {selectedItem?.priceEditable ? '(custom price)' : `- ${formatCurrency(selectedItem?.price)}`}
                    </div>
                  )}

                  {/* If item requires custom price, show amount input; otherwise show quantity */}
                  {selectedItem && selectedItem.priceEditable ? (
                    <Input
                      label="Amount"
                      type="number"
                      placeholder="Enter amount for this item"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <Input
                      label="Quantity"
                      type="number"
                      placeholder="Enter quantity"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      required={!!selectedItemId}
                    />
                  )}

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsNewItemMode(true);
                      setItemSearchQuery('');
                      setShowItemDropdown(false);
                    }}
                  >
                    <Plus size={16} />
                    Create New Item
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    label="Item Name"
                    placeholder="e.g., Utilities, Supplies"
                    value={newItemData.name}
                    onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                    required
                  />
                  <Select
                    label="Type"
                    options={[
                      { id: 'satuan', name: 'Satuan (Per Unit)' },
                      { id: 'kiloan', name: 'Kiloan (Per Kg)' },
                      { id: 'product', name: 'Product / Other' },
                    ]}
                    value={newItemData.type}
                    onChange={(e) => setNewItemData({ ...newItemData, type: e.target.value })}
                    required
                  />
                  <Input
                    label="Price"
                    type="number"
                    placeholder="Enter price"
                    value={newItemData.price}
                    onChange={(e) => setNewItemData({ ...newItemData, price: e.target.value })}
                    required={!newItemData.priceEditable}
                  />
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <input
                      id="priceEditable"
                      type="checkbox"
                      checked={!!newItemData.priceEditable}
                      onChange={(e) => setNewItemData({ ...newItemData, priceEditable: e.target.checked })}
                    />
                    <label htmlFor="priceEditable" style={{fontSize:13,color:'var(--muted)'}}>Price Editable (enter amount when recording expense)</label>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsNewItemMode(false);
                        setNewItemData({ name: '', type: 'satuan', price: '', priceEditable: false });
                      }}
                      style={{flex:1}}
                    >
                       Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleAddNewItem}
                      style={{flex:1}}
                    >
                      Create Item
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Finance;
