import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReceivingForm from './components/ReceivingForm';
import MaintenanceForm from './components/MaintenanceForm';
import MaintenanceReport from './components/MaintenanceReport';
import AssetReport from './components/AssetReport';
import AssetExport from './components/AssetExport';
import { Loader2, AlertCircle, RefreshCw, User, KeyRound, ShieldAlert } from 'lucide-react';

function LoginScreen({ onLoginSuccess, theme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError('');

    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'การเข้าสู่ระบบล้มเหลว'); });
        }
        return res.json();
      })
      .then(data => {
        setLoading(false);
        onLoginSuccess(data.user, data.token);
      })
      .catch(err => {
        setLoading(false);
        setError(err.message);
      });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#080c14' : '#f8fafc',
      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      fontFamily: "'Outfit', 'Sarabun', sans-serif",
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.8rem',
            margin: '0 auto 1rem auto',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
          }}>
            G
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>ระบบรายงาน GLPI 11</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ป้อนบัญชี LDAP / GLPI ของคุณเพื่อเข้าสู่ระบบ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 500,
              border: '1px solid rgba(220, 38, 38, 0.15)'
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="เช่น kridsada.wo หรือ admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>
              รหัสผ่าน (Password)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="ป้อนรหัสผ่านของคุณ"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <KeyRound size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <span>เข้าสู่ระบบ (Login)</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
          paddingTop: '1rem',
          marginTop: '0.5rem',
          lineHeight: '1.5'
        }}>
          💡 หากใช้งานโหมดม็อก (Demo) สามารถใช้: <br />
          <strong>admin</strong> / <strong>admin</strong> หรือชื่อผู้ใช้อื่นๆ รหัสผ่าน <strong>password</strong>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  const [computers, setComputers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [entities, setEntities] = useState([]);
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

  // Check auth session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      fetch('/api/auth/status', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Session invalid');
          return res.json();
        })
        .then(data => {
          setUser(data.user);
          setToken(savedToken);
          setIsLoggedIn(true);
          setAuthLoading(false);
        })
        .catch(err => {
          console.warn(err.message);
          localStorage.removeItem('token');
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Fetch initial data once logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError(null);

    const apiBase = '';
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch(`${apiBase}/api/status`, { headers }).then(res => {
        if (!res.ok) throw new Error('API Status failed');
        return res.json();
      }),
      fetch(`${apiBase}/api/computers`, { headers }).then(res => {
        if (!res.ok) throw new Error('API Computers failed');
        return res.json();
      }),
      fetch(`${apiBase}/api/tickets`, { headers }).then(res => {
        if (!res.ok) throw new Error('API Tickets failed');
        return res.json();
      }),
      fetch(`${apiBase}/api/users`, { headers }).then(res => {
        if (!res.ok) throw new Error('API Users failed');
        return res.json();
      }),
      fetch(`${apiBase}/api/entities`, { headers }).then(res => {
        if (!res.ok) throw new Error('API Entities failed');
        return res.json();
      })
    ])
      .then(([statusData, computersData, ticketsData, usersData, entitiesData]) => {
        setDbStatus(statusData);
        setComputers(computersData);
        setTickets(ticketsData);
        setUsers(usersData);
        setEntities(entitiesData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์รายงานได้ โปรดตรวจสอบการทำงานของ Express backend');
        setLoading(false);
      });
  }, [isLoggedIn, retryCount, token]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleLoginSuccess = (u, t) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('token', t);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken('');
    setIsLoggedIn(false);
  };

  // Render Auth Loader
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme === 'dark' ? '#080c14' : '#f8fafc',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        fontFamily: "'Outfit', 'Sarabun', sans-serif"
      }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      </div>
    );
  }

  // Render Login page if not logged in
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} theme={theme} />;
  }

  // Render Data Loader
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
        fontFamily: "'Outfit', 'Sarabun', sans-serif"
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
        fontFamily: "'Outfit', 'Sarabun', sans-serif"
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
      user={user}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          computers={computers}
          tickets={tickets}
          entities={entities}
          setActiveTab={setActiveTab}
        />
      )}
      
      {activeTab === 'receiving' && (
        <ReceivingForm
          computers={computers}
          users={users}
          entities={entities}
        />
      )}
      
      {activeTab === 'maintenance-form' && (
        <MaintenanceForm
          computers={computers}
          users={users}
          entities={entities}
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
