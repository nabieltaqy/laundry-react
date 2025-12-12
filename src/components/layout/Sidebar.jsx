import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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
        {user && (
          <button
            className="mobile-logout-btn"
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
            title="Sign Out"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        )}
      </nav>

      <div className="footer">
        {user && (
          <div className="user-info">
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>Logged in as</p>
            <p style={{ fontSize: '13px', color: 'white', marginBottom: '12px', wordBreak: 'break-all' }}>{user.email}</p>
            <button
              className="signout-btn"
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
        © 2025 LaundryPro
      </div>
    </aside>
  );
};

export default Sidebar;
