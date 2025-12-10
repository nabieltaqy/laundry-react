import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: Package, label: 'Services', path: '/services' },
    { icon: Package, label: 'Items', path: '/items' },
    { icon: Wallet, label: 'Finance', path: '/finance' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>LaundryPro</h1>
        <p style={{color:'rgba(255,255,255,0.65)',marginTop:6,fontSize:13}}>Management System</p>
      </div>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className={isActive(item.path) ? 'active' : ''}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="footer">© 2025 LaundryPro</div>
    </aside>
  );
};

export default Sidebar;
