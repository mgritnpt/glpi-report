import React from 'react';
import { LayoutGrid, FileText, Wrench, Laptop, Sun, Moon, Database, ChevronRight, FileSpreadsheet } from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab, theme, toggleTheme, dbStatus }) {
  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวมระบบ', icon: LayoutGrid, desc: 'แดชบอร์ดสรุปสถิติ' },
    { id: 'receiving', label: 'ใบรับมอบคอมพิวเตอร์', icon: FileText, desc: 'แบบฟอร์มส่งมอบคอมฯ' },
    { id: 'maintenance', label: 'รายงานแจ้งซ่อม', icon: Wrench, desc: 'รายละเอียดตั๋วซ่อม' },
    { id: 'assets', label: 'รายงานทรัพย์สิน', icon: Laptop, desc: 'รายละเอียดสเปกอุปกรณ์' },
    { id: 'export', label: 'ส่งออกข้อมูลสินทรัพย์', icon: FileSpreadsheet, desc: 'ออกรายงาน Excel พรีเมียม' }
  ];


  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar no-print">
        {/* Logo Section */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
          }}>
            G
          </div>
          <div className="logo-text">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.5px' }}>GLPI 11</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Report Center</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flexGrow: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  width: '100%',
                  padding: '0.85rem 1rem',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition)',
                  fontWeight: isActive ? 600 : 500
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="nav-label">
                  <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                  <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 400 }}>
                    {item.desc}
                  </span>
                </div>
                {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} className="nav-label" />}
              </button>
            );
          })}
        </nav>

        {/* Database Status Info */}
        <div style={{
          padding: '1rem',
          margin: '0.75rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }} className="nav-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <Database size={16} color={dbStatus?.connected ? 'var(--accent)' : 'var(--warning)'} />
            <span style={{ fontWeight: 600 }}>สถานะฐานข้อมูล</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <p><strong>โหมด:</strong> {dbStatus?.mode || 'กำลังเชื่อมต่อ...'}</p>
            <p><strong>Host:</strong> {dbStatus?.host || '-'}</p>
            {dbStatus?.connected && <p><strong>DB:</strong> {dbStatus?.database}</p>}
          </div>
          <span style={{
            fontSize: '0.65rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: dbStatus?.connected ? 'var(--accent-light)' : 'var(--warning-light)',
            color: dbStatus?.connected ? 'var(--accent)' : 'var(--warning)',
            textAlign: 'center',
            fontWeight: 600
          }}>
            {dbStatus?.connected ? 'MariaDB Connected' : 'DEMO MODE (Mock Data)'}
          </span>
        </div>

        {/* Theme and User Footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              IT
            </div>
            <div className="user-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>IT Admin</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>GLPI Operator</span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-tertiary)',
              transition: 'var(--transition)'
            }}
            title={theme === 'dark' ? 'เปิดโหมดกลางวัน' : 'เปิดโหมดกลางคืน'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
