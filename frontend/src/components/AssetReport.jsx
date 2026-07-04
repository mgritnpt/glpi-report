import React, { useState, useEffect } from 'react';
import { Search, Printer, Laptop, Eye, Tag, AlertTriangle, Layers, Grid, Database } from 'lucide-react';

export default function AssetReport({ computers }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCompId, setSelectedCompId] = useState('');
  const [selectedComputer, setSelectedComputer] = useState(null);
  
  // viewMode: 'single' (spec sheet of selected computer) or 'summary' (print all filtered computers table)
  const [viewMode, setViewMode] = useState('single');

  // Filter computers
  const filteredComputers = computers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.serial.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.otherserial.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = brandFilter === '' ? true : c.manufacturer.toLowerCase().includes(brandFilter.toLowerCase());
    const matchesStatus = statusFilter === '' ? true : c.state.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesBrand && matchesStatus;
  });

  // Fetch detailed computer specs when selectedCompId changes
  useEffect(() => {
    if (selectedCompId) {
      fetch(`/api/computers/${selectedCompId}`)
        .then(res => res.json())
        .then(data => setSelectedComputer(data))
        .catch(err => {
          console.error(err);
          // Fallback to local item
          const found = computers.find(c => c.id === parseInt(selectedCompId));
          setSelectedComputer(found);
        });
    } else {
      setSelectedComputer(null);
    }
  }, [selectedCompId, computers]);

  // Select first computer on load
  useEffect(() => {
    if (filteredComputers.length > 0 && !selectedCompId) {
      setSelectedCompId(filteredComputers[0].id.toString());
    }
  }, [computers]);

  // Unique list of brands for dropdown filter
  const brands = Array.from(new Set(computers.map(c => c.manufacturer).filter(Boolean)));
  // Unique list of statuses
  const statuses = Array.from(new Set(computers.map(c => c.state.split(' ')[0]).filter(Boolean)));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="no-print" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>รายงานรายละเอียดทรัพย์สิน</h1>
        <p style={{ color: 'var(--text-secondary)' }}>รายละเอียดสินทรัพย์คอมพิวเตอร์ ดึงสเปกเครื่องหลัก (CPU, RAM, Harddisk, OS, ประกัน) พิมพ์ใบประวัติทรัพย์สินเดี่ยวหรือตารางสรุป</p>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Top Controls: Filter Toolbar */}
        <div className="card no-print" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '250px' }}>
            <input
              type="text"
              placeholder="ค้นหาตามชื่อเครื่อง, ซีเรียล, รหัสทรัพย์สิน, หรือผู้ใช้..."
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Filter 1: Brand */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-control"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            >
              <option value="">-- ทุกยี่ห้อ --</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Filter 2: Status */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            >
              <option value="">-- ทุกสถานะ --</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('single')}
              style={{
                padding: '0.6rem 1rem',
                border: 'none',
                backgroundColor: viewMode === 'single' ? 'var(--primary-light)' : 'var(--bg-secondary)',
                color: viewMode === 'single' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Eye size={16} /> ใบประวัติเครื่อง
            </button>
            <button
              onClick={() => setViewMode('summary')}
              style={{
                padding: '0.6rem 1rem',
                border: 'none',
                backgroundColor: viewMode === 'summary' ? 'var(--primary-light)' : 'var(--bg-secondary)',
                color: viewMode === 'summary' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Layers size={16} /> รายงานตารางสรุป
            </button>
          </div>
        </div>

        {/* Datatable showing filtered results */}
        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* List selection table */}
          <div className="card no-print" style={{ padding: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
            <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
              รายการที่ค้นพบ ({filteredComputers.length} รายการ)
            </div>
            
            {filteredComputers.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertTriangle size={24} style={{ marginBottom: '0.5rem' }} />
                <p>ไม่พบรายการสินทรัพย์</p>
              </div>
            ) : (
              filteredComputers.map(c => {
                const isSelected = selectedCompId === c.id.toString();
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCompId(c.id.toString());
                      if (viewMode === 'summary') setViewMode('single'); // auto switch for better ux
                    }}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected && viewMode === 'single' ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        INV: {c.otherserial} | S/N: {c.serial}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: c.state.includes('Active') || c.state.includes('ใช้งาน') ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                      color: c.state.includes('Active') || c.state.includes('ใช้งาน') ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: 600
                    }}>
                      {c.state.split(' ')[0]}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Document Preview (Changes based on viewMode) */}
          <div>
            {viewMode === 'single' && selectedComputer && (
              <div>
                <div className="doc-preview-header no-print">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>📄 ตัวอย่างใบสเปกทรัพย์สินรายเครื่อง (Asset Sheet Preview)</h3>
                  <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <Printer size={16} /> พิมพ์ใบสเปกทรัพย์สิน
                  </button>
                </div>

                {/* Printable Document A4 (Single Spec Sheet) */}
                <div className="doc-preview-outer">
                  <div className="printable-document">
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '20px' }}>
                      <div>
                        <h2 style={{ fontSize: '16px', fontWeight: 700 }}>ใบรายละเอียดคอมพิวเตอร์และสเปกเครื่อง</h2>
                        <p style={{ fontSize: '11px', color: '#475569' }}>ทะเบียนประวัติทรัพย์สินฝ่ายสารสนเทศ (IT Asset Datasheet)</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '12px' }}><strong>เลขทะเบียนทรัพย์สิน:</strong> {selectedComputer.otherserial || 'N/A'}</p>
                        <p style={{ fontSize: '12px' }}><strong>ชื่อเครื่องคอมพิวเตอร์:</strong> {selectedComputer.name}</p>
                      </div>
                    </div>

                    {/* Section 1: Basic registration details */}
                    <div className="doc-section-title">1. ข้อมูลการลงทะเบียนทรัพย์สิน (Asset Inventory Registration)</div>
                    <table style={{ width: '100%' }} className="doc-table">
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', fontWeight: 700, backgroundColor: '#f8fafc' }}>รหัสสินทรัพย์ (Asset ID):</td>
                          <td style={{ width: '25%' }}>{selectedComputer.otherserial || 'N/A'}</td>
                          <td style={{ width: '25%', fontWeight: 700, backgroundColor: '#f8fafc' }}>ซีเรียลนัมเบอร์ (S/N):</td>
                          <td style={{ width: '25%' }}>{selectedComputer.serial || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>ยี่ห้อ (Manufacturer):</td>
                          <td>{selectedComputer.manufacturer || 'N/A'}</td>
                          <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>รุ่น (Model):</td>
                          <td>{selectedComputer.model || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>ผู้ถือครองหลัก (User):</td>
                          <td>{selectedComputer.username || 'ไม่มีผู้ถือครอง'}</td>
                          <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>สถานที่ติดตั้ง (Location):</td>
                          <td>{selectedComputer.location || 'ไม่ระบุสถานที่'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>สถานะการใช้งาน (State):</td>
                          <td>{selectedComputer.state || 'N/A'}</td>
                          <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>วันที่เริ่มบันทึกระบบ:</td>
                          <td>{selectedComputer.date_creation ? selectedComputer.date_creation.split('T')[0] : 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Section 2: Hardware specs */}
                    <div className="doc-section-title">2. ข้อมูลคุณลักษณะฮาร์ดแวร์หลัก (Hardware Specifications)</div>
                    <table style={{ width: '100%' }} className="doc-table">
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', fontWeight: 700, backgroundColor: '#f8fafc' }}>ระบบปฏิบัติการ (OS):</td>
                          <td colSpan="3" style={{ fontWeight: 600 }}>{selectedComputer.os || 'ไม่ระบุ'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>หน่วยประมวลผล (CPU):</td>
                          <td colSpan="3">{selectedComputer.cpu || 'ไม่ระบุ'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', fontWeight: 700, backgroundColor: '#f8fafc' }}>หน่วยความจำ (RAM):</td>
                          <td style={{ width: '25%' }}>{selectedComputer.ram || 'ไม่ระบุ'}</td>
                          <td style={{ width: '25%', fontWeight: 700, backgroundColor: '#f8fafc' }}>พื้นที่จัดเก็บข้อมูล (Disk):</td>
                          <td style={{ width: '25%' }}>{selectedComputer.storage || 'ไม่ระบุ'}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Section 3: Financial & Warranty info */}
                    <div className="doc-section-title">3. ข้อมูลการจัดซื้อและการรับประกัน (Procurement & Warranty)</div>
                    <table style={{ width: '100%' }} className="doc-table">
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', fontWeight: 700, backgroundColor: '#f8fafc' }}>วันที่เริ่มใช้งาน/จัดซื้อ:</td>
                          <td style={{ width: '25%' }}>{selectedComputer.purchase_date || 'ไม่ระบุ'}</td>
                          <td style={{ width: '25%', fontWeight: 700, backgroundColor: '#f8fafc' }}>ระยะเวลาการรับประกัน:</td>
                          <td style={{ width: '25%' }}>{selectedComputer.warranty || 'ไม่ระบุ'}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Section 4: Log comments */}
                    {selectedComputer.comment && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div className="doc-section-title">4. บันทึกและหมายเหตุเพิ่มเติม (Inventory Remarks)</div>
                        <div style={{ fontSize: '11.5px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc', fontStyle: 'italic', lineHeight: '1.5' }}>
                          {selectedComputer.comment}
                        </div>
                      </div>
                    )}

                    <div className="doc-terms" style={{ marginTop: 'auto' }}>
                      * ข้อมูลรายละเอียดนี้เป็นข้อมูลทางเทคนิคจริงที่ดึงโดยการสแกนระบบและข้อมูลทะเบียนสินทรัพย์ฝ่าย IT (GLPI 11) 
                      ใช้สำหรับตรวจสอบทรัพย์สินและจัดทำแผนการเปลี่ยนทดแทนอุปกรณ์ประจำปี
                    </div>

                    {/* Signatures */}
                    <div className="doc-signatures">
                      <div className="signature-box">
                        <span className="signature-text">ลงชื่อผู้ตรวจสอบข้อมูลทรัพย์สิน</span>
                        <div className="signature-line"></div>
                        <span className="signature-text">(........................................................)</span>
                        <span className="signature-text" style={{ fontSize: '11px', color: '#64748b' }}>ผู้จัดการส่วนข้อมูลทรัพย์สินไอที</span>
                      </div>

                      <div className="signature-box">
                        <span className="signature-text">ลงชื่อผู้อนุมัติตรวจรับเอกสาร</span>
                        <div className="signature-line"></div>
                        <span className="signature-text">(........................................................)</span>
                        <span className="signature-text" style={{ fontSize: '11px', color: '#64748b' }}>ผู้อำนวยการฝ่ายเทคโนโลยีสารสนเทศ</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {viewMode === 'summary' && (
              <div>
                <div className="doc-preview-header no-print">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>📄 ตัวอย่างรายงานตารางสรุปทรัพย์สิน (Summary Report Preview)</h3>
                  <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <Printer size={16} /> พิมพ์รายงานตารางทรัพย์สิน
                  </button>
                </div>

                {/* Printable Document A4 (Summary List Table) */}
                <div className="doc-preview-outer">
                  <div className="printable-document" style={{ width: '210mm', minHeight: '297mm' }}>
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '20px' }}>
                      <div>
                        <h2 style={{ fontSize: '16px', fontWeight: 700 }}>รายงานทะเบียนสรุปรายการทรัพย์สินคอมพิวเตอร์</h2>
                        <p style={{ fontSize: '11px', color: '#475569' }}>แสดงรายการทรัพย์สินตามเงื่อนไขการค้นหา/ตัวกรองในระบบบริหารจัดการ</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px' }}><strong>จำนวนที่พบ:</strong> {filteredComputers.length} เครื่อง</p>
                        <p style={{ fontSize: '11px' }}><strong>วันที่ออกรายงาน:</strong> {new Date().toISOString().split('T')[0]}</p>
                      </div>
                    </div>

                    <p style={{ fontSize: '11.5px', marginBottom: '1rem' }}>
                      <strong>เงื่อนไขการออกรายงาน:</strong> คีย์เวิร์ดค้นหา: "{searchTerm || '-'}" | ยี่ห้อ: "{brandFilter || 'ทุกยี่ห้อ'}" | สถานะ: "{statusFilter || 'ทุกสถานะ'}"
                    </p>

                    {/* Summary Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#f1f5f9', textAlign: 'center' }}>ลำดับ</th>
                          <th style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#f1f5f9' }}>ชื่อเครื่อง Hostname</th>
                          <th style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#f1f5f9' }}>เลขทรัพย์สิน (INV)</th>
                          <th style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#f1f5f9' }}>ซีเรียล (S/N)</th>
                          <th style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#f1f5f9' }}>ยี่ห้อ / รุ่น</th>
                          <th style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#f1f5f9' }}>ผู้ถือครอง</th>
                          <th style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#f1f5f9' }}>สถานที่ตั้ง</th>
                          <th style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#f1f5f9', textAlign: 'center' }}>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComputers.map((c, index) => (
                          <tr key={c.id}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 600 }}>{c.name}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{c.otherserial || '-'}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{c.serial || '-'}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{c.manufacturer} {c.model}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{c.username}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{c.location}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 600 }}>
                              {c.state.split(' ')[0]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="doc-terms" style={{ marginTop: 'auto', borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
                      * ทะเบียนสินทรัพย์นี้ถูกดึงแบบเรียลไทม์จากระบบ GLPI 11 สำหรับใช้ตรวจสอบสินทรัพย์คงคลังในรอบการตรวจสอบบัญชี
                    </div>

                    {/* Signatures */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '1.5rem', textAlign: 'center' }}>
                      <div className="signature-box">
                        <span className="signature-text" style={{ fontSize: '11px' }}>ผู้จัดทำรายงาน (Inventory Controller)</span>
                        <div className="signature-line" style={{ width: '70%', marginTop: '30px' }}></div>
                        <span className="signature-text" style={{ fontSize: '11px' }}>(........................................................)</span>
                      </div>
                      <div className="signature-box">
                        <span className="signature-text" style={{ fontSize: '11px' }}>ผู้อนุมัติรายงาน (IT Director)</span>
                        <div className="signature-line" style={{ width: '70%', marginTop: '30px' }}></div>
                        <span className="signature-text" style={{ fontSize: '11px' }}>(........................................................)</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
