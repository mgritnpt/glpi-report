import React from 'react';
import { Laptop, Wrench, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export default function Dashboard({ computers, tickets, setActiveTab }) {
  // Statistics Calculations
  const totalComputers = computers.length;
  const activeComputers = computers.filter(c => c.state.includes('Active') || c.state.includes('ใช้งาน')).length;
  const spareComputers = computers.filter(c => c.state.includes('Spare') || c.state.includes('สำรอง')).length;
  const repairComputers = computers.filter(c => c.state.includes('Repair') || c.state.includes('ซ่อม')).length;
  
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status <= 4).length; // New, Processing, Pending, Planned
  const resolvedTickets = tickets.filter(t => t.status >= 5).length; // Solved, Closed

  const resolutionRate = totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(0) : 0;

  // Group tickets by priority
  const highPriorityTickets = tickets.filter(t => t.priority >= 4);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>ยินดีต้อนรับสู่ระบบรายงาน GLPI 11</h1>
        <p style={{ color: 'var(--text-secondary)' }}>สรุปภาพรวมสินทรัพย์คอมพิวเตอร์และสถิติงานซ่อมบำรุงในระบบของคุณ</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {/* Card 1 */}
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                คอมพิวเตอร์ทั้งหมด
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{totalComputers}</h3>
            </div>
            <div style={{
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <Laptop size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
            <span>🟢 ใช้งาน: <strong>{activeComputers}</strong></span>
            <span>🔵 สำรอง: <strong>{spareComputers}</strong></span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                ตั๋วแจ้งซ่อมคงค้าง
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{pendingTickets}</h3>
            </div>
            <div style={{
              backgroundColor: 'var(--warning-light)',
              color: 'var(--warning)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <Wrench size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>🚨 เคสเร่งด่วน/สูง: <strong>{highPriorityTickets.length}</strong> รายการ</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                ซ่อมเสร็จแล้ว
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{resolvedTickets}</h3>
            </div>
            <div style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <CheckCircle size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>✅ ปิดงานเรียบร้อย (รวม Solved)</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                อัตราการแก้ปัญหา
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{resolutionRate}%</h3>
            </div>
            <div style={{
              backgroundColor: '#f5f3ff',
              color: '#8b5cf6',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <ShieldCheck size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', width: '100%' }}>
            <div style={{
              width: '100%',
              backgroundColor: 'var(--bg-tertiary)',
              height: '6px',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${resolutionRate}%`,
                backgroundColor: '#8b5cf6',
                height: '100%',
                borderRadius: '3px'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left Column: Recent Tickets */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>ตั๋วแจ้งซ่อมล่าสุด</h3>
            <button 
              onClick={() => setActiveTab('maintenance')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer'
              }}
            >
              ดูทั้งหมด <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem' }}>ID</th>
                  <th style={{ padding: '0.75rem' }}>หัวข้อ/ปัญหา</th>
                  <th style={{ padding: '0.75rem' }}>ความสำคัญ</th>
                  <th style={{ padding: '0.75rem' }}>สถานะ</th>
                  <th style={{ padding: '0.75rem' }}>ผู้แจ้ง</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 4).map((ticket) => {
                  let badgeClass = 'badge-muted';
                  if (ticket.status === 1) badgeClass = 'badge-primary'; // New
                  else if (ticket.status === 2 || ticket.status === 4) badgeClass = 'badge-warning'; // Processing / Planned
                  else if (ticket.status === 3) badgeClass = 'badge-muted'; // Pending
                  else if (ticket.status >= 5) badgeClass = 'badge-success'; // Solved/Closed

                  let priorityColor = 'var(--text-muted)';
                  if (ticket.priority >= 4) priorityColor = 'var(--danger)';
                  else if (ticket.priority === 3) priorityColor = 'var(--warning)';
                  else priorityColor = 'var(--primary)';

                  return (
                    <tr key={ticket.id}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>#{ticket.id}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.category}</div>
                      </td>
                      <td style={{ padding: '0.75rem', color: priorityColor, fontWeight: 600 }}>
                        {ticket.priority_text.split(' ')[0]}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${badgeClass}`}>{ticket.status_text.split(' ')[0]}</span>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{ticket.requester}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Asset breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>สัดส่วนสถานะทรัพย์สินคอมพิวเตอร์</h3>
            
            {/* Visual breakdown progress bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Active */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 500 }}>🟢 กำลังใช้งาน (Active)</span>
                  <span style={{ fontWeight: 600 }}>{activeComputers} เครื่อง ({totalComputers > 0 ? ((activeComputers / totalComputers) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${totalComputers > 0 ? (activeComputers / totalComputers) * 100 : 0}%`,
                    backgroundColor: 'var(--accent)',
                    height: '100%',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>

              {/* Spare */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 500 }}>🔵 สโตร์สำรอง (Spare)</span>
                  <span style={{ fontWeight: 600 }}>{spareComputers} เครื่อง ({totalComputers > 0 ? ((spareComputers / totalComputers) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${totalComputers > 0 ? (spareComputers / totalComputers) * 100 : 0}%`,
                    backgroundColor: 'var(--primary)',
                    height: '100%',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>

              {/* Repair */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 500 }}>🟡 อยู่ระหว่างซ่อม (Repair)</span>
                  <span style={{ fontWeight: 600 }}>{repairComputers} เครื่อง ({totalComputers > 0 ? ((repairComputers / totalComputers) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${totalComputers > 0 ? (repairComputers / totalComputers) * 100 : 0}%`,
                    backgroundColor: 'var(--warning)',
                    height: '100%',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>

              {/* Others (Scrap/Disposed) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 500 }}>🔴 จำหน่ายออก/ชำรุด (Scrap)</span>
                  <span style={{ fontWeight: 600 }}>{totalComputers - activeComputers - spareComputers - repairComputers} เครื่อง ({totalComputers > 0 ? (((totalComputers - activeComputers - spareComputers - repairComputers) / totalComputers) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${totalComputers > 0 ? ((totalComputers - activeComputers - spareComputers - repairComputers) / totalComputers) * 100 : 0}%`,
                    backgroundColor: 'var(--danger)',
                    height: '100%',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-primary)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Tag size={16} />
            <span>หมายเหตุ: ข้อมูลอ้างอิงตรงจากตารางหลักของฐานข้อมูล GLPI 11</span>
          </div>
        </div>
      </div>

      {/* Quick Report Generation Panel */}
      <div className="card glass-panel" style={{
        background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(5,150,105,0.05))',
        border: '1px solid var(--primary-light)',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>🖨️ ออกรายงานด่วน (Quick PDF Report Generator)</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          เลือกประเภทเอกสารที่ต้องการจัดทำและพิมพ์ออกเป็นรายงาน PDF ทันที
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('receiving')} className="btn btn-primary">
            📝 ออกใบรับมอบคอมพิวเตอร์
          </button>
          <button onClick={() => setActiveTab('maintenance')} className="btn btn-secondary" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            🔧 พิมพ์รายงานแจ้งซ่อม
          </button>
          <button onClick={() => setActiveTab('assets')} className="btn btn-secondary" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            💻 รายงานทรัพย์สิน/สเปกเครื่อง
          </button>
        </div>
      </div>
    </div>
  );
}
