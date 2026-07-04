import React, { useState, useEffect } from 'react';
import { Printer, Info } from 'lucide-react';

export default function ReceivingForm({ computers, users }) {
  const [selectedCompId, setSelectedCompId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Custom accessories list
  const [accessories, setAccessories] = useState({
    mouse: true,
    keyboard: true,
    charger: true,
    bag: true,
    headset: false,
    other: ''
  });

  // Mouse Type selection: "USB Mouse" or "Wireless Mouse"
  const [mouseType, setMouseType] = useState('USB Mouse');

  const [documentNo, setDocumentNo] = useState(`INV-RCV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`);
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('อุปกรณ์ผ่านการทดสอบสภาพการทำงานปกติ 100%');
  const [selectedComputer, setSelectedComputer] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Return details state
  const [returnDate, setReturnDate] = useState('');
  const [returnReason, setReturnReason] = useState('ไม่ได้ส่งคืน / อยู่ระหว่างการใช้งาน');
  const [returnRemarks, setReturnRemarks] = useState('');

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
      document.title = ""; // Temporarily clear document title so it won't print in browser header
    };
    const handleAfterPrint = () => {
      document.title = "GLPI 11 Report System"; // Restore it after print window closes
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

  const handleCheckboxChange = (key) => {
    setAccessories(prev => ({
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
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>ใบรับมอบและส่งคืนทรัพย์สิน</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          จัดการรายละเอียดการส่งมอบคอมพิวเตอร์ และบันทึกประวัติการส่งคืนทรัพย์สินในหน้ากระดาษ A4 หน้าเดียวแบบครบวงจร
        </p>
      </div>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Form Controls */}
        <div className="card no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
          
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem', color: 'var(--primary)' }}>
              📥 ข้อมูลส่งมอบอุปกรณ์ (Handover)
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
                <label style={{ fontSize: '0.8rem' }}>วันที่ทำเอกสาร</label>
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
              <label style={{ fontSize: '0.8rem' }}>ผู้รับมอบอุปกรณ์ (ผูกกับคอมพิวเตอร์ที่เลือก)</label>
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                *ระบบจะเลือกพนักงานที่ผูกกับเครื่องคอมพิวเตอร์ที่เลือกนี้ให้อัตโนมัติ
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', marginBottom: '0.4rem', display: 'block' }}>อุปกรณ์เสริมที่ส่งมอบ</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={accessories.mouse} onChange={() => handleCheckboxChange('mouse')} />
                  เมาส์ (Mouse)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={accessories.keyboard} onChange={() => handleCheckboxChange('keyboard')} />
                  คีย์บอร์ด (Keyboard)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={accessories.charger} onChange={() => handleCheckboxChange('charger')} />
                  สายชาร์จ (Adapter)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={accessories.bag} onChange={() => handleCheckboxChange('bag')} />
                  กระเป๋า (Bag)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', gridColumn: 'span 2' }}>
                  <input type="checkbox" checked={accessories.headset} onChange={() => handleCheckboxChange('headset')} />
                  หูฟังบริษัท (Headset)
                </label>
              </div>

              {/* Sub selection for Mouse type */}
              {accessories.mouse && (
                <div style={{ margin: '0.4rem 0 0.4rem 0.5rem', padding: '0.4rem', borderLeft: '2px solid var(--primary)', display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="mouseType" 
                      value="USB Mouse" 
                      checked={mouseType === 'USB Mouse'} 
                      onChange={(e) => setMouseType(e.target.value)} 
                    />
                    USB Mouse
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="mouseType" 
                      value="Wireless Mouse" 
                      checked={mouseType === 'Wireless Mouse'} 
                      onChange={(e) => setMouseType(e.target.value)} 
                    />
                    Wireless Mouse
                  </label>
                </div>
              )}

              <input 
                type="text" 
                className="form-control" 
                placeholder="อุปกรณ์อื่นๆ..."
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

          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem', color: 'var(--accent)' }}>
              📤 ข้อมูลการรับคืนอุปกรณ์ (Return)
            </h3>
            
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>วันที่ส่งคืนอุปกรณ์</label>
              <input 
                type="date" 
                className="form-control" 
                value={returnDate} 
                onChange={(e) => setReturnDate(e.target.value)} 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>เหตุผลในการส่งคืน</label>
              <select 
                className="form-control" 
                value={returnReason} 
                onChange={(e) => setReturnReason(e.target.value)}
              >
                <option value="ไม่ได้ส่งคืน / อยู่ระหว่างการใช้งาน">ไม่ได้ส่งคืน / อยู่ระหว่างการใช้งาน</option>
                <option value="ลาออกจากบริษัท (Resignation)">ลาออกจากบริษัท (Resignation)</option>
                <option value="เปลี่ยน/อัปเกรดเครื่องใหม่ (Upgrade)">เปลี่ยน/อัปเกรดเครื่องใหม่ (Upgrade)</option>
                <option value="อุปกรณ์ชำรุด/ส่งซ่อม (Damaged/Repair)">อุปกรณ์ชำรุด/ส่งซ่อม (Damaged/Repair)</option>
                <option value="อื่นๆ (ระบุในหมายเหตุ)">อื่นๆ (ระบุในหมายเหตุ)</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem' }}>หมายเหตุการรับคืน</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="เช่น สายชาร์จชำรุด, แบตเสื่อม, ริ้วรอยรอบเครื่อง"
                value={returnRemarks}
                onChange={(e) => setReturnRemarks(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              />
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
            <span>ฟอร์มนี้รวมประวัติการส่งมอบและรับคืนในแผ่นเดียวพื่อลดการใช้กระดาษและสะดวกในการจัดเก็บประวัติคอมพิวเตอร์</span>
          </div>
        </div>

        {/* Right Side: Document Preview & Action */}
        <div>
          <div className="doc-preview-header no-print" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>📄 ใบรับมอบ-ส่งคืน A4 (1 Page)</h3>
            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Printer size={16} /> พิมพ์รายงาน / Save PDF
            </button>
          </div>

          {/* A4 sheet */}
          <div className="doc-preview-outer">
            <div className="printable-document" id="receiving-form-print-area" style={{ fontSize: '10.5px', lineHeight: '1.35', fontFamily: "'Sarabun', sans-serif" }}>
              
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
                  <h3 style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>ใบรับมอบ - ส่งคืนอุปกรณ์คอมพิวเตอร์</h3>
                  <p style={{ fontSize: '9.5px', margin: '1px 0 0 0' }}><strong>เลขที่เอกสาร:</strong> {documentNo} | <strong>วันที่:</strong> {documentDate}</p>
                </div>
              </div>

              {/* 1. Recipient Details Table */}
              <div className="doc-section-title" style={{ fontSize: '10.5px', marginBottom: '4px' }}>1. ข้อมูลผู้รับมอบ / ผู้ส่งคืน อุปกรณ์ (Equipment Recipient / Returner Detail)</div>
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
              <div className="doc-section-title" style={{ fontSize: '10.5px', marginBottom: '4px' }}>2. ข้อมูลเครื่องคอมพิวเตอร์หลัก (Computer Specifications)</div>
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
                    <td style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>รายละเอียดสเปก:</td>
                    <td colSpan="3" style={{ fontSize: '10.5px' }}>
                      {selectedComputer ? (
                        <span><strong>OS:</strong> {selectedComputer.os} | <strong>CPU:</strong> {selectedComputer.cpu} | <strong>RAM:</strong> {selectedComputer.ram} | <strong>Storage:</strong> {selectedComputer.storage}</span>
                      ) : (
                        '____________________________________________________________________________________________'
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 3. Accessories Details Grid (2 Columns, 3 Rows) */}
              <div className="doc-section-title" style={{ fontSize: '10.5px', marginBottom: '4px' }}>3. อุปกรณ์เสริมพ่วงประกอบที่ส่งมอบ (Accessories Handed Over)</div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '4px 20px', 
                padding: '6px 10px', 
                border: '1px solid #cbd5e1', 
                borderRadius: '4px', 
                marginBottom: '8px', 
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

              {/* Part 1: Handover */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 10px', marginBottom: '8px', backgroundColor: '#fdfdfd' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', marginTop: '6px' }}>
                  <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อผู้รับมอบ (Received By)</span>
                    <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '18px auto 3px auto' }}></div>
                    <span style={{ fontSize: '9px' }}>({selectedUser ? selectedUser.name : '.........................................'})</span>
                    <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>พนักงานผู้รับมอบอุปกรณ์</span>
                  </div>
                  
                  <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อผู้ส่งมอบ (Handed Over By)</span>
                    <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '18px auto 3px auto' }}></div>
                    <span style={{ fontSize: '9px' }}>(........................................................)</span>
                    <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>เจ้าหน้าที่ฝ่าย IT Support</span>
                  </div>

                  <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อพยาน (Witness/Manager)</span>
                    <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '18px auto 3px auto' }}></div>
                    <span style={{ fontSize: '9px' }}>(........................................................)</span>
                    <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>พยาน / หัวหน้างานต้นสังกัด</span>
                  </div>
                </div>
              </div>

              {/* Part 2: Return */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 10px', backgroundColor: '#fdfdfd' }}>
                <div style={{ fontWeight: 700, fontSize: '10.5px', color: 'var(--accent)', marginBottom: '3px', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
                  🔄 ส่วนที่ 2: บันทึกการส่งคืนและรับคืนสินทรัพย์ (IT Asset Return Record)
                </div>
                
                {/* Return Details Grid with Checkboxes for Reason and Condition */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '6px', padding: '6px 8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '3px', fontSize: '9.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px 15px' }}>
                    <div><strong>วันที่ส่งคืน:</strong> {returnDate ? returnDate : '_____/_____/________'}</div>
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
                  {returnRemarks && <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '4px', marginTop: '2px', width: '100%' }}><strong>หมายเหตุการรับคืน:</strong> {returnRemarks}</div>}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', marginTop: '4px' }}>
                  <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อผู้ส่งคืน (Returned By)</span>
                    <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '18px auto 3px auto' }}></div>
                    <span style={{ fontSize: '9px' }}>({selectedUser ? selectedUser.name : '.........................................'})</span>
                    <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>พนักงานผู้ส่งคืนอุปกรณ์</span>
                  </div>
                  
                  <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อผู้รับคืน (Received Back By)</span>
                    <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '18px auto 3px auto' }}></div>
                    <span style={{ fontSize: '9px' }}>(........................................................)</span>
                    <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>เจ้าหน้าที่ฝ่าย IT Support</span>
                  </div>

                  <div className="signature-box" style={{ border: '1px solid #f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '9.5px', fontWeight: 700 }}>ลงชื่อพยาน (Witness/Manager)</span>
                    <div style={{ width: '80%', borderBottom: '1px dotted #94a3b8', margin: '18px auto 3px auto' }}></div>
                    <span style={{ fontSize: '9px' }}>(........................................................)</span>
                    <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>พยาน / หัวหน้างานต้นสังกัด</span>
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
