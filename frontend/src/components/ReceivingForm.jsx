import React, { useState, useEffect } from 'react';
import { Printer, Info, Search } from 'lucide-react';

export default function ReceivingForm({ computers, users, entities = [] }) {
  const [selectedCompIds, setSelectedCompIds] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(''); // "" means auto, otherwise override user id
  
  // Custom accessories list
  const [accessories, setAccessories] = useState({
    mouse: true,
    keyboard: true,
    charger: true,
    bag: true,
    headset: false,
    other: ''
  });

  const [mouseType, setMouseType] = useState('USB Mouse');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  const [documentNo, setDocumentNo] = useState('');
  const [remarks, setRemarks] = useState('อุปกรณ์ผ่านการทดสอบสภาพการทำงานปกติ 100%');
  const [searchQuery, setSearchQuery] = useState('');

  // Entity selection
  const entityOptions = entities.length > 0 ? entities : [
    { id: 1, name: 'BPK', completename: 'BPK' },
    { id: 2, name: 'PPD', completename: 'PPD' }
  ];
  const [selectedEntityId, setSelectedEntityId] = useState('');

  // Local print datetime state
  const [printDateTime, setPrintDateTime] = useState('');

  // Initialize Entity Selection
  useEffect(() => {
    if (entityOptions.length > 0 && !selectedEntityId) {
      setSelectedEntityId(entityOptions[0].id.toString());
    }
  }, [entities]);

  // Helper to extract clean Entity Prefix
  const getEntityPrefix = (entityName) => {
    if (!entityName) return 'BPK';
    if (entityName.includes('>')) {
      const parts = entityName.split('>');
      return parts[parts.length - 1].trim().toUpperCase();
    }
    if (entityName.toLowerCase().includes('root')) return 'BPK'; // Default
    return entityName.toUpperCase().replace(/\s+/g, '');
  };

  // Generate Document No dynamically based on Entity and Document Date
  useEffect(() => {
    if (selectedEntityId && documentDate) {
      const entity = entityOptions.find(e => e.id.toString() === selectedEntityId.toString());
      const prefix = entity ? getEntityPrefix(entity.name) : 'BPK';
      const yy = documentDate.substring(2, 4);
      const mm = documentDate.substring(5, 7);
      const random = String(Math.floor(1000 + Math.random() * 9000));
      setDocumentNo(`${prefix}-${yy}${mm}-${random}`);
    }
  }, [selectedEntityId, documentDate, entities]);

  // Update print datetime
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      setPrintDateTime(formatted);
    };
    updateDateTime();
  }, []);

  // Suppress browser default title in print header
  useEffect(() => {
    const handleBeforePrint = () => {
      document.title = "";
    };
    const handleAfterPrint = () => {
      document.title = "GLPI 11 Report System";
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handleCheckboxChange = (key) => {
    setAccessories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectComp = (id) => {
    setSelectedCompIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filter computers based on search query
  const filteredComputers = computers.filter(c => {
    const term = searchQuery.toLowerCase();
    const displayName = `${c.name} - ${c.manufacturer} ${c.model} [รหัสทรัพย์สิน: ${c.otherserial || c.serial}]`.toLowerCase();
    return displayName.includes(term);
  });

  const handleSelectAll = () => {
    const filteredIds = filteredComputers.map(c => c.id.toString());
    const allSelected = filteredIds.every(id => selectedCompIds.includes(id));
    
    if (allSelected) {
      setSelectedCompIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedCompIds(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  // Get selected computers data
  const selectedComputersData = computers.filter(c => selectedCompIds.includes(c.id.toString()));

  return (
    <div>
      {/* Header */}
      <div className="no-print" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>ใบรับมอบและส่งคืนทรัพย์สิน</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          พิมพ์ใบรับมอบ - ส่งคืนคอมพิวเตอร์ สามารถเลือกหลายเครื่องเพื่อพิมพ์พร้อมกันได้ในครั้งเดียว
        </p>
      </div>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Form Controls */}
        <div className="card no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
          
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem', color: 'var(--primary)' }}>
              📥 ตั้งค่าใบรับมอบ - ส่งคืน
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>วันที่ทำเอกสาร</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={documentDate} 
                  onChange={(e) => setDocumentDate(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>เลือก Entity/สาขา</label>
                <select
                  className="form-control"
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                >
                  {entityOptions.map(e => (
                    <option key={e.id} value={e.id}>{getEntityPrefix(e.name)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>เลขที่เอกสารเริ่มต้น (Auto-Generated)</label>
              <input 
                type="text" 
                className="form-control" 
                value={documentNo} 
                onChange={(e) => setDocumentNo(e.target.value)} 
                placeholder="BPK-YYMM-XXXX"
              />
            </div>

            {/* Multiselect computer section with Search */}
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>เลือกคอมพิวเตอร์ที่ต้องการรับมอบ ({selectedCompIds.length} เครื่อง)</span>
                <button 
                  type="button" 
                  onClick={handleSelectAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {filteredComputers.map(c => c.id.toString()).every(id => selectedCompIds.includes(id)) ? 'Deselect All' : 'Select All'}
                </button>
              </label>

              {/* Search input */}
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="ค้นหาตามชื่อ/แบรนด์/รุ่น/รหัสทรัพย์สิน..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              {/* Checklist container */}
              <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}>
                {filteredComputers.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                    ไม่พบรายการข้อมูลคอมพิวเตอร์
                  </div>
                ) : (
                  filteredComputers.map(c => {
                    const isChecked = selectedCompIds.includes(c.id.toString());
                    return (
                      <label 
                        key={c.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: isChecked ? 'var(--primary-light)' : 'transparent',
                          color: isChecked ? 'var(--primary)' : 'var(--text-secondary)',
                          transition: 'var(--transition)'
                        }}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectComp(c.id.toString())}
                          style={{ marginTop: '2px' }}
                        />
                        <span style={{ fontWeight: isChecked ? 600 : 400 }}>
                          {c.name} - {c.manufacturer} {c.model} 
                          <span style={{ display: 'block', fontSize: '0.65rem', color: isChecked ? 'var(--primary)' : 'var(--text-muted)' }}>
                            [รหัสทรัพย์สิน: {c.otherserial || c.serial || 'N/A'}]
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>ผู้รับมอบอุปกรณ์</label>
              <select 
                className="form-control" 
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- เลือกผู้รับมอบอัตโนมัติ (ดึงจากเจ้าของทรัพย์สินใน GLPI) --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', marginBottom: '0.4rem', display: 'block' }}>อุปกรณ์เสริมที่ส่งมอบ</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={accessories.mouse} onChange={() => handleCheckboxChange('mouse')} />
                  เมาส์ (Mouse)
                </label>
                {accessories.mouse && (
                  <select 
                    className="form-control"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', height: 'auto', gridColumn: '2' }}
                    value={mouseType}
                    onChange={(e) => setMouseType(e.target.value)}
                  >
                    <option value="USB Mouse">USB Mouse (แบบมีสาย)</option>
                    <option value="Wireless Mouse">Wireless Mouse (ไร้สาย)</option>
                  </select>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={accessories.keyboard} onChange={() => handleCheckboxChange('keyboard')} />
                  คีย์บอร์ดภายนอก
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={accessories.charger} onChange={() => handleCheckboxChange('charger')} />
                  สายชาร์จ & อะแดปเตอร์
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={accessories.bag} onChange={() => handleCheckboxChange('bag')} />
                  กระเป๋าโน้ตบุ๊ก
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={accessories.headset} onChange={() => handleCheckboxChange('headset')} />
                  หูฟังสำหรับทำงาน
                </label>
              </div>
              
              <input 
                type="text" 
                className="form-control" 
                placeholder="อุปกรณ์เสริมอื่นๆ ระบุ..." 
                value={accessories.other}
                onChange={(e) => setAccessories(prev => ({ ...prev, other: e.target.value }))}
                style={{ marginTop: '0.4rem', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>หมายเหตุการส่งมอบ</label>
              <textarea 
                className="form-control" 
                rows="2" 
                style={{ resize: 'none', fontSize: '0.8rem' }}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <div style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.72rem',
            display: 'flex',
            gap: '0.4rem',
            alignItems: 'flex-start'
          }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>ใบรับมอบได้รับการปรับปรุงเพื่อเอาฟังก์ชันการรับคืนอุปกรณ์ในหน้าเว็บออกแล้ว โดยจะมุ่งเน้นการจัดทำเอกสารส่งมอบ A4 แผ่นเดียวสำหรับการพิมพ์เพื่อนำไปเซ็นเอกสารจริง</span>
          </div>
        </div>

        {/* Right Side: Document Preview & Action */}
        <div>
          <div className="doc-preview-header no-print" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>📄 ใบรับมอบ-ส่งคืน A4 ({selectedCompIds.length} แผ่น)</h3>
            <button 
              onClick={handlePrint} 
              disabled={selectedCompIds.length === 0}
              className="btn btn-primary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
            >
              <Printer size={16} /> สั่งพิมพ์ใบรับมอบ
            </button>
          </div>

          <div className="doc-preview-outer" style={{
            backgroundColor: '#0f172a15',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxHeight: '75vh',
            overflowY: 'auto'
          }}>
            {selectedComputersData.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                <Printer size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>กรุณาเลือกเครื่องคอมพิวเตอร์</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>เลือกเครื่องด้านซ้ายมือเพื่อเรนเดอร์เอกสารและเตรียมสั่งพิมพ์</p>
              </div>
            ) : (
              selectedComputersData.map((computer, index) => {
                // Find user info
                let docUser = null;
                if (selectedUserId) {
                  docUser = users.find(u => u.id.toString() === selectedUserId);
                } else if (computer.user_id) {
                  docUser = users.find(u => u.id === computer.user_id);
                }

                if (!docUser) {
                  docUser = {
                    name: computer.username || 'ไม่มีผู้ถือครอง',
                    title: 'พนักงาน',
                    department: computer.user_dept || 'สำนักงานใหญ่',
                    phone: 'N/A',
                    email: 'N/A'
                  };
                }

                // Document number format
                const cleanPrefix = selectedEntityId ? getEntityPrefix(entityOptions.find(e => e.id.toString() === selectedEntityId.toString())?.name) : 'BPK';
                const yy = documentDate.substring(2, 4);
                const mm = documentDate.substring(5, 7);
                const baseNo = parseInt(documentNo.split('-')[2]) || 1000;
                const pageDocNo = `${cleanPrefix}-${yy}${mm}-${String(baseNo + index)}`;

                const isLast = index === selectedComputersData.length - 1;

                return (
                  <div 
                    key={computer.id} 
                    className="printable-document" 
                    id="receiving-form-print-area" 
                    style={{ 
                      fontSize: '10.5px', 
                      lineHeight: '1.35', 
                      fontFamily: "'Sarabun', sans-serif",
                      pageBreakAfter: isLast ? 'avoid' : 'always',
                      breakAfter: isLast ? 'avoid' : 'page',
                      backgroundColor: '#fff',
                      color: '#000',
                      padding: '12mm 15mm',
                      borderRadius: '4px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                      width: '100%',
                      margin: '0 auto',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Header Letterhead */}
                    <div className="doc-header-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '6px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '45px', height: '45px', border: '1px dashed #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
                          <img 
                            src="/logo.png" 
                            alt="Logo" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = '<span style="font-size: 8px; color: #94a3b8; text-align: center; font-weight: bold;">LOGO</span>';
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <div>
                          <h2 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>บริษัท นิปปอนเพนต์ (ประเทศไทย) จํากัด</h2>
                          <p style={{ fontSize: '9.5px', color: '#475569', margin: '2px 0 0 0' }}>ฝ่ายเทคโนโลยีสารสนเทศ</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>ใบรับมอบ - ส่งคืนอุปกรณ์คอมพิวเตอร์</h3>
                        <p style={{ fontSize: '9.5px', margin: '1px 0 0 0' }}><strong>เลขที่เอกสาร:</strong> {pageDocNo} | <strong>วันที่:</strong> {documentDate}</p>
                      </div>
                    </div>

                    {/* 1. Recipient Details Table */}
                    <div className="section-wrapper">
                      <div className="doc-section-title" style={{ fontSize: '10.5px', marginBottom: '4px' }}>1. ข้อมูลผู้รับมอบ / ผู้ส่งคืน อุปกรณ์ (Equipment Recipient / Returner Detail)</div>
                      <table style={{ width: '100%', marginBottom: '0px' }} className="doc-table">
                        <tbody>
                          <tr>
                            <td style={{ width: '15%', fontWeight: 700, backgroundColor: '#f8fafc' }}>ชื่อ-นามสกุล:</td>
                            <td style={{ width: '35%' }}>{docUser.name}</td>
                            <td style={{ width: '15%', fontWeight: 700, backgroundColor: '#f8fafc' }}>ตำแหน่ง:</td>
                            <td style={{ width: '35%' }}>{docUser.title || 'พนักงาน'}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>แผนก/ฝ่าย:</td>
                            <td>{docUser.department}</td>
                            <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>เบอร์ติดต่อ:</td>
                            <td>{docUser.phone}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>อีเมล:</td>
                            <td colSpan="3">{docUser.email}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* 2. Computer Specifications Table */}
                    <div className="section-wrapper">
                      <div className="doc-section-title" style={{ fontSize: '10.5px', marginBottom: '4px' }}>2. ข้อมูลเครื่องคอมพิวเตอร์หลัก (Computer Specifications)</div>
                      <table style={{ width: '100%', marginBottom: '0px' }} className="doc-table">
                        <tbody>
                          <tr>
                            <td style={{ width: '18%', fontWeight: 700, backgroundColor: '#f8fafc' }}>รหัสทรัพย์สิน (INV):</td>
                            <td style={{ width: '32%' }}>{computer.otherserial || 'N/A'}</td>
                            <td style={{ width: '18%', fontWeight: 700, backgroundColor: '#f8fafc' }}>ซีเรียลนัมเบอร์ (S/N):</td>
                            <td style={{ width: '32%' }}>{computer.serial || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>ยี่ห้อ / รุ่น:</td>
                            <td>{computer.manufacturer} {computer.model}</td>
                            <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>ชื่อเครื่อง (Hostname):</td>
                            <td>{computer.name}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>รายละเอียดสเปก:</td>
                            <td colSpan="3" style={{ fontSize: '10.5px' }}>
                              <span><strong>OS:</strong> {computer.os || 'Windows 11 Pro'} | <strong>CPU:</strong> {computer.cpu || 'Intel Core i5'} | <strong>RAM:</strong> {computer.ram || '16 GB'} | <strong>Storage:</strong> {computer.storage || '512 GB SSD'}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* 3. Accessories Details Grid */}
                    <div className="section-wrapper">
                      <div className="doc-section-title" style={{ fontSize: '10.5px', marginBottom: '4px' }}>3. อุปกรณ์เสริมพ่วงประกอบที่ส่งมอบ (Accessories Handed Over)</div>
                      <div className="accessories-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '4px 20px', 
                        padding: '6px 10px', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '4px', 
                        marginBottom: '0px', 
                        fontSize: '10.5px', 
                        backgroundColor: '#fafafa' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{accessories.mouse ? '☑' : '☐'}</span> เมาส์ ({accessories.mouse ? mouseType : 'Mouse'})
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{accessories.bag ? '☑' : '☐'}</span> กระเป๋าโน้ตบุ๊ก (Notebook Bag)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{accessories.keyboard ? '☑' : '☐'}</span> คีย์บอร์ดภายนอก (Keyboard)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{accessories.headset ? '☑' : '☐'}</span> หูฟังบริษัท (Headset)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{accessories.charger ? '☑' : '☐'}</span> สายชาร์จ & อะแดปเตอร์ (Adapter)
                        </div>
                        {accessories.other ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>☑</span> อุปกรณ์อื่นๆ: <span style={{ textDecoration: 'underline' }}>{accessories.other}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                            <span>☐</span> อุปกรณ์อื่นๆ: -
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Part 1: Handover */}
                    <div className="part-section" style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 10px', marginBottom: '8px', backgroundColor: '#fdfdfd' }}>
                      <div style={{ fontWeight: 700, fontSize: '10.5px', color: 'var(--primary)', marginBottom: '3px', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
                        📝 ส่วนที่ 1: บันทึกการส่งมอบและรับอุปกรณ์คอมพิวเตอร์ (IT Asset Handover Record)
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#334155', lineHeight: '1.4', marginBottom: '6px' }}>
                        ข้าพเจ้าได้ตรวจสอบและรับมอบอุปกรณ์ข้างต้นในสภาพทำงานปกติ 100% เรียบร้อยแล้ว 
                        และตกลงจะปฏิบัติตามนโยบายความมั่นคงปลอดภัยสารสนเทศของบริษัทฯ เสมอ
                        {remarks && <span style={{ display: 'block', marginTop: '2px', fontStyle: 'italic', color: '#475569' }}><strong>หมายเหตุ:</strong> {remarks}</span>}
                      </div>

                      {/* Terms and Conditions inside Part 1 */}
                      <div style={{ fontSize: '9px', color: '#475569', marginTop: '4px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                        <strong>ข้อตกลงการใช้งาน:</strong>
                        <ul style={{ margin: '2px 0 0 0', paddingLeft: '15px', listStyleType: 'decimal' }}>
                          <li>ผู้รับอุปกรณ์มีหน้าที่รับผิดชอบและดูแลรักษาความปลอดภัยของคอมพิวเตอร์และอุปกรณ์ทั้งหมดให้อยู่ในสภาพพร้อมใช้งานเสมอ</li>
                          <li>ห้ามดัดแปลง ฮาร์ดแวร์ หรือแกะฝาเครื่อง หรือติดตั้งซอฟต์แวร์ที่ละเมิดลิขสิทธิ์ หรือโปรแกรมที่ละเมิดนโยบายของบริษัทฯ</li>
                          <li>ในกรณีที่คอมพิวเตอร์สูญหาย ชำรุด หรือเกิดปัญหาการใช้งาน จะต้องรีบแจ้งฝ่ายไอทีสารสนเทศทันทีเพื่อทำการซ่อมแซมหรือแจ้งความตามขั้นตอน</li>
                          <li>เมื่อพ้นสภาพการเป็นพนักงาน หรือมีการเปลี่ยนตำแหน่งงาน จะต้องส่งคืนคอมพิวเตอร์และอุปกรณ์ทั้งหมดในสภาพปกติแก่ฝ่าย IT ทันที</li>
                        </ul>
                      </div>

                      {/* 3 Signature Grid for Handover */}
                      <div className="signature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', marginTop: '6px' }}>
                        <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อผู้รับมอบ (Received By)</span>
                          <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '28px auto 4px auto' }}></div>
                          <span style={{ fontSize: '9px' }}>({docUser.name})</span>
                          <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>พนักงานผู้รับมอบอุปกรณ์</span>
                        </div>
                        
                        <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อผู้ส่งมอบ (Handed Over By)</span>
                          <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '28px auto 4px auto' }}></div>
                          <span style={{ fontSize: '9px' }}>(........................................................)</span>
                          <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>เจ้าหน้าที่ฝ่าย IT Support</span>
                        </div>

                        <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อพยาน (Witness/Manager)</span>
                          <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '28px auto 4px auto' }}></div>
                          <span style={{ fontSize: '9px' }}>(........................................................)</span>
                          <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>พยาน / หัวหน้างานต้นสังกัด</span>
                        </div>
                      </div>
                    </div>

                    {/* Part 2: Return */}
                    <div className="part-section" style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 10px', backgroundColor: '#fdfdfd' }}>
                      <div style={{ fontWeight: 700, fontSize: '10.5px', color: 'var(--accent)', marginBottom: '3px', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
                        🔄 ส่วนที่ 2: บันทึกการส่งคืนและรับคืนสินทรัพย์ (IT Asset Return Record)
                      </div>
                      
                      {/* Return Details Grid with Checkboxes for Reason and Condition */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '6px', padding: '6px 8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '3px', fontSize: '9.5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px 15px' }}>
                          <div><strong>วันที่ส่งคืน:</strong> _____/_____/________</div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <strong>เหตุผลการส่งคืน:</strong>
                            <span>☐ ลาออก (Resign)</span>
                            <span>☐ เปลี่ยนเครื่อง/อัปเกรด (Upgrade)</span>
                            <span>☐ ชำรุด/ส่งซ่อม (Repair)</span>
                            <span>☐ อื่นๆ (Others)</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
                          <strong>สภาพอุปกรณ์ตอนส่งคืน:</strong>
                          <span>☐ ปกติ (Normal)</span>
                          <span>☐ ชำรุดเสียหายบางส่วน (Partially Damaged)</span>
                          <span>☐ เสียหายทั้งหมด/เปิดไม่ติด (Fully Damaged)</span>
                        </div>
                      </div>

                      {/* Blank Accessories checklist for manual check during return */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '3px 20px', 
                        padding: '5px 8px', 
                        border: '1px dashed #cbd5e1', 
                        borderRadius: '3px', 
                        marginBottom: '6px', 
                        fontSize: '9.5px', 
                        backgroundColor: '#fafafa' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>☐</span> ส่งคืน เมาส์ ({accessories.mouse ? mouseType : 'Mouse'})
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>☐</span> ส่งคืน กระเป๋าโน้ตบุ๊ก (Notebook Bag)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>☐</span> ส่งคืน คีย์บอร์ดภายนอก (Keyboard)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>☐</span> ส่งคืน หูฟังบริษัท (Headset)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>☐</span> ส่งคืน สายชาร์จ & อะแดปเตอร์ (Adapter)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>☐</span> ส่งคืน อุปกรณ์อื่นๆ: __________________
                        </div>
                      </div>

                      <div style={{ fontSize: '9.5px', color: '#334155', lineHeight: '1.4', marginBottom: '4px' }}>
                        ข้าพเจ้าได้นำส่งคืนอุปกรณ์คอมพิวเตอร์และอุปกรณ์ต่อพ่วงในสภาพที่ระบุไว้ข้างต้น 
                        เพื่อส่งมอบคืนให้แก่ฝ่ายไอทีสารสนเทศเก็บรักษาหรือดำเนินการตามประวัติต่อไป
                      </div>

                      {/* Missing Items Fine Clause inside Part 2 */}
                      <div style={{ fontSize: '9px', color: 'var(--danger)', marginBottom: '6px', fontWeight: 700 }}>
                        *กรณีส่งมอบไม่ครบ ต้องชำระค่าเสียหายจำนวน ............................................................ บาท
                      </div>

                      {/* 3 Signature Grid for Return */}
                      <div className="signature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', marginTop: '4px' }}>
                        <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อผู้ส่งคืน (Returned By)</span>
                          <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '28px auto 4px auto' }}></div>
                          <span style={{ fontSize: '9px' }}>({docUser.name})</span>
                          <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>พนักงานผู้ส่งคืนอุปกรณ์</span>
                        </div>
                        
                        <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อผู้รับคืน (Received Back By)</span>
                          <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '28px auto 4px auto' }}></div>
                          <span style={{ fontSize: '9px' }}>(........................................................)</span>
                          <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>เจ้าหน้าที่ฝ่าย IT Support</span>
                        </div>

                        <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อพยาน (Witness/Manager)</span>
                          <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '28px auto 4px auto' }}></div>
                          <span style={{ fontSize: '9px' }}>(........................................................)</span>
                          <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>พยาน / หัวหน้างานต้นสังกัด</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Notice / Custom Footer */}
                    <div className="custom-print-footer" style={{ 
                      marginTop: 'auto', 
                      borderTop: '1px solid #cbd5e1', 
                      paddingTop: '4px', 
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '8.5px', 
                      color: '#64748b' 
                    }}>
                      <span>* เอกสารการส่งมอบ-ส่งคืนสินทรัพย์นี้ ถูกจัดทำและอ้างอิงผ่านระบบบริหารจัดการทะเบียนสินทรัพย์ไอที *</span>
                      <span style={{ fontStyle: 'italic' }}>พิมพ์เมื่อ: {printDateTime} น.</span>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
