import React, { useState, useEffect } from 'react';
import { Search, Printer, Filter, Wrench, Clock, CheckCircle2, ChevronRight, User, AlertTriangle } from 'lucide-react';

export default function MaintenanceReport({ tickets }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toString().includes(searchTerm) ||
                          (t.item_name && t.item_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' ? true : t.status.toString() === statusFilter;
    const matchesPriority = priorityFilter === '' ? true : t.priority.toString() === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Fetch ticket details when selection changes
  useEffect(() => {
    if (selectedTicketId) {
      fetch(`/api/tickets/${selectedTicketId}`)
        .then(res => res.json())
        .then(data => setSelectedTicket(data))
        .catch(err => {
          console.error(err);
          // Fallback to local array
          const found = tickets.find(t => t.id === parseInt(selectedTicketId));
          setSelectedTicket(found);
        });
    } else {
      setSelectedTicket(null);
    }
  }, [selectedTicketId, tickets]);

  // Select first ticket on load
  useEffect(() => {
    if (filteredTickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(filteredTickets[0].id.toString());
    }
  }, [tickets]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeClass = (status) => {
    if (status === 1) return 'badge-primary'; // New
    if (status === 2 || status === 4) return 'badge-warning'; // Processing / Planned
    if (status === 3) return 'badge-muted'; // Pending
    return 'badge-success'; // Solved/Closed
  };

  return (
    <div>
      {/* Header */}
      <div className="no-print" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>รายงานการแจ้งซ่อม</h1>
        <p style={{ color: 'var(--text-secondary)' }}>สรุปประวัติใบงานซ่อมบำรุง กรองตามสถานะ และพิมพ์ใบงานแจ้งซ่อมแบบละเอียด (A4 Document)</p>
      </div>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Ticket List & Filters */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Filters Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} /> กรองตั๋วแจ้งซ่อม
            </h3>
            
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <input
                type="text"
                placeholder="ค้นหาตามเลขตั๋ว, ปัญหา, คอมฯ หรือผู้แจ้ง..."
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
              >
                <option value="">-- ทุกสถานะ --</option>
                <option value="1">ใหม่ (New)</option>
                <option value="2">กำลังดำเนินการ (Processing)</option>
                <option value="3">รอดำเนินการ (Pending)</option>
                <option value="5">แก้ไขแล้ว (Solved)</option>
                <option value="6">ปิดงาน (Closed)</option>
              </select>

              <select
                className="form-control"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
              >
                <option value="">-- ทุกระดับความด่วน --</option>
                <option value="1">ต่ำมาก (Very Low)</option>
                <option value="2">ต่ำ (Low)</option>
                <option value="3">ปานกลาง (Medium)</option>
                <option value="4">สูง (High)</option>
                <option value="5">สูงมาก (Very High)</option>
              </select>
            </div>
          </div>

          {/* List Card */}
          <div className="card" style={{ padding: '0.5rem', maxHeight: '550px', overflowY: 'auto' }}>
            {filteredTickets.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertTriangle size={24} style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.9rem' }}>ไม่พบรายการแจ้งซ่อมตามคำค้นหา</p>
              </div>
            ) : (
              filteredTickets.map(t => {
                const isSelected = selectedTicketId === t.id.toString();
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id.toString())}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{
                      backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-tertiary)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      minWidth: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}>
                      #{t.id}
                    </div>

                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className={`badge ${getStatusBadgeClass(t.status)}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                          {t.status_text.split(' ')[0]}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.date.split(' ')[0]}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
                        <span>👤 {t.requester}</span>
                        {t.item_name && <span>💻 {t.item_name}</span>}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                );
              })
            )}
          </div>

        </div>

        {/* Right Side: Document Preview & Action */}
        <div>
          {selectedTicket ? (
            <div>
              <div className="doc-preview-header no-print">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>📄 ตัวอย่างประวัติใบงานซ่อมคอมพิวเตอร์ (Work Order Preview)</h3>
                <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <Printer size={16} /> พิมพ์รายงานใบงานซ่อม
                </button>
              </div>

              {/* A4 sheet */}
              <div className="doc-preview-outer">
                <div className="printable-document">
                  
                  {/* Header Letterhead */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '15px', fontWeight: 700 }}>แผนก IT Service Support</h2>
                      <p style={{ fontSize: '11px', color: '#475569' }}>บันทึกประวัติการแก้ไขปัญหาและการบำรุงรักษาอุปกรณ์ (IT Work Order)</p>
                      <p style={{ fontSize: '11px', color: '#475569' }}>ระบบบริหารจัดการงานบริการ GLPI 11</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700 }}>ใบงานแจ้งซ่อมบำรุง</h3>
                      <p style={{ fontSize: '11px' }}><strong>เลขที่ตั๋ว (Ticket ID):</strong> #{selectedTicket.id}</p>
                      <p style={{ fontSize: '11px' }}><strong>วันที่เปิด:</strong> {selectedTicket.date}</p>
                    </div>
                  </div>

                  {/* Summary Block */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    marginBottom: '1.5rem',
                    fontSize: '12px'
                  }}>
                    <div>
                      <p style={{ marginBottom: '4px' }}><strong>หัวข้อเรื่อง:</strong> {selectedTicket.name}</p>
                      <p style={{ marginBottom: '4px' }}><strong>หมวดหมู่ปัญหา:</strong> {selectedTicket.category}</p>
                      <p><strong>ผู้รายงาน/แจ้งปัญหา:</strong> {selectedTicket.requester}</p>
                    </div>
                    <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '12px' }}>
                      <p style={{ marginBottom: '4px' }}><strong>สถานะงานซ่อม:</strong> <span style={{ fontWeight: 700 }}>{selectedTicket.status_text}</span></p>
                      <p style={{ marginBottom: '4px' }}><strong>ระดับความด่วน:</strong> <span style={{ fontWeight: 700 }}>{selectedTicket.priority_text}</span></p>
                      <p><strong>ช่างเทคนิคผู้ดูแล:</strong> {selectedTicket.technician}</p>
                    </div>
                  </div>

                  {/* Linked asset */}
                  <div className="doc-section-title">1. ข้อมูลทรัพย์สินคอมพิวเตอร์ที่ชำรุด (Linked Hardware Asset)</div>
                  {selectedTicket.item_name ? (
                    <table style={{ width: '100%', marginBottom: '1.25rem' }} className="doc-table">
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', fontWeight: 700, backgroundColor: '#f1f5f9' }}>ชื่อคอมพิวเตอร์ (Computer):</td>
                          <td style={{ width: '25%' }}>{selectedTicket.item_name}</td>
                          <td style={{ width: '25%', fontWeight: 700, backgroundColor: '#f1f5f9' }}>ซีเรียลนัมเบอร์ (S/N):</td>
                          <td style={{ width: '25%' }}>{selectedTicket.item_serial || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>ประเภทอุปกรณ์:</td>
                          <td>{selectedTicket.item_type === 'Computer' ? 'เครื่องคอมพิวเตอร์' : selectedTicket.item_type || 'N/A'}</td>
                          <td style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>รหัสเครื่องหลัก:</td>
                          <td>#{selectedTicket.item_id || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div style={{
                      padding: '12px',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '1.25rem'
                    }}>
                      -- ไม่ได้เชื่อมโยงสินทรัพย์เฉพาะเจาะจงในตั๋วแจ้งซ่อมนี้ -- (เป็นการแจ้งปัญหาทางด้านระบบ ซอฟต์แวร์ หรือเน็ตเวิร์กทั่วไป)
                    </div>
                  )}

                  {/* Incident Description */}
                  <div className="doc-section-title">2. รายละเอียดปัญหาและอาการชำรุด (Problem Description)</div>
                  <div style={{
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '12.5px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    minHeight: '80px',
                    marginBottom: '1.5rem'
                  }}>
                    {selectedTicket.content || 'ไม่ได้ระบุคำอธิบายเพิ่มเติม'}
                  </div>

                  {/* Incident Solution */}
                  <div className="doc-section-title">3. รายละเอียดการดำเนินการแก้ไขปัญหา (Service & Repair Solution)</div>
                  <div style={{
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    fontSize: '12.5px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    minHeight: '120px',
                    marginBottom: '1.5rem'
                  }}>
                    {selectedTicket.solution ? (
                      <div>
                        <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>
                          ✓ ตรวจสอบและซ่อมแซมสำเร็จ (Action Log):
                        </div>
                        {selectedTicket.solution}
                      </div>
                    ) : (
                      <div style={{ color: '#64748b', fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span>[ ] อยู่ระหว่างการรอการสืบหาจุดบกพร่อง / รออะไหล่จากผู้ขายภายนอก</span>
                        <span>[ ] ทดสอบสลับอุปกรณ์ อะแดปเตอร์ หรืออัปเกรดเฟิร์มแวร์ระบบ</span>
                        <span>[ ] อยู่ระหว่างสรุปวิธีดำเนินงานสำหรับช่างเทคนิค...</span>
                        <div style={{ borderBottom: '1px dotted #cbd5e1', marginTop: '20px' }}></div>
                        <div style={{ borderBottom: '1px dotted #cbd5e1', marginTop: '20px' }}></div>
                      </div>
                    )}
                  </div>

                  {/* Signature Box */}
                  <div className="doc-terms" style={{ marginTop: 'auto' }}>
                    * เอกสารนี้จัดทำโดยระบบ GLPI 11 สำหรับออกรายงานตรวจสอบงานบริการ (Helpdesk & Asset Management Report) 
                    บันทึกการส่งงานซ่อมบำรุงระบบไอทีให้เป็นไปตามนโยบายระดับการให้บริการ (SLA) ของบริษัทฯ
                  </div>

                  {/* Signatures */}
                  <div className="doc-signatures">
                    <div className="signature-box">
                      <span className="signature-text">ลงชื่อช่างผู้ดำเนินการ (Technician Signature)</span>
                      <div className="signature-line"></div>
                      <span className="signature-text">({selectedTicket.technician})</span>
                      <span className="signature-text" style={{ fontSize: '11px', color: '#64748b' }}>วันที่: ____/____/______</span>
                    </div>

                    <div className="signature-box">
                      <span className="signature-text">ลงชื่อผู้รับมอบงาน/ผู้แจ้งซ่อม (Requester Signature)</span>
                      <div className="signature-line"></div>
                      <span className="signature-text">({selectedTicket.requester})</span>
                      <span className="signature-text" style={{ fontSize: '11px', color: '#64748b' }}>วันที่: ____/____/______</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem', color: 'var(--text-muted)' }}>
              <Wrench size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
              <p>กรุณาเลือกตั๋วแจ้งซ่อมจากรายการด้านซ้ายเพื่อดูตัวอย่างใบงานซ่อม</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
