import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReceivingForm from './components/ReceivingForm';
import MaintenanceForm from './components/MaintenanceForm';
import MaintenanceReport from './components/MaintenanceReport';
import AssetReport from './components/AssetReport';
import AssetExport from './components/AssetExport';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    // Check local storage or preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [computers, setComputers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Fetch initial data
  useEffect(() => {
    setLoading(true);
    setError(null);

    const apiBase = ''; // uses vite server proxy to express port 5000 in dev, or local routes in prod

    Promise.all([
      fetch(`${apiBase}/api/status`).then(res => {
        if (!res.ok) throw new Error('API Status failed');
        return res.json();
      }),
      fetch(`${apiBase}/api/computers`).then(res => {
        if (!res.ok) throw new Error('API Computers failed');
        return res.json();
      }),
      fetch(`${apiBase}/api/tickets`).then(res => {
        if (!res.ok) throw new Error('API Tickets failed');
        return res.json();
      }),
      fetch(`${apiBase}/api/users`).then(res => {
        if (!res.ok) throw new Error('API Users failed');
        return res.json();
      })
    ])
      .then(([statusData, computersData, ticketsData, usersData]) => {
        setDbStatus(statusData);
        setComputers(computersData);
        setTickets(ticketsData);
        setUsers(usersData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์รายงานได้ โปรดตรวจสอบว่า Express backend ทำงานอยู่');
        setLoading(false);
      });
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Render Loader
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme === 'dark' ? '#080c14' : '#f8fafc',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        fontFamily: "'Sarabun', sans-serif"
      }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', marginBottom: '1rem' }} />
        <h3 style={{ fontWeight: 600 }}>กำลังดึงข้อมูลจากระบบ GLPI 11...</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>กรุณารอสักครู่</p>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  // Render Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme === 'dark' ? '#080c14' : '#f8fafc',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: "'Sarabun', sans-serif"
      }}>
        <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {error}
        </p>
        <button onClick={handleRetry} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <RefreshCw size={16} /> โหลดใหม่อีกครั้ง (Retry)
        </button>
      </div>
    );
  }

  // Render main app
  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      theme={theme}
      toggleTheme={toggleTheme}
      dbStatus={dbStatus}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          computers={computers}
          tickets={tickets}
          setActiveTab={setActiveTab}
        />
      )}
      
      {activeTab === 'receiving' && (
        <ReceivingForm
          computers={computers}
          users={users}
        />
      )}
      
      {activeTab === 'maintenance-form' && (
        <MaintenanceForm
          computers={computers}
          users={users}
        />
      )}

      {activeTab === 'maintenance' && (
        <MaintenanceReport
          tickets={tickets}
        />
      )}

      {activeTab === 'assets' && (
        <AssetReport
          computers={computers}
        />
      )}

      {activeTab === 'export' && (
        <AssetExport />
      )}
    </Layout>
  );
}
