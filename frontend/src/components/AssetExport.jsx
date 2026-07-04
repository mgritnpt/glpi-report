import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Download, Search, CheckSquare, Square, Eye, FileSpreadsheet, Loader2, AlertCircle, Settings } from 'lucide-react';

export default function AssetExport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawAssets, setRawAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Available columns grouped into sections
  const columnGroups = {
    hardware: {
      title: '💻 ข้อมูลสินทรัพย์ & ฮาร์ดแวร์',
      columns: [
        { key: 'id', label: 'ไอดี (ID)', default: true },
        { key: 'name', label: 'ชื่อเครื่อง (Hostname)', default: true },
        { key: 'otherserial', label: 'เลขทรัพย์สิน (INV)', default: true },
        { key: 'serial', label: 'ซีเรียลนัมเบอร์ (S/N)', default: true },
        { key: 'manufacturer', label: 'ยี่ห้อ (Brand)', default: true },
        { key: 'model', label: 'รุ่น (Model)', default: true },
        { key: 'location', label: 'สถานที่ตั้ง (Location)', default: true },
        { key: 'state', label: 'สถานะ (State)', default: true },
        { key: 'os', label: 'ระบบปฏิบัติการ (OS)', default: false },
        { key: 'cpu', label: 'หน่วยประมวลผล (CPU)', default: false },
        { key: 'ram', label: 'แรม (RAM)', default: false },
        { key: 'storage', label: 'ความจุ (Storage)', default: false }
      ]
    },
    user: {
      title: '👤 ข้อมูลผู้ถือครองสิทธิ์',
      columns: [
        { key: 'username', label: 'ผู้ถือครอง (User)', default: true },
        { key: 'user_title', label: 'ตำแหน่ง (Job Title)', default: false },
        { key: 'user_dept', label: 'แผนก/ฝ่าย (Department)', default: true },
        { key: 'user_phone', label: 'เบอร์ติดต่อ (Phone)', default: false },
        { key: 'user_email', label: 'อีเมล (Email)', default: false }
      ]
    },
    management: {
      title: '📊 ข้อมูลบริหารจัดการ & การเงิน (Management)',
      columns: [
        { key: 'buy_date', label: 'วันที่จัดซื้อ (Purchase Date)', default: false },
        { key: 'use_date', label: 'วันที่เริ่มใช้งาน (Start Date)', default: false },
        { key: 'delivery_date', label: 'วันที่ส่งมอบ (Delivery Date)', default: false },
        { key: 'order_date', label: 'วันที่สั่งซื้อ (Order Date)', default: false },
        { key: 'warranty_duration', label: 'ระยะเวลาประกัน (Warranty)', default: false },
        { key: 'value', label: 'ราคาทรัพย์สิน (Price)', default: false },
        { key: 'buy_number', label: 'เลขที่ใบสั่งซื้อ (PO Number)', default: false },
        { key: 'bill', label: 'เลขที่ใบเสร็จ/ใบกำกับ (Invoice/Bill)', default: false },
        { key: 'supplier_name', label: 'ผู้จัดจำหน่าย (Supplier)', default: false }
      ]
    }
  };

  // Flattened active columns state
  const [activeColumns, setActiveColumns] = useState(() => {
    const initial = {};
    Object.values(columnGroups).forEach(group => {
      group.columns.forEach(col => {
        initial[col.key] = col.default;
      });
    });
    return initial;
  });

  // Fetch rich assets on mount
  useEffect(() => {
    fetch('/api/assets/rich-data')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch rich assets');
        return res.json();
      })
      .then(data => {
        setRawAssets(data);
        setFilteredAssets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('ไม่สามารถดึงข้อมูลทรัพย์สินและข้อมูลจัดการเชิงลึกได้ โปรดลองอีกครั้ง');
        setLoading(false);
      });
  }, []);

  // Filter assets when search term or raw assets changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAssets(rawAssets);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = rawAssets.filter(item => {
      return (
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.serial && item.serial.toLowerCase().includes(term)) ||
        (item.otherserial && item.otherserial.toLowerCase().includes(term)) ||
        (item.username && item.username.toLowerCase().includes(term)) ||
        (item.manufacturer && item.manufacturer.toLowerCase().includes(term)) ||
        (item.model && item.model.toLowerCase().includes(term)) ||
        (item.supplier_name && item.supplier_name.toLowerCase().includes(term))
      );
    });
    setFilteredAssets(filtered);
  }, [searchTerm, rawAssets]);

  const toggleColumn = (key) => {
    setActiveColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAll = (status) => {
    const updated = {};
    Object.keys(activeColumns).forEach(key => {
      updated[key] = status;
    });
    setActiveColumns(updated);
  };

  const handleExportExcel = () => {
    // 1. Get ordered list of selected columns
    const selectedHeaders = [];
    const selectedKeys = [];
    
    Object.values(columnGroups).forEach(group => {
      group.columns.forEach(col => {
        if (activeColumns[col.key]) {
          selectedHeaders.push(col.label.split(' (')[0]); // Clean label for Excel header (e.g. "ยี่ห้อ")
          selectedKeys.push(col.key);
        }
      });
    });

    if (selectedKeys.length === 0) {
      alert('โปรดเลือกอย่างน้อย 1 คอลัมน์สำหรับส่งออกข้อมูล');
      return;
    }

    // 2. Format filtered data for SheetJS
    const excelRows = filteredAssets.map((item, idx) => {
      const row = {};
      selectedKeys.forEach((key, colIdx) => {
        const header = selectedHeaders[colIdx];
        row[header] = item[key];
      });
      return row;
    });

    // 3. Create Sheet and Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GLPI Assets');

    // 4. Autofit columns (making it gorgeous and readable)
    const max_len = selectedHeaders.map(h => h.length);
    excelRows.forEach(row => {
      selectedHeaders.forEach((h, i) => {
        const val = row[h] ? row[h].toString() : '';
        if (val.length > max_len[i]) {
          max_len[i] = val.length;
        }
      });
    });
    worksheet['!cols'] = max_len.map(len => ({ wch: Math.max(len + 4, 10) }));

    // 5. Trigger download
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `glpi_assets_report_${dateStr}.xlsx`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>กำลังเตรียมคิวรี SQL ดึงข้อมูลเชื่อมโยงระดับลึก...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--danger)" style={{ marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>ส่งออกข้อมูลสินทรัพย์แบบกำหนดเอง</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          ดึงข้อมูลสินทรัพย์คอมพิวเตอร์ เชื่อมโยงรายละเอียดพนักงาน และข้อมูลการจัดการทางบัญชี (Management Details) ส่งออกไฟล์ Excel
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Column Selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Search Box */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>🔍 ค้นหาและฟิลเตอร์</h3>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="ค้นหาชื่อ, S/N, INV, ผู้ใช้, ยี่ห้อ..."
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Columns Config Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} /> เลือกคอลัมน์ส่งออก
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => selectAll(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  เลือกทั้งหมด
                </button>
                <span style={{ color: 'var(--border)' }}>|</span>
                <button 
                  onClick={() => selectAll(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  ล้างค่า
                </button>
              </div>
            </div>

            {/* Checkbox Groupings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(columnGroups).map(([groupKey, group]) => (
                <div key={groupKey}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    {group.title}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '0.5rem' }}>
                    {group.columns.map(col => {
                      const isChecked = activeColumns[col.key];
                      return (
                        <label 
                          key={col.key} 
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => toggleColumn(col.key)}
                            style={{ cursor: 'pointer' }}
                          />
                          {col.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Table Preview & Export Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              📊 ตารางตัวอย่าง ({filteredAssets.length} แถวที่ตรงเงื่อนไข)
            </h3>
            <button onClick={handleExportExcel} className="btn btn-accent" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
              <FileSpreadsheet size={18} /> ส่งออก Excel พรีเมียม (.xlsx)
            </button>
          </div>

          {/* Table Container */}
          <div className="table-container" style={{ maxHeight: '600px', overflow: 'auto' }}>
            <table className="custom-table" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  {Object.values(columnGroups).flatMap(g => g.columns).map(col => {
                    if (!activeColumns[col.key]) return null;
                    return <th key={col.key} style={{ padding: '0.75rem 1rem' }}>{col.label.split(' (')[0]}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={Object.values(activeColumns).filter(Boolean).length}
                      style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}
                    >
                      <AlertTriangle size={24} style={{ display: 'block', margin: '0 auto 0.5rem auto' }} />
                      ไม่พบข้อมูลสินทรัพย์ตามที่ระบุ
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map(item => (
                    <tr key={item.id}>
                      {Object.values(columnGroups).flatMap(g => g.columns).map(col => {
                        if (!activeColumns[col.key]) return null;
                        
                        let cellVal = item[col.key];
                        // highlight status badges
                        if (col.key === 'state') {
                          const stateStr = cellVal || 'N/A';
                          const isSuccess = stateStr.includes('Active') || stateStr.includes('ใช้งาน');
                          return (
                            <td key={col.key} style={{ padding: '0.75rem 1rem' }}>
                              <span className={`badge ${isSuccess ? 'badge-success' : 'badge-muted'}`} style={{ fontSize: '0.7rem' }}>
                                {stateStr.split(' ')[0]}
                              </span>
                            </td>
                          );
                        }
                        
                        return <td key={col.key} style={{ padding: '0.75rem 1rem' }}>{cellVal || '-'}</td>;
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            <strong>💡 คำแนะนำระบบรายงาน Excel:</strong>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              <li>คุณสามารถค้นหาข้อมูลในกล่องข้อความเพื่อจำกัดแถว (Rows) ก่อนทำการกดดาวน์โหลด</li>
              <li>ระบบส่งออกข้อมูลจะคำนวณและปรับขนาดความกว้างคอลัมน์ (Auto-width) ให้เหมาะสมโดยอัตโนมัติ เพื่อไม่ให้อักษรทับกัน</li>
              <li>ข้อมูลประวัติจัดซื้อ ราคา PO แบรนด์ และประกัน ดึงจากโมดูลและตารางหลัก `glpi_infocomms` และ `glpi_suppliers` ตรงตามโครงสร้าง GLPI 11</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
