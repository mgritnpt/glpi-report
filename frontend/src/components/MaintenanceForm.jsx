import React, { useState, useEffect } from 'react';
import { Printer, Info, Wrench, Search, Filter } from 'lucide-react';

export default function MaintenanceForm({ computers, users, entities = [] }) {
  const [selectedCompIds, setSelectedCompIds] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Entity selection for Document Number
  const entityOptions = entities.length > 0 ? entities : [
    { id: 1, name: 'BPK' },
    { id: 2, name: 'PPD' }
  ];
  const [selectedEntityId, setSelectedEntityId] = useState('');

  // Document details
  const [documentNo, setDocumentNo] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);

  // Filters for computers list
  const [filterSearch, setFilterSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');

  // Unique list of locations and entities from computer assets for filtering
  const locationsList = [...new Set(computers.map(c => c.location).filter(Boolean))].sort();
  const entitiesList = [...new Set(computers.map(c => c.entity_name).filter(Boolean))].sort();

  // Local print datetime state
  const [printDateTime, setPrintDateTime] = useState('');

  // Pre-maintenance Checklist State (Dynamic & Editable)
  const [hardwareItems, setHardwareItems] = useState([
    { id: 'powerOn', checked: true, text: 'เครื่องเปิดบูตระบบปฏิบัติการได้ปกติ (Power On & Boot)' },
    { id: 'screenNormal', checked: true, text: 'จอแสดงผลทำงานปกติ ไม่แตก ไม่เป็นเส้น (Display Normal)' },
    { id: 'keyboardNormal', checked: true, text: 'แป้นพิมพ์คีย์บอร์ด & ทัชแพดปกติ (Keyboard & Touchpad)' },
    { id: 'portsNormal', checked: true, text: 'พอร์ตเชื่อมต่อภายนอกทำงานปกติ (External I/O Ports)' },
    { id: 'chargerNormal', checked: true, text: 'สายชาร์จและอะแดปเตอร์จ่ายไฟปกติ (Power Adapter)' },
    { id: 'bodyNormal', checked: true, text: 'โครงสร้างตัวเครื่องภายนอกปกติ ไม่มีรอยชำรุดแตกหัก (Body & Case)' }
  ]);

  const [softwareItems, setSoftwareItems] = useState([
    { id: 'softwareAntivirus', checked: true, text: 'โปรแกรมป้องกันไวรัสทำงานปกติ (Antivirus Working)' },
    { id: 'softwareOSUpdate', checked: true, text: 'อัปเดตความปลอดภัยระบบปฏิบัติการ (Windows Update)' },
    { id: 'softwareFirewall', checked: true, text: 'เปิดใช้งานระบบความปลอดภัยไฟร์วอลล์ (Firewall Enabled)' },
    { id: 'softwareCleanup', checked: true, text: 'ทำความสะอาดข้อมูลขยะและไฟล์ชั่วคราว (System Cleanup)' },
    { id: 'softwareBrowser', checked: true, text: 'เว็บบราวเซอร์ปกติ ไม่มี Adware รบกวน (Web Browser Check)' },
    { id: 'softwareLicense', checked: true, text: 'ลิขสิทธิ์ซอฟต์แวร์และระบบถูกต้อง (License Activation)' }
  ]);

  const handleHardwareCheckedChange = (index) => {
    setHardwareItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], checked: !updated[index].checked };
      return updated;
    });
  };

  const handleHardwareTextChange = (index, newText) => {
    setHardwareItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], text: newText };
      return updated;
    });
  };

  const handleSoftwareCheckedChange = (index) => {
    setSoftwareItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], checked: !updated[index].checked };
      return updated;
    });
  };

  const handleSoftwareTextChange = (index, newText) => {
    setSoftwareItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], text: newText };
      return updated;
    });
  };

  const getHardwareChecked = (id) => hardwareItems.find(item => item.id === id)?.checked;
  const getHardwareText = (id) => hardwareItems.find(item => item.id === id)?.text;

  const getSoftwareChecked = (id) => softwareItems.find(item => item.id === id)?.checked;
  const getSoftwareText = (id) => softwareItems.find(item => item.id === id)?.text;

  // Set default Entity ID
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

  // Generate Document No prefix dynamically based on Entity and Planned Date
  useEffect(() => {
    if (selectedEntityId && documentDate) {
      const entity = entityOptions.find(e => e.id.toString() === selectedEntityId.toString());
      const prefix = entity ? getEntityPrefix(entity.name) : 'BPK';
      const yy = documentDate.substring(2, 4);
      const mm = documentDate.substring(5, 7);
      setDocumentNo(`${prefix}-${yy}${mm}-XXXXX`);
    }
  }, [selectedEntityId, documentDate, entities]);

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

  const handlePrint = () => {
    window.print();
  };

  const handleSelectComp = (id) => {
    setSelectedCompIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filter computers list dynamically based on filters
  const filteredComputers = computers.filter(c => {
    const searchMatch = !filterSearch || 
      c.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      c.serial.toLowerCase().includes(filterSearch.toLowerCase()) ||
      (c.otherserial && c.otherserial.toLowerCase().includes(filterSearch.toLowerCase())) ||
      (c.username && c.username.toLowerCase().includes(filterSearch.toLowerCase()));
      
    const locationMatch = filterLocation === 'all' || c.location === filterLocation;
    
    const entityMatch = filterEntity === 'all' || 
      c.entity_name === filterEntity || 
      c.entities_id.toString() === filterEntity;

    return searchMatch && locationMatch && entityMatch;
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
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>พิมพ์ใบบันทึกการซ่อมบำรุงคอมพิวเตอร์ (PM Checklist)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          ค้นหาและเลือกเครื่องคอมพิวเตอร์ที่ต้องการ เพื่อสั่งพิมพ์ใบบันทึกการตรวจสอบสภาพ Preventive Maintenance สำหรับลงพื้นที่ตรวจสอบด้วยตนเอง
        </p>
      </div>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Form Controls */}
        <div className="card no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
          
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem', color: 'var(--primary)' }}>
              🛠️ ข้อมูลบันทึกส่งซ่อมบำรุง (PM Config)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>วันที่วางแผน PM</label>
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
              <label style={{ fontSize: '0.8rem' }}>รูปแบบเลขที่เอกสาร</label>
              <input 
                type="text" 
                className="form-control" 
                value={documentNo} 
                readOnly
                style={{ backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed', fontWeight: 600, color: 'var(--primary)' }}
              />
            </div>

            {/* FILTERING COMPONENT PANEL */}
            <div style={{ 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '0.75rem', 
              backgroundColor: 'var(--bg-primary)', 
              marginBottom: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Filter size={14} /> คัดกรองเครื่องคอมพิวเตอร์ที่ต้องการตรวจเช็ก
              </span>
              
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="ค้นหาตามชื่อ/ซีเรียล/ผู้ใช้..."
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                  style={{ paddingLeft: '2rem', fontSize: '0.75rem', padding: '0.35rem 0.5rem 0.35rem 2rem' }}
                />
                <Search size={12} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <select 
                    className="form-control"
                    value={filterLocation}
                    onChange={e => setFilterLocation(e.target.value)}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: 'auto' }}
                  >
                    <option value="all">📍 ทุกสถานที่ (All Locations)</option>
                    {locationsList.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <select 
                    className="form-control"
                    value={filterEntity}
                    onChange={e => setFilterEntity(e.target.value)}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: 'auto' }}
                  >
                    <option value="all">🏢 ทุก Entity (All Entities)</option>
                    {entitiesList.map(ent => (
                      <option key={ent} value={ent}>{ent}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Multiselect List with Checkbox */}
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>เลือกคอมพิวเตอร์ที่ต้องการทำ PM ({selectedCompIds.length} เครื่อง)</span>
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

              <div style={{
                maxHeight: '220px',
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
                    ไม่พบข้อมูลคอมพิวเตอร์ตามเงื่อนไขการค้นหา
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
              <label style={{ fontSize: '0.8rem' }}>ผู้ตรวจรับรองเครื่อง (ใช้กรณี Override พนักงานบางคน)</label>
              <select 
                className="form-control" 
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- ดึงจากเจ้าของทรัพย์สินในระบบ GLPI โดยอัตโนมัติ --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Checklist Grid Split into Hardware and Software */}
            <div className="form-group" style={{ marginBottom: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
              <label style={{ fontSize: '0.825rem', marginBottom: '0.5rem', display: 'block', fontWeight: 700, color: 'var(--primary)' }}>
                🔍 รายการตรวจเช็กสำหรับออกรายงาน (PM Items Checklist)
              </label>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                ติ๊กถูกหน้ารายการที่ต้องการให้แสดงบนเอกสารพิมพ์ และสามารถพิมพ์แก้ไขข้อความรายละเอียดที่จะแสดงได้ตามใจชอบ
              </p>
              
              {/* Hardware checklist controls */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>🔌 ฮาร์ดแวร์และอุปกรณ์ภายนอก</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {hardwareItems.map((item, index) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={item.checked} 
                        onChange={() => handleHardwareCheckedChange(index)} 
                        style={{ cursor: 'pointer' }}
                      />
                      <input 
                        type="text" 
                        className="form-control"
                        value={item.text}
                        onChange={(e) => handleHardwareTextChange(index, e.target.value)}
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.2rem 0.5rem', 
                          height: 'auto',
                          border: item.checked ? '1px solid var(--border)' : '1px solid transparent',
                          backgroundColor: item.checked ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                          color: item.checked ? 'var(--text-primary)' : 'var(--text-muted)',
                          textDecoration: item.checked ? 'none' : 'line-through'
                        }}
                        disabled={!item.checked}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Software checklist controls */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>💾 ซอฟต์แวร์และระบบปฏิบัติการ</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {softwareItems.map((item, index) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={item.checked} 
                        onChange={() => handleSoftwareCheckedChange(index)} 
                        style={{ cursor: 'pointer' }}
                      />
                      <input 
                        type="text" 
                        className="form-control"
                        value={item.text}
                        onChange={(e) => handleSoftwareTextChange(index, e.target.value)}
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.2rem 0.5rem', 
                          height: 'auto',
                          border: item.checked ? '1px solid var(--border)' : '1px solid transparent',
                          backgroundColor: item.checked ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                          color: item.checked ? 'var(--text-primary)' : 'var(--text-muted)',
                          textDecoration: item.checked ? 'none' : 'line-through'
                        }}
                        disabled={!item.checked}
                      />
                    </div>
                  ))}
                </div>
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
            <span>ติ๊กเครื่องที่คุณต้องการจัดทำใบบันทึกการซ่อมบำรุง (PM Checklist) ด้านซ้าย จากนั้นกดสั่งพิมพ์เพื่อดาวน์โหลดเอกสารสำหรับนำไปตรวจสภาพคอมพิวเตอร์ทีละเครื่องได้เลยครับ</span>
          </div>
        </div>

        {/* Right Side: Document Preview & Action */}
        <div>
          <div className="doc-preview-header no-print" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>📄 บันทึกการส่งซ่อมบำรุง ({selectedCompIds.length} แผ่น)</h3>
            <button 
              onClick={handlePrint} 
              disabled={selectedCompIds.length === 0}
              className="btn btn-primary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
            >
              <Printer size={16} /> พิมพ์ใบบันทึก PM
            </button>
          </div>

          {/* A4 sheet preview wrapper */}
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
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>เลือกเครื่องที่แถบด้านซ้ายมือเพื่อเรนเดอร์เอกสาร PM สำหรับเตรียมปริ้นท์</p>
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
                    name: computer.username || 'ไม่มีผู้ถือครอง (ส่วนกลาง)',
                    title: 'พนักงาน',
                    department: computer.user_dept || 'สำนักงานใหญ่/ฝ่ายกลาง',
                    phone: 'N/A',
                    email: 'N/A'
                  };
                }

                // Document number format (Entity + YYMM + Asset ID 5 Digit)
                const cleanPrefix = selectedEntityId ? getEntityPrefix(entityOptions.find(e => e.id.toString() === selectedEntityId.toString())?.name) : 'BPK';
                const yy = documentDate.substring(2, 4);
                const mm = documentDate.substring(5, 7);
                const assetIdStr = String(computer.id).padStart(5, '0');
                const pageDocNo = `${cleanPrefix}-${yy}${mm}-${assetIdStr}`;

                const isLast = index === selectedComputersData.length - 1;

                return (
                  <div 
                    key={computer.id} 
                    className="printable-document" 
                    id="maintenance-form-print-area" 
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '6px', marginBottom: '10px' }}>
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
                        <h3 style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>ใบบันทึกการซ่อมบำรุงเครื่องคอมพิวเตอร์ (Preventive Maintenance)</h3>
                        <p style={{ fontSize: '9.5px', margin: '1px 0 0 0' }}><strong>เลขที่เอกสาร:</strong> {pageDocNo} | <strong>วันที่ตรวจเช็ก:</strong> {documentDate}</p>
                      </div>
                    </div>

                    {/* 1. Recipient Details */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '10.5px', color: '#000', marginBottom: '3px', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                        1. ข้อมูลผู้ใช้งานเครื่องคอมพิวเตอร์ (User Details)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '4px 15px', padding: '2px 4px' }}>
                        <div><strong>ชื่อ-นามสกุลผู้ใช้:</strong> {docUser.name}</div>
                        <div><strong>แผนก/ฝ่าย:</strong> {docUser.department}</div>
                        <div><strong>ตำแหน่ง:</strong> {docUser.title || 'พนักงาน'}</div>
                        <div><strong>เบอร์ติดต่อ:</strong> {docUser.phone || 'N/A'}</div>
                        <div style={{ gridColumn: 'span 2' }}><strong>อีเมล:</strong> {docUser.email || 'N/A'}</div>
                      </div>
                    </div>

                    {/* 2. Computer Specifications */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontWeight: 700, fontSize: '10.5px', color: '#000', marginBottom: '3px', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                        2. ข้อมูลทรัพย์สินคอมพิวเตอร์ (Computer Specs & Asset Info)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '2px 4px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: '4px 15px' }}>
                          <div><strong>ชื่อเครื่อง (Hostname):</strong> {computer.name}</div>
                          <div><strong>ยี่ห้อ / รุ่น (Brand & Model):</strong> {computer.manufacturer} {computer.model}</div>
                          <div><strong>รหัสทรัพย์สิน (Inventory No.):</strong> {computer.otherserial || 'N/A'}</div>
                          <div><strong>หมายเลขซีเรียล (Serial Number):</strong> {computer.serial}</div>
                        </div>
                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '4px', marginTop: '2px' }}>
                          <strong>สถานที่วางอุปกรณ์ (Location):</strong> {computer.location || 'ไม่ระบุสถานที่'}
                        </div>
                      </div>
                    </div>

                    {/* 3. Inspection checklist (Rendered dynamically based on checked items on web form, printed as empty checkboxes ☐) */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontWeight: 700, fontSize: '10.5px', color: '#000', marginBottom: '4px', borderBottom: '1.5px solid #000', paddingBottom: '2px' }}>
                        3. รายการตรวจเช็กและบำรุงรักษาอุปกรณ์ (Preventive Maintenance Checklist)
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        
                        {/* Hardware */}
                        <div style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#fdfdfd' }}>
                          <div style={{ fontWeight: 700, fontSize: '9.5px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: 'var(--primary)' }}>
                            🔌 ตรวจเช็กฮาร์ดแวร์และอุปกรณ์ภายนอก (Hardware Checklist)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9.5px' }}>
                            {getHardwareChecked('powerOn') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getHardwareText('powerOn')}</span>
                              </div>
                            )}
                            {getHardwareChecked('screenNormal') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getHardwareText('screenNormal')}</span>
                              </div>
                            )}
                            {getHardwareChecked('keyboardNormal') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getHardwareText('keyboardNormal')}</span>
                              </div>
                            )}
                            {getHardwareChecked('portsNormal') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getHardwareText('portsNormal')}</span>
                              </div>
                            )}
                            {getHardwareChecked('chargerNormal') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getHardwareText('chargerNormal')}</span>
                              </div>
                            )}
                            {getHardwareChecked('bodyNormal') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getHardwareText('bodyNormal')}</span>
                              </div>
                            )}
                            {!hardwareItems.some(item => item.checked) && (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>ไม่ได้เลือกรายการฮาร์ดแวร์</span>
                            )}
                          </div>
                        </div>

                        {/* Software */}
                        <div style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#fdfdfd' }}>
                          <div style={{ fontWeight: 700, fontSize: '9.5px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#059669' }}>
                            💾 ตรวจเช็กระบบและซอฟต์แวร์ (Software Checklist)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9.5px' }}>
                            {getSoftwareChecked('softwareAntivirus') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getSoftwareText('softwareAntivirus')}</span>
                              </div>
                            )}
                            {getSoftwareChecked('softwareOSUpdate') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getSoftwareText('softwareOSUpdate')}</span>
                              </div>
                            )}
                            {getSoftwareChecked('softwareFirewall') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getSoftwareText('softwareFirewall')}</span>
                              </div>
                            )}
                            {getSoftwareChecked('softwareCleanup') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getSoftwareText('softwareCleanup')}</span>
                              </div>
                            )}
                            {getSoftwareChecked('softwareBrowser') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getSoftwareText('softwareBrowser')}</span>
                              </div>
                            )}
                            {getSoftwareChecked('softwareLicense') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>☐</span>
                                <span>{getSoftwareText('softwareLicense')}</span>
                              </div>
                            )}
                            {!softwareItems.some(item => item.checked) && (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>ไม่ได้เลือกรายการซอฟต์แวร์</span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* 4. Notes Section for manual writing */}
                    <div style={{ 
                      border: '1px dashed #cbd5e1', 
                      borderRadius: '4px', 
                      padding: '8px 12px', 
                      marginBottom: '15px', 
                      fontSize: '9.5px', 
                      backgroundColor: '#fafafa' 
                    }}>
                      <strong>บันทึกผลการดำเนินการ / ข้อเสนอแนะเพิ่มเติม (Technician Notes):</strong>
                      <div style={{ height: '35px', borderBottom: '1px dotted #cbd5e1', marginTop: '10px' }}></div>
                      <div style={{ height: '25px', borderBottom: '1px dotted #cbd5e1', marginTop: '10px' }}></div>
                    </div>

                    {/* 5. Signature Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center', marginTop: '10px' }}>
                      <div className="signature-box" style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700 }}>ลงชื่อผู้ตรวจเช็ก (IT Technician)</span>
                        <div style={{ width: '80%', borderBottom: '1px dotted #000', margin: '22px auto 4px auto' }}></div>
                        <span style={{ fontSize: '8.5px' }}>(........................................................)</span>
                        <span style={{ fontSize: '7.5px', color: '#555', display: 'block', marginTop: '1px' }}>เจ้าหน้าที่ฝ่าย IT Support</span>
                      </div>
                      
                      <div className="signature-box" style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700 }}>ลงชื่อผู้รับรองการตรวจเช็ก (Computer User)</span>
                        <div style={{ width: '80%', borderBottom: '1px dotted #000', margin: '22px auto 4px auto' }}></div>
                        <span style={{ fontSize: '8.5px' }}>({docUser.name})</span>
                        <span style={{ fontSize: '7.5px', color: '#555', display: 'block', marginTop: '1px' }}>พนักงานผู้ถือครองเครื่อง</span>
                      </div>

                      <div className="signature-box" style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700 }}>ลงชื่อผู้ตรวจสอบ/พยาน (Witness/Manager)</span>
                        <div style={{ width: '80%', borderBottom: '1px dotted #000', margin: '22px auto 4px auto' }}></div>
                        <span style={{ fontSize: '8.5px' }}>(........................................................)</span>
                        <span style={{ fontSize: '7.5px', color: '#555', display: 'block', marginTop: '1px' }}>พยาน / หัวหน้างานต้นสังกัด</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ 
                      marginTop: '15px', 
                      borderTop: '1px solid #000', 
                      paddingTop: '4px', 
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '8px', 
                      color: '#444' 
                    }}>
                      <span>* เอกสารตรวจเช็ก Preventive Maintenance นี้ ถูกสร้างผ่านระบบบริหารจัดการทะเบียนสินทรัพย์ GLPI 11 *</span>
                      <span style={{ fontStyle: 'italic', fontWeight: 600 }}>พิมพ์เมื่อ: {printDateTime} น.</span>
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
