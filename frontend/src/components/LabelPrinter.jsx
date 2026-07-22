import React, { useState } from 'react';
import { Printer, Search, Check, Settings, LayoutGrid, AlignLeft, Tag, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function LabelPrinter({ computers }) {
  // Search & Filtering State (similar to other report pages)
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Printer Label Size Config (Standard Honeywell PC42T sizes)
  const [labelWidth, setLabelWidth] = useState(80); // width in mm
  const [labelHeight, setLabelHeight] = useState(50); // height in mm
  
  // Custom design configurations
  const [fontSize, setFontSize] = useState(10); // font size in px
  const [showBorder, setShowBorder] = useState(true);
  const [showQrCode, setShowQrCode] = useState(true);
  const [glpiBaseUrl, setGlpiBaseUrl] = useState('http://192.168.1.100/front/computer.form.php?id=');
  const [qrSize, setQrSize] = useState(22); // QR Code size in px (Default 22px is ~37% smaller than previous 35px)

  // Unique list of brands and statuses for dropdown filters
  const brands = Array.from(new Set(computers.map(c => c.manufacturer).filter(Boolean)));
  const statuses = Array.from(new Set(computers.map(c => c.state).filter(Boolean)));

  // Filter computers based on Search, Brand, and Status
  const filteredComputers = computers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.serial.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.otherserial.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.username && c.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBrand = brandFilter === '' ? true : c.manufacturer.toLowerCase().includes(brandFilter.toLowerCase());
    const matchesStatus = statusFilter === '' ? true : c.state.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesBrand && matchesStatus;
  });

  // Toggle selection
  const handleSelectToggle = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Select all / Deselect all visible
  const handleSelectAllVisible = () => {
    const visibleIds = filteredComputers.map(c => c.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Quick preset sizes
  const applyPreset = (width, height) => {
    setLabelWidth(width);
    setLabelHeight(height);
  };

  // Print function (Native Browser Print - can save as PDF or print directly)
  const handlePrint = () => {
    window.print();
  };

  const selectedComputers = computers.filter(c => selectedIds.includes(c.id));

  // Helper to determine the QR Code value (points to GLPI Asset Computer details)
  const getQrValue = (computer) => {
    const base = glpiBaseUrl.replace(/\s+/g, '') || 'http://192.168.1.100/front/computer.form.php?id=';
    return `${base}${computer.id}`;
  };

  return (
    <div style={{ fontFamily: "'Outfit', 'Sarabun', sans-serif" }}>
      
      {/* CSS Rules for Screen Hiding and Printing Configuration */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Hide printable area on screen */
        .print-only-labels-area {
          display: none;
        }

        @media print {
          /* Hide all non-printable UI components */
          .sidebar, .no-print, header, nav, aside, .card, .btn {
            display: none !important;
          }
          
          /* Reset container layouts */
          body, .main-content, .app-container {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
            height: auto !important;
            display: block !important;
            position: static !important;
            box-shadow: none !important;
          }

          /* Show the labels container */
          .print-only-labels-area {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Force browser page sizing to exact label dimensions */
          @page {
            size: ${labelWidth}mm ${labelHeight}mm;
            margin: 0 !important;
          }

          /* Design formatting for each individual sticker page */
          .printable-sticker-page {
            page-break-after: always;
            break-after: page;
            box-sizing: border-box;
            width: ${labelWidth}mm !important;
            height: ${labelHeight}mm !important;
            padding: 3mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: ${showBorder ? '0.5px solid #000000' : 'none'} !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            overflow: hidden !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="no-print" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>พิมพ์สติ๊กเกอร์ทรัพย์สิน (Asset Label Printer)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          พิมพ์สติ๊กเกอร์ติดทรัพย์สินคอมพิวเตอร์พร้อม **Nippon Paint Logo** และ **QR Code** ดึงข้อมูลตรงจากระบบ ส่งออกผ่านคำสั่งพิมพ์เพื่อพิมพ์ตรงออกเครื่องหรือเซฟเป็นไฟล์ PDF
        </p>
      </div>

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Step 1: Select Computers with Filters */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutGrid size={18} color="var(--primary)" />
              <span>1. เลือกคอมพิวเตอร์ที่ต้องการ ({selectedIds.length} เครื่อง)</span>
            </h3>
            <button 
              onClick={handleSelectAllVisible}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              {filteredComputers.every(c => selectedIds.includes(c.id)) ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมดที่แสดง'}
            </button>
          </div>

          {/* Filtering Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%' }}>
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '180px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="ค้นหาตามชื่อ, ซีเรียล, รหัสทรัพย์สิน..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ width: '130px' }}>
              <select 
                className="form-control"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="">-- ยี่ห้อทั้งหมด --</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div style={{ width: '130px' }}>
              <select 
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="">-- สถานะทั้งหมด --</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Table List */}
          <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.5rem', width: '40px', textAlign: 'center' }}>เลือก</th>
                  <th style={{ padding: '0.5rem' }}>ชื่อคอมพิวเตอร์</th>
                  <th style={{ padding: '0.5rem' }}>ยี่ห้อ/รุ่น</th>
                  <th style={{ padding: '0.5rem' }}>รหัสทรัพย์สิน (INV)</th>
                  <th style={{ padding: '0.5rem' }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredComputers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>ไม่พบข้อมูลคอมพิวเตอร์ที่ตรงตามเงื่อนไข</td>
                  </tr>
                ) : (
                  filteredComputers.map(c => {
                    const isSelected = selectedIds.includes(c.id);
                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => handleSelectToggle(c.id)}
                        style={{ 
                          borderBottom: '1px solid var(--border)', 
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent' 
                        }}
                        className="table-row-hover"
                      >
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <div style={{ 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '4px', 
                            border: isSelected ? '2px solid var(--primary)' : '2px solid var(--text-muted)',
                            backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                          }}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{c.name}</td>
                        <td style={{ padding: '0.5rem' }}>{c.manufacturer} / {c.model}</td>
                        <td style={{ padding: '0.5rem' }}>{c.otherserial || '-'}</td>
                        <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{c.state}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 2: Configure Label & Print Options */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <Settings size={18} color="var(--primary)" />
            <span>2. ตั้งค่าขนาดสติ๊กเกอร์ & การสั่งปริ้น</span>
          </h3>

          {/* Size presets */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              ขนาดสติ๊กเกอร์ (Presets)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => applyPreset(80, 50)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>80 x 50 mm (มาตรฐาน)</button>
              <button onClick={() => applyPreset(100, 50)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>100 x 50 mm (ยาว)</button>
              <button onClick={() => applyPreset(50, 30)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>50 x 30 mm (เล็ก)</button>
            </div>
          </div>

          {/* Size inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                ความกว้างสติ๊กเกอร์ (Width - mm)
              </label>
              <input 
                type="number" 
                className="form-control" 
                value={labelWidth} 
                onChange={(e) => setLabelWidth(parseInt(e.target.value) || 80)} 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                ความสูงสติ๊กเกอร์ (Height - mm)
              </label>
              <input 
                type="number" 
                className="form-control" 
                value={labelHeight} 
                onChange={(e) => setLabelHeight(parseInt(e.target.value) || 50)} 
              />
            </div>
          </div>

          {/* Design settings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                ขนาดตัวอักษร (px)
              </label>
              <input 
                type="number" 
                className="form-control" 
                value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value) || 10)} 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                ขนาด QR Code (px)
              </label>
              <input 
                type="number" 
                className="form-control" 
                value={qrSize} 
                onChange={(e) => setQrSize(parseInt(e.target.value) || 22)} 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                โครงสร้างลิงก์ GLPI
              </label>
              <input 
                type="text" 
                className="form-control" 
                value={glpiBaseUrl} 
                onChange={(e) => setGlpiBaseUrl(e.target.value)} 
                placeholder="http://192.168.1.100/front/computer.form.php?id="
                style={{ fontSize: '0.75rem' }}
              />
            </div>
          </div>

          {/* Border and QR checkbox options */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showBorder} 
                onChange={(e) => setShowBorder(e.target.checked)} 
              />
              แสดงขอบกล่อง (Border)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showQrCode} 
                onChange={(e) => setShowQrCode(e.target.checked)} 
              />
              พิมพ์ QR Code
            </label>
          </div>

          {/* Print / Save as PDF Button */}
          <button
            onClick={handlePrint}
            disabled={selectedIds.length === 0}
            className="btn btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              padding: '0.85rem', 
              fontSize: '1rem', 
              fontWeight: 600 
            }}
          >
            <Printer size={18} />
            <span>สั่งพิมพ์หรือบันทึกเป็น PDF ({selectedIds.length} แผ่น)</span>
          </button>
        </div>
      </div>

      {/* Info notice about Honeywell PC42T printing */}
      <div className="card no-print" style={{ 
        padding: '1rem', 
        marginBottom: '2rem', 
        backgroundColor: 'var(--accent-light)', 
        border: '1px solid rgba(16, 185, 129, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.85rem',
        color: 'var(--accent)'
      }}>
        <Info size={20} style={{ flexShrink: 0 }} />
        <span>
          💡 <strong>แนะนำการพิมพ์:</strong> เมื่อกดปุ่มสั่งพิมพ์ บราวเซอร์จะมีหน้าต่าง Print Preview เด้งขึ้นมา ในช่อง <strong>Destination (ปลายทาง)</strong> คุณสามารถเลือกเครื่องพิมพ์ Honeywell PC42T เพื่อสั่งปริ้นตรง หรือเลือก <strong>"Save as PDF" (บันทึกเป็น PDF)</strong> เพื่อนำไฟล์ PDF ไปสั่งปริ้นจากภายนอกได้ทันทีครับ
        </span>
      </div>

      {/* Screen Preview Area (No print) */}
      {selectedIds.length > 0 && (
        <div className="card no-print" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <AlignLeft size={18} color="var(--primary)" />
            <span>ตัวอย่างป้ายสติ๊กเกอร์ (Sticker Previews)</span>
          </h3>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            padding: '1.5rem', 
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            justifyContent: 'center'
          }}>
            {selectedComputers.map(c => (
              <div
                key={c.id}
                style={{
                  width: `${labelWidth * 3.5}px`, // Scale on screen
                  height: `${labelHeight * 3.5}px`,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: showBorder ? '1px solid #333' : '1px dashed #ccc',
                  borderRadius: '2px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Left Side: Header & Metadata */}
                <div style={{ width: '70%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Header: Computer Name + Nippon Logo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1.5px solid #000', paddingBottom: '3px', width: '100%' }}>
                    <img src="/logo.png" alt="Nippon Paint" style={{ height: '14px', objectFit: 'contain' }} />
                    <span style={{ fontSize: `${fontSize + 3}px`, fontWeight: 800, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </span>
                  </div>

                  {/* Metadata List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: `${fontSize}px`, marginTop: '6px', color: '#000000' }}>
                    <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 800, minWidth: '45px' }}>INV No:</span>
                      <span style={{ fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.otherserial || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 800, minWidth: '45px' }}>Brand:</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.manufacturer || 'Generic'}</span>
                    </div>
                    <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 800, minWidth: '45px' }}>Model:</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.model || 'Generic'}</span>
                    </div>
                    <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 800, minWidth: '45px' }}>Serial:</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.serial || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 800, minWidth: '45px' }}>Loc:</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{c.location || 'ไม่ระบุ'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Absolute QR & Badge Group */}
                <div style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '6px',
                  width: '26%'
                }}>
                  {showQrCode && (
                    <div style={{ padding: '2px', border: '0.5px solid #ddd', borderRadius: '3px', background: '#fff' }}>
                      <QRCodeSVG value={getQrValue(c)} size={qrSize * 3.5} />
                    </div>
                  )}
                  <span style={{ 
                    fontSize: `${fontSize - 2.5}px`, 
                    fontWeight: 800, 
                    backgroundColor: '#000000', 
                    color: '#ffffff', 
                    padding: '2px 4px', 
                    borderRadius: '2px', 
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    width: '100%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    ASSET TAG
                  </span>
                </div>

                {/* Footer status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${fontSize - 3}px`, color: '#666', borderTop: '0.5px solid #ddd', paddingTop: '2px', fontWeight: 600, width: '100%', marginTop: 'auto' }}>
                  <span>Status: {c.state || 'Active'}</span>
                  <span>Nippon Paint (Thailand) Co., Ltd.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Area (Invisible on screen, displays automatically when window.print() is triggered) */}
      <div className="print-only-labels-area">
        {selectedComputers.map(c => (
          <div
            key={c.id}
            className="printable-sticker-page"
            style={{
              boxSizing: 'border-box',
              width: `${labelWidth}mm`,
              height: `${labelHeight}mm`,
              padding: '3mm',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: showBorder ? '0.5px solid #000000' : 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              pageBreakAfter: 'always',
              breakAfter: 'page',
              position: 'relative'
            }}
          >
            {/* Left Side Container (constrained to 70% width) */}
            <div style={{ width: '70%', display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Top Section: Name/Logo on Left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1.5px solid #000000', paddingBottom: '3px', width: '100%' }}>
                <img src="/logo.png" alt="Nippon Paint" style={{ height: '12px', objectFit: 'contain' }} />
                <span style={{ fontSize: `${fontSize + 3}px`, fontWeight: 800, textTransform: 'uppercase', color: '#000000', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {c.name}
                </span>
              </div>

              {/* Middle Section: Metadata details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontSize: `${fontSize}px`, color: '#000000', marginTop: '4px' }}>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 800, minWidth: '40px' }}>INV No:</span>
                  <span style={{ fontWeight: 750, overflow: 'hidden' }}>{c.otherserial || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 800, minWidth: '40px' }}>Brand:</span>
                  <span style={{ overflow: 'hidden' }}>{c.manufacturer || 'Generic'}</span>
                </div>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 800, minWidth: '40px' }}>Model:</span>
                  <span style={{ overflow: 'hidden' }}>{c.model || 'Generic'}</span>
                </div>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 800, minWidth: '40px' }}>Serial:</span>
                  <span style={{ overflow: 'hidden' }}>{c.serial || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 800, minWidth: '40px' }}>Loc:</span>
                  <span style={{ overflow: 'hidden', fontWeight: 600 }}>{c.location || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>

            {/* Right Side absolute QR & Badge Group */}
            <div style={{ 
              position: 'absolute', 
              top: '3mm', 
              right: '3mm', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '4px',
              width: '26%'
            }}>
              {showQrCode && (
                <div style={{ padding: '1px', border: '0.5px solid #000000', borderRadius: '1.5px', background: '#ffffff' }}>
                  <QRCodeSVG value={getQrValue(c)} size={qrSize} />
                </div>
              )}
              <span style={{ 
                fontSize: `${fontSize - 2.5}px`, 
                fontWeight: 800, 
                backgroundColor: '#000000', 
                color: '#ffffff', 
                padding: '2px 4px', 
                borderRadius: '2px', 
                whiteSpace: 'nowrap',
                textAlign: 'center',
                width: '100%'
              }}>
                ASSET TAG
              </span>
            </div>

            {/* Footer status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${fontSize - 3}px`, color: '#000000', borderTop: '0.5px solid #000000', paddingTop: '2px', fontWeight: 600, width: '100%', marginTop: 'auto' }}>
              <span>Status: {c.state || 'Active'}</span>
              <span>Nippon Paint (Thailand) Co., Ltd.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
