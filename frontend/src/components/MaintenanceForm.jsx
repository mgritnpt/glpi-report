import React, { useState, useEffect } from 'react';
import { Printer, Info, Wrench, AlertTriangle } from 'lucide-react';

export default function MaintenanceForm({ computers, users }) {
  const [selectedCompId, setSelectedCompId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Document details
  const [documentNo, setDocumentNo] = useState(`INV-MTN-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`);
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 3 days from now
  );

  const [selectedComputer, setSelectedComputer] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Maintenance details
  const [maintenanceType, setMaintenanceType] = useState('Preventive Maintenance (PM)');
  const [urgency, setUrgency] = useState('ปกติ (Medium)');
  const [symptoms, setSymptoms] = useState('ตรวจเช็กสภาพเครื่องตามรอบการซ่อมบำรุงประจำปี และทำความสะอาดฝุ่นภายใน');
  
  // Backup Device State
  const [hasBackup, setHasBackup] = useState(false);
  const [backupDetails, setBackupDetails] = useState('');

  // Pre-maintenance Checklist
  const [checklist, setChecklist] = useState({
    powerOn: true,
    screenNormal: true,
    keyboardNormal: true,
    portsNormal: true,
    chargerNormal: true,
    bodyNormal: true
  });

  // Action log details
  const [actionLog, setActionLog] = useState('ดำเนินการเป่าฝุ่นขจัดสิ่งสกปรกภายในเครื่อง เปลี่ยนซิลิโคนระบายความร้อนใหม่ (Thermal Paste) และทดสอบความร้อน CPU ปกติ');
  const [replacedParts, setReplacedParts] = useState('ไม่มีการเปลี่ยนอะไหล่');
  const [maintenanceStatus, setMaintenanceStatus] = useState('ซ่อมบำรุงเสร็จสิ้น (Completed)');

  // Local print datetime state
  const [printDateTime, setPrintDateTime] = useState('');

  // Dynamically update print datetime on render/print request
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
      document.title = ""; // Temporarily clear document title
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

  // Sync computer and user objects when IDs change
  useEffect(() => {
    if (selectedCompId) {
      fetch(`/api/computers/${selectedCompId}`)
        .then(res => res.json())
        .then(data => {
          setSelectedComputer(data);
          // Auto select the user linked to this computer asset
          if (data && data.user_id) {
            setSelectedUserId(data.user_id.toString());
          }
        })
        .catch(err => {
          console.error(err);
          const found = computers.find(c => c.id === parseInt(selectedCompId));
          setSelectedComputer(found);
          if (found && found.user_id) {
            setSelectedUserId(found.user_id.toString());
          }
        });
    } else {
      setSelectedComputer(null);
    }
  }, [selectedCompId, computers]);

  useEffect(() => {
    if (selectedUserId) {
      const found = users.find(u => u.id === parseInt(selectedUserId));
      setSelectedUser(found);
    } else {
      setSelectedUser(null);
    }
  }, [selectedUserId, users]);

  // Set default items on load
  useEffect(() => {
    if (computers.length > 0 && !selectedCompId) {
      setSelectedCompId(computers[0].id.toString());
    }
  }, [computers]);

  const handleChecklistChange = (key) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="no-print" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>บันทึกการส่งซ่อมบำรุงคอมพิวเตอร์</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          จัดการรายละเอียดการเรียกเครื่องเข้ามาซ่อมบำรุง เช็กสภาพ และบันทึกประวัติการบำรุงรักษาในกระดาษ A4 หน้าหลัง (หน้าซ่อมบำรุงแยกเฉพาะ)
        </p>
      </div>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Form Controls */}
        <div className="card no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
          
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem', color: 'var(--primary)' }}>
              🛠️ ข้อมูลบันทึกส่งซ่อมบำรุง (Maintenance Record)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>เลขที่เอกสาร</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={documentNo} 
                  onChange={(e) => setDocumentNo(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>วันที่ส่งเครื่องซ่อม</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={documentDate} 
                  onChange={(e) => setDocumentDate(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>เลือกเครื่องคอมพิวเตอร์</label>
              <select 
                className="form-control" 
                value={selectedCompId} 
                onChange={(e) => setSelectedCompId(e.target.value)}
              >
                <option value="">-- เลือกเครื่องคอมพิวเตอร์ --</option>
                {computers.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.otherserial || c.serial}] {c.manufacturer} {c.model} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>ผู้ใช้งาน/ผู้ส่งซ่อม (ผูกกับคอมพิวเตอร์)</label>
              <select 
                className="form-control" 
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- เลือกพนักงาน --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.department})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>ประเภทงานซ่อม</label>
                <select 
                  className="form-control" 
                  value={maintenanceType} 
                  onChange={(e) => setMaintenanceType(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="Preventive Maintenance (PM)">ตรวจเช็กสภาพ (PM)</option>
                  <option value="Hardware Upgrade">อัปเกรดเครื่อง (RAM/SSD)</option>
                  <option value="Software Repair">แก้ไขซอฟต์แวร์/OS</option>
                  <option value="Hardware Repair">ซ่อมแซมฮาร์ดแวร์ชำรุด</option>
                  <option value="อื่นๆ (ระบุในอาการ)">อื่นๆ</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>ระดับความเร่งด่วน</label>
                <select 
                  className="form-control" 
                  value={urgency} 
                  onChange={(e) => setUrgency(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="ต่ำ (Low)">ต่ำ (Low)</option>
                  <option value="ปกติ (Medium)">ปกติ (Medium)</option>
                  <option value="สูง (High)">สูง (High)</option>
                  <option value="ด่วนที่สุด (Critical)">ด่วนที่สุด (Critical)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>อาการชำรุดเบื้องต้น / เหตุผลที่เรียกซ่อม</label>
              <textarea 
                className="form-control" 
                rows="2" 
                style={{ resize: 'none', fontSize: '0.8rem' }}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            {/* Backup Device Fields */}
            <div style={{ padding: '0.65rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', backgroundColor: 'var(--bg-tertiary)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  checked={hasBackup} 
                  onChange={(e) => setHasBackup(e.target.checked)} 
                />
                มีเครื่องสำรองให้ใช้งานระหว่างซ่อม (Backup Unit)
              </label>
              {hasBackup && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="ระบุรหัสทรัพย์สิน / Hostname ของเครื่องสำรอง"
                    value={backupDetails}
                    onChange={(e) => setBackupDetails(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                  />
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>
                🔍 สภาพตัวเครื่องก่อนการซ่อมบำรุง
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={checklist.powerOn} onChange={() => handleChecklistChange('powerOn')} />
                  เปิดบูตเครื่องได้ปกติ
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={checklist.screenNormal} onChange={() => handleChecklistChange('screenNormal')} />
                  จอแสดงผลปกติ (ไม่แตก)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={checklist.keyboardNormal} onChange={() => handleChecklistChange('keyboardNormal')} />
                  คีย์บอร์ด & ทัชแพดปกติ
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={checklist.portsNormal} onChange={() => handleChecklistChange('portsNormal')} />
                  พอร์ตเชื่อมต่อปกติ
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={checklist.chargerNormal} onChange={() => handleChecklistChange('chargerNormal')} />
                  สายชาร์จ/อะแดปเตอร์ปกติ
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={checklist.bodyNormal} onChange={() => handleChecklistChange('bodyNormal')} />
                  บอดี้ภายนอกปกติไม่มีรอยแตก
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem', color: 'var(--accent)' }}>
              ⚙️ บันทึกการดำเนินการโดยช่างไอที (IT Action Log)
            </h3>
            
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>บันทึกผลการดำเนินงานซ่อม / การแก้ไข</label>
              <textarea 
                className="form-control" 
                rows="2" 
                style={{ resize: 'none', fontSize: '0.8rem' }}
                value={actionLog}
                onChange={(e) => setActionLog(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>อะไหล่หรือชิ้นส่วนที่เปลี่ยน (ถ้ามี)</label>
              <input 
                type="text" 
                className="form-control" 
                value={replacedParts} 
                onChange={(e) => setReplacedParts(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>สถานะผลงานซ่อม</label>
                <select 
                  className="form-control" 
                  value={maintenanceStatus} 
                  onChange={(e) => setMaintenanceStatus(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="ซ่อมบำรุงเสร็จสิ้น (Completed)">เสร็จสิ้น (Completed)</option>
                  <option value="อยู่ระหว่างดำเนินการ / รออะไหล่ (In Progress)">อยู่ระหว่างดำเนินการ (In Progress)</option>
                  <option value="ส่งเคลมศูนย์บริการภายนอก (Outsource Claim)">ส่งเคลมภายนอก (Outsource)</option>
                  <option value="ชำรุดเกินซ่อม / จำหน่ายออก (Scrap)">จำหน่ายออก (Scrap)</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>วันที่คาดว่าจะแล้วเสร็จ</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={expectedDate} 
                  onChange={(e) => setExpectedDate(e.target.value)} 
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.7rem',
            display: 'flex',
            gap: '0.4rem',
            alignItems: 'flex-start'
          }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>ใบงานนี้ออกแบบเพื่อปริ้นท์ประกบหน้าหลังกับใบส่งมอบทรัพย์สิน โดยช่างไอทีจะกรอกข้อมูลตรวจเช็กและประวัติซ่อมบำรุงสำหรับเก็บในประวัติของสินทรัพย์ไอที</span>
          </div>
        </div>

        {/* Right Side: Document Preview & Action */}
        <div>
          <div className="doc-preview-header no-print" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>📄 บันทึกการส่งซ่อมบำรุง (Maintenance Record A4)</h3>
            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Printer size={16} /> พิมพ์ใบซ่อมบำรุง / Save PDF
            </button>
          </div>

          {/* A4 sheet */}
          <div className="doc-preview-outer">
            <div className="printable-document" id="maintenance-form-print-area" style={{ fontSize: '10.5px', lineHeight: '1.35', fontFamily: "'Sarabun', sans-serif" }}>
              
              {/* Header Letterhead */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '6px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Square Box for Logo */}
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
                  <h3 style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>ใบส่งซ่อมบำรุงและประวัติการซ่อม (IT Maintenance Record)</h3>
                  <p style={{ fontSize: '9.5px', margin: '1px 0 0 0' }}><strong>เลขที่เอกสาร:</strong> {documentNo} | <strong>วันที่ส่งเครื่อง:</strong> {documentDate}</p>
                </div>
              </div>

              {/* 1. Recipient Details Table */}
              <div className="doc-section-title" style={{ fontSize: '10.5px', marginBottom: '4px' }}>1. ข้อมูลผู้ใช้งานเครื่องและหน่วยงาน (Sender & Department Details)</div>
              <table style={{ width: '100%', marginBottom: '8px' }} className="doc-table">
                <tbody>
                  <tr>
                    <td style={{ width: '15%', fontWeight: 700, backgroundColor: '#f8fafc' }}>ชื่อ-นามสกุล:</td>
                    <td style={{ width: '35%' }}>{selectedUser ? selectedUser.name : '________________________'}</td>
                    <td style={{ width: '15%', fontWeight: 700, backgroundColor: '#f8fafc' }}>ตำแหน่ง:</td>
                    <td style={{ width: '35%' }}>{selectedUser ? selectedUser.title : '________________________'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>แผนก/ฝ่าย:</td>
                    <td>{selectedUser ? selectedUser.department : '________________________'}</td>
                    <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>เบอร์ติดต่อ:</td>
                    <td>{selectedUser ? selectedUser.phone : '________________________'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>อีเมล:</td>
                    <td colSpan="3">{selectedUser ? selectedUser.email : '________________________'}</td>
                  </tr>
                </tbody>
              </table>

              {/* 2. Computer Specifications Table */}
              <div className="doc-section-title" style={{ fontSize: '10.5px', marginBottom: '4px' }}>2. ข้อมูลอุปกรณ์และสภาพปัญหาเบื้องต้น (Equipment Details & Symptoms)</div>
              <table style={{ width: '100%', marginBottom: '8px' }} className="doc-table">
                <tbody>
                  <tr>
                    <td style={{ width: '18%', fontWeight: 700, backgroundColor: '#f8fafc' }}>รหัสทรัพย์สิน (INV):</td>
                    <td style={{ width: '32%' }}>{selectedComputer ? selectedComputer.otherserial : '________________________'}</td>
                    <td style={{ width: '18%', fontWeight: 700, backgroundColor: '#f8fafc' }}>ซีเรียลนัมเบอร์ (S/N):</td>
                    <td style={{ width: '32%' }}>{selectedComputer ? selectedComputer.serial : '________________________'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>ยี่ห้อ / รุ่น:</td>
                    <td>{selectedComputer ? `${selectedComputer.manufacturer} ${selectedComputer.model}` : '________________________'}</td>
                    <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>ชื่อเครื่อง (Hostname):</td>
                    <td>{selectedComputer ? selectedComputer.name : '________________________'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>ประเภทการซ่อม:</td>
                    <td><strong>{maintenanceType}</strong></td>
                    <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>ระดับความเร่งด่วน:</td>
                    <td><strong>{urgency}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>อาการชำรุดเบื้องต้น:</td>
                    <td colSpan="3" style={{ fontSize: '10px', height: '35px', verticalAlign: 'top', padding: '6px' }}>
                      {symptoms || '____________________________________________________________________________________________'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>เครื่องสำรองใช้งาน:</td>
                    <td colSpan="3">
                      {hasBackup ? `☑ มีเครื่องสำรองใช้งาน (Asset No./Hostname: ${backupDetails || 'ยังไม่ระบุข้อมูล'})` : '☐ ไม่มีเครื่องสำรองใช้งาน'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 3. Pre-maintenance Inspection checklist */}
              <div className="doc-section-title" style={{ fontSize: '10.5px', marginBottom: '4px' }}>3. ผลการตรวจสอบสภาพเครื่องและอุปกรณ์ต่อพ่วงก่อนการซ่อม (Pre-maintenance Inspection)</div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '6px 15px', 
                padding: '6px 10px', 
                border: '1px solid #cbd5e1', 
                borderRadius: '4px', 
                marginBottom: '8px', 
                fontSize: '10px', 
                backgroundColor: '#fafafa' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{checklist.powerOn ? '☑' : '☐'}</span> เครื่องเปิดติด บูตเข้า OS ได้ปกติ
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{checklist.screenNormal ? '☑' : '☐'}</span> จอภาพปกติ (ไม่แตก/ไม่ลาย)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{checklist.keyboardNormal ? '☑' : '☐'}</span> คีย์บอร์ด & ทัชแพดปกติ
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{checklist.portsNormal ? '☑' : '☐'}</span> พอร์ตเชื่อมต่อทำงานได้ปกติ
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{checklist.chargerNormal ? '☑' : '☐'}</span> สายชาร์จ & อะแดปเตอร์ปกติ
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{checklist.bodyNormal ? '☑' : '☐'}</span> โครงสร้างตัวเครื่องปกติ (ไม่แตกหัก)
                </div>
              </div>

              {/* 4. IT Technician Diagnosis & Action Log */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 10px', marginBottom: '8px', backgroundColor: '#fdfdfd' }}>
                <div style={{ fontWeight: 700, fontSize: '10.5px', color: 'var(--primary)', marginBottom: '3px', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
                  ⚙️ ส่วนที่ 1: บันทึกการดำเนินการโดยช่างเทคนิคไอที (IT Technician Action & Diagnosis Log)
                </div>
                
                <table style={{ width: '100%', marginBottom: '4px' }} className="doc-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '20%', fontWeight: 700, backgroundColor: '#f8fafc' }}>รายละเอียดการซ่อม:</td>
                      <td style={{ fontSize: '10px', height: '45px', verticalAlign: 'top', padding: '6px' }}>
                        {actionLog || '____________________________________________________________________________________________'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>รายการเปลี่ยนอะไหล่:</td>
                      <td style={{ fontSize: '10px' }}>
                        {replacedParts || 'ไม่มีการเปลี่ยนอะไหล่'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>สถานะการดำเนินการ:</td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{maintenanceStatus}</span> | <strong>วันที่เสร็จสิ้น / คาดว่าจะแล้วเสร็จ:</strong> {expectedDate}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 5. Terms & Policy */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 10px', backgroundColor: '#fdfdfd' }}>
                <div style={{ fontWeight: 700, fontSize: '10.5px', color: 'var(--accent)', marginBottom: '3px', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
                  📝 ข้อตกลงการรับบริการและตรวจสอบความถูกต้อง (Verification Agreement)
                </div>
                <div style={{ fontSize: '9px', color: '#475569', lineHeight: '1.4', marginBottom: '4px' }}>
                  1. ฝ่ายไอทีมีหน้าที่สำรองข้อมูลระบบปฏิบัติการ แต่ผู้ใช้งานจำเป็นต้องสำรองข้อมูลสำคัญในเครื่องก่อนดำเนินการซ่อมแซม ฝ่ายไอทีไม่รับผิดชอบกรณีข้อมูลส่วนบุคคลสูญหาย<br />
                  2. เมื่อซ่อมแซมเสร็จสิ้น ผู้ใช้งานมีหน้าที่ตรวจสอบสภาพเครื่อง อุปกรณ์ต่อพ่วงภายนอกทั้งหมด และข้อมูลร่วมกับช่างเทคนิคก่อนลงชื่อรับเครื่องคืน<br />
                  3. กรณีที่ต้องส่งเคลมภายนอกหรือรออะไหล่ ระยะเวลาจะขึ้นอยู่กับเงื่อนไขการรับประกันของผู้จัดจำหน่ายและบริษัทประกันคู่สัญญา
                </div>

                {/* 3 Signature Grid for Handover */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', marginTop: '6px' }}>
                  <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700 }}>ลงชื่อผู้ส่งเครื่องซ่อม (Submitted By)</span>
                    <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '18px auto 3px auto' }}></div>
                    <span style={{ fontSize: '8.5px' }}>({selectedUser ? selectedUser.name : '.........................................'})</span>
                    <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>ผู้ใช้งานผู้ส่งเครื่องซ่อมบำรุง</span>
                  </div>
                  
                  <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700 }}>ลงชื่อช่างผู้ดำเนินการ (Technician)</span>
                    <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '18px auto 3px auto' }}></div>
                    <span style={{ fontSize: '8.5px' }}>(........................................................)</span>
                    <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>ช่างผู้รับซ่อมบำรุงและแก้ไข</span>
                  </div>

                  <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700 }}>ลงชื่อผู้ส่งคืนเครื่อง (Returned By)</span>
                    <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '18px auto 3px auto' }}></div>
                    <span style={{ fontSize: '8.5px' }}>(........................................................)</span>
                    <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>ลงชื่อรับมอบเครื่องคืนหลังซ่อมเสร็จ</span>
                  </div>
                </div>
              </div>

              {/* Bottom Notice / Custom Footer */}
              <div style={{ 
                marginTop: '10px', 
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
          </div>
        </div>

      </div>
    </div>
  );
}
