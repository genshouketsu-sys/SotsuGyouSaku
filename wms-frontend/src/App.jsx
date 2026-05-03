import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import PcDashboard from './components/PcDashboard';
import MobileScanner from './components/MobileScanner';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Configure Axios Interceptors
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('wms_token');
      localStorage.removeItem('wms_username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [scans, setScans] = useState([
    { id: 'PRD-X92-BLA', name: 'Black T-Shirt', time: '14:02:11', status: 'Verified' },
    { id: 'SKU-441-MET', name: 'Metal Water Bottle', time: '14:01:58', status: 'Verified' },
    { id: 'LOG-772-GRN', name: 'Green Notebook', time: '14:01:45', status: 'Secondary' },
  ]);

  const [connectionStatus, setConnectionStatus] = useState('OFFLINE');
  const wsRef = useRef(null);
  const productsCache = useRef([]);

  // Fetch products for name lookup
  useEffect(() => {
    const token = localStorage.getItem('wms_token');
    if (token) {
      axios.get('/api/products')
        .then(res => { productsCache.current = res.data; })
        .catch(() => {});
    }
  }, []);

  // WebSocket for receiving scans (Dashboard logic)
  useEffect(() => {
    const token = localStorage.getItem('wms_token');
    if (!token) return;

    const username = localStorage.getItem('wms_username') || '1';
    const clientId = `pc_${username}`;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/scan?clientId=${clientId}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket server');
      setConnectionStatus('ACTIVE');
    };

    wsRef.current.onmessage = (event) => {
      const barcode = event.data;
      console.log(`[Global WS] Received barcode: ${barcode}`);
      
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const product = productsCache.current.find(p => p.barcode === barcode || p.skuCode === barcode);
      const productName = product ? product.name : 'Unknown Product';

      setScans(prev => [
        { id: barcode, name: productName, time: timeString, status: 'Verified' },
        ...prev.slice(0, 9)
      ]);

      // Dispatch global event for other components to refresh
      window.dispatchEvent(new CustomEvent('wms-new-scan', { detail: { barcode } }));
    };

    wsRef.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setConnectionStatus('OFFLINE');
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Route */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <PcDashboard 
                currentView={currentView}
                setCurrentView={setCurrentView}
                scans={scans}
                setScans={setScans}
                connectionStatus={connectionStatus}
                setIsMobileMode={() => {}} // Not used in router mode
              />
            </ProtectedRoute>
          } 
        />

        {/* Mobile Scanner Route (Can be accessed directly or protected) */}
        <Route 
          path="/scanner" 
          element={<MobileScanner onClose={() => window.location.href = '/'} />} 
        />

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;