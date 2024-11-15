import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './New folder/Login';
import Dashboard from './New folder/Dashboard';
import EmployeeManagement from './New folder/EmployeeManagement';
import ProductManagement from './New folder/ProductManagement';
import './New folder/App.css'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div>
      {isAuthenticated && (
        <nav style={{ backgroundColor: '#333', padding: '10px' }}>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex' }}>
            <li style={{ marginRight: '20px' }}>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            </li>
            <li style={{ marginRight: '20px' }}>
              <Link to="/employee-management" style={{ color: 'white', textDecoration: 'none' }}>Employee Management</Link>
            </li>
            <li style={{ marginRight: '20px' }}>
              <Link to="/product-management" style={{ color: 'white', textDecoration: 'none' }}>Product Management</Link>
            </li>
            <li>
              <button 
                onClick={handleLogout} 
                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      )}

      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/employee-management" element={isAuthenticated ? <EmployeeManagement /> : <Navigate to="/login" />} />
        <Route path="/product-management" element={isAuthenticated ? <ProductManagement /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;