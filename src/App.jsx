import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddOrder from './pages/AddOrder';
import Items from './pages/Items';
import Services from './pages/Services';
import Finance from './pages/Finance';
import Customers from './pages/Customers';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="app-root">
                  <Sidebar />
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/orders" element={<AddOrder />} />
                      <Route path="/items" element={<Items />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/finance" element={<Finance />} />
                    </Routes>
                  </MainLayout>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
