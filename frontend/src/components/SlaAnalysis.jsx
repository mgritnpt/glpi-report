import React, { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, ChevronRight, ChevronDown, BarChart2, Users, Layers, Award } from 'lucide-react';

export default function SlaAnalysis({ tickets }) {
  // Config state
  const [slaMode, setSlaMode] = useState('priority'); // 'fixed' or 'priority'
  const [fixedSlaHours, setFixedSlaHours] = useState(8); // Default 8 hours SLA
  
  // Custom SLA Targets by Priority (in hours)
  const [prioritySlas, setPrioritySlas] = useState({
    1: 24, // Very Low
    2: 16, // Low
    3: 8,  // Medium
    4: 4,  // High
    5: 2   // Very High
  });

  // Drill down grouping view state: 'category' or 'department'
  const [drillDownGroup, setDrillDownGroup] = useState('category');
  
  // Expanded group name state to show drill-down details of a specific Category/Department
  const [expandedGroupName, setExpandedGroupName] = useState(null);

  // Filter state
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Priority metadata for translation and mapping
  const priorityMap = {
    1: { label: 'ต่ำมาก (Very Low)', color: '#94a3b8' },
    2: { label: 'ต่ำ (Low)', color: '#3b82f6' },
    3: { label: 'ปานกลาง (Medium)', color: '#eab308' },
    4: { label: 'สูง (High)', color: '#f97316' },
    5: { label: 'สูงมาก (Very High)', color: '#ef4444' }
  };

  // Helper to parse date securely and calculate diff in hours
  const calculateDurationHours = (dateStr, closeDateStr) => {
    if (!dateStr) return 0;
    const openDate = new Date(dateStr);
    const closeDate = closeDateStr ? new Date(closeDateStr) : new Date();
    
    // Diff in milliseconds converted to hours
    const diffMs = closeDate - openDate;
    return Math.max(0, diffMs / (1000 * 60 * 60));
  };

  // Helper to get SLA Target for a ticket
  const getTicketSlaTarget = (ticket) => {
    if (slaMode === 'fixed') {
      return fixedSlaHours;
    }
    return prioritySlas[ticket.priority] || 8;
  };

  // Process all tickets to enrich with duration and SLA status
  const analyzedTickets = tickets.map(t => {
    const durationHours = calculateDurationHours(t.date, t.close_date);
    const slaTarget = getTicketSlaTarget(t);
    const isResolved = t.status >= 5 || t.close_date !== null;
    
    let slaStatus = 'MET'; // Default Met
    if (isResolved) {
      slaStatus = durationHours <= slaTarget ? 'MET' : 'BREACHED';
    } else {
      // For open tickets, check if they have already breached the SLA target
      slaStatus = durationHours > slaTarget ? 'BREACHED' : 'PENDING';
    }

    return {
      ...t,
      durationHours,
      slaTarget,
      isResolved,
      slaStatus
    };
  }).filter(t => {
    if (selectedPriority === 'all') return true;
    return t.priority.toString() === selectedPriority;
  });

  // Calculate high level metrics
  const totalCount = analyzedTickets.length;
  const resolvedTickets = analyzedTickets.filter(t => t.isResolved);
  const resolvedCount = resolvedTickets.length;
  const openCount = totalCount - resolvedCount;
  
  const metSlaResolved = resolvedTickets.filter(t => t.slaStatus === 'MET');
  const metSlaResolvedCount = metSlaResolved.length;
  const breachedResolvedCount = resolvedCount - metSlaResolvedCount;
  
  const activeBreachedCount = analyzedTickets.filter(t => !t.isResolved && t.slaStatus === 'BREACHED').length;
  const totalBreachedCount = breachedResolvedCount + activeBreachedCount;

  // SLA Resolution Rate for closed tickets
  const slaResolutionRate = resolvedCount > 0 
    ? Math.round((metSlaResolvedCount / resolvedCount) * 100) 
    : 100;

  // Average MTTR (Mean Time to Resolution)
  const averageResolutionTime = resolvedCount > 0
    ? (resolvedTickets.reduce((acc, curr) => acc + curr.durationHours, 0) / resolvedCount)
    : 0;

  // Grouping / Drill Down Data generation
  const groupData = {};
  analyzedTickets.forEach(ticket => {
    const key = drillDownGroup === 'category' 
      ? ticket.category 
      : ticket.department;

    if (!groupData[key]) {
      groupData[key] = {
        name: key,
        total: 0,
        resolved: 0,
        slaMet: 0,
        totalDuration: 0,
        tickets: []
      };
    }

    groupData[key].total += 1;
    groupData[key].tickets.push(ticket);

    if (ticket.isResolved) {
      groupData[key].resolved += 1;
      groupData[key].totalDuration += ticket.durationHours;
      if (ticket.slaStatus === 'MET') {
        groupData[key].slaMet += 1;
      }
    }
  });

  // Convert groups object to array and calculate group statistics
  const groupsList = Object.values(groupData).map(group => {
    const avgDuration = group.resolved > 0 ? (group.totalDuration / group.resolved) : 0;
    const slaRate = group.resolved > 0 ? Math.round((group.slaMet / group.resolved) * 100) : 100;
    
    // Status assessment
    let statusLabel = 'ดีเยี่ยม';
    let statusColor = 'var(--accent)';
    if (slaRate < 60) {
      statusLabel = 'ต้องปรับปรุงด่วน';
      statusColor = 'var(--danger)';
    } else if (slaRate < 80) {
      statusLabel = 'ระวัง / ปานกลาง';
      statusColor = 'var(--warning)';
    }

    return {
      ...group,
      avgDuration,
      slaRate,
      statusLabel,
      statusColor
    };
  }).sort((a, b) => b.total - a.total); // Sort by total tickets descending

  // Handler to toggle SLA edit values
  const handlePrioritySlaChange = (priority, val) => {
    const numVal = parseFloat(val) || 1;
    setPrioritySlas(prev => ({
      ...prev,
      [priority]: numVal
    }));
  };

  return (
    <div style={{ fontFamily: "'Outfit', 'Sarabun', sans-serif" }}>
      {/* Header */}
      <div className="no-print" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>วิเคราะห์ประสิทธิภาพ SLA (Incident Service)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          ตรวจสอบระยะเวลาการแก้ไขปัญหา (Mean Time to Resolution - MTTR) โดยวิเคราะห์ตามระยะเวลาตั้งแต่ผู้ใช้แจ้งเรื่อง (Open) จนถึงเวลาแก้ไขเสร็จสิ้น (Resolution)
        </p>
      </div>

      {/* Control panel & Configurations */}
      <div className="grid no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* SLA Configuration Card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', margin: 0 }}>
            <Clock size={18} color="var(--primary)" />
            <span>ตั้งค่าเกณฑ์เป้าหมาย SLA (SLA Targets)</span>
          </h3>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>
              <input 
                type="radio" 
                name="slaMode" 
                checked={slaMode === 'priority'} 
                onChange={() => setSlaMode('priority')} 
              />
              ใช้ตามระดับความสำคัญ
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>
              <input 
                type="radio" 
                name="slaMode" 
                checked={slaMode === 'fixed'} 
                onChange={() => setSlaMode('fixed')} 
              />
              ใช้เวลาคงที่ทั้งหมด
            </label>
          </div>

          {slaMode === 'fixed' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                เป้าหมายการแก้ปัญหาเสร็จสิ้น (ชั่วโมง)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  className="form-control" 
                  min="1" 
                  max="168"
                  value={fixedSlaHours} 
                  onChange={(e) => setFixedSlaHours(parseInt(e.target.value) || 8)}
                  style={{ width: '100px' }} 
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ชั่วโมง</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {Object.entries(priorityMap).map(([pId, info]) => (
                <div key={pId} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: info.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {info.label.split(' ')[0]}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="1" 
                      value={prioritySlas[pId]} 
                      onChange={(e) => handlePrioritySlaChange(pId, e.target.value)}
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ช.ม.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters Card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', margin: 0 }}>
            <Layers size={18} color="var(--primary)" />
            <span>กรองและคัดเลือกข้อมูล</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              ระดับความสำคัญของเหตุการณ์
            </label>
            <select
              className="form-control"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="all">-- แสดงระดับความสำคัญทั้งหมด --</option>
              {Object.entries(priorityMap).map(([pId, info]) => (
                <option key={pId} value={pId}>{info.label}</option>
              ))}
            </select>
          </div>

          <div style={{
            marginTop: 'auto',
            padding: '0.75rem',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.4'
          }}>
            ℹ️ <strong>วิธีคำนวณ SLA:</strong> ระยะเวลาตั้งแต่ตั๋วเข้าระบบจนถึงเวลาที่เปลี่ยนสถานะเป็น "แก้ไขแล้ว" (Solved) หรือ "ปิดงาน" (Closed) เทียบกับเกณฑ์เป้าหมายด้านซ้าย
          </div>
        </div>
      </div>

      {/* KPI Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Metric 1 */}
        <div className="card text-center" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 10, right: 15, color: 'rgba(37, 99, 235, 0.08)' }}>
            <Clock size={72} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>ตั๋วทั้งหมดในเกณฑ์</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: '1' }}>{totalCount}</span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>🟢 ปิดงาน: <strong>{resolvedCount}</strong></span>
            <span>🟡 ค้างอยู่: <strong>{openCount}</strong></span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card text-center" style={{ 
          padding: '1.5rem', 
          position: 'relative', 
          overflow: 'hidden', 
          borderLeft: '4px solid ' + (slaResolutionRate >= 80 ? 'var(--accent)' : slaResolutionRate >= 60 ? 'var(--warning)' : 'var(--danger)')
        }}>
          <div style={{ position: 'absolute', top: 10, right: 15, color: 'rgba(16, 185, 129, 0.08)' }}>
            <Award size={72} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>อัตราการทำตาม SLA (Met SLA)</span>
          <span style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            color: slaResolutionRate >= 80 ? 'var(--accent)' : slaResolutionRate >= 60 ? 'var(--warning)' : 'var(--danger)', 
            lineHeight: '1' 
          }}>
            {slaResolutionRate}%
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>ทันตามเกณฑ์: <strong>{metSlaResolvedCount}</strong> / {resolvedCount} รายการ</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card text-center" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 10, right: 15, color: 'rgba(239, 68, 68, 0.08)' }}>
            <AlertTriangle size={72} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>งานหลุดเกณฑ์ SLA (Breached)</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: totalBreachedCount > 0 ? 'var(--danger)' : 'var(--text-muted)', lineHeight: '1' }}>{totalBreachedCount}</span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>🔴 ปิดช้า: <strong>{breachedResolvedCount}</strong></span>
            <span>⚠️ ค้างแล้วช้า: <strong>{activeBreachedCount}</strong></span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card text-center" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 10, right: 15, color: 'rgba(234, 179, 8, 0.08)' }}>
            <CheckCircle size={72} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>เวลาเฉลี่ยในการปิดงาน (MTTR)</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1' }}>
            {averageResolutionTime.toFixed(1)}
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>ชั่วโมงต่อตั๋ว (ช.ม. / ตั๋ว)</span>
          </div>
        </div>
      </div>

      {/* SVG Dashboard Chart & Visual Breakdown */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <BarChart2 size={18} color="var(--primary)" />
          <span>แผนภูมิสรุปผลการปฏิบัติตามข้อตกลง SLA</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-around' }}>
          {/* Donut Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="3" />
                <circle 
                  cx="21" 
                  cy="21" 
                  r="15.915" 
                  fill="transparent" 
                  stroke={slaResolutionRate >= 80 ? 'var(--accent)' : slaResolutionRate >= 60 ? 'var(--warning)' : 'var(--danger)'} 
                  strokeWidth="3.5" 
                  strokeDasharray={`${slaResolutionRate} ${100 - slaResolutionRate}`} 
                  strokeDashoffset="25" 
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1.1'
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{slaResolutionRate}%</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>MET SLA</span>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>อัตราทำตามข้อตกลง SLA (ปิดงานสำเร็จ)</span>
          </div>

          {/* Bar Charts Breakdown */}
          <div style={{ flexGrow: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              เปรียบเทียบระยะเวลาปิดงานเฉลี่ยตามความสำคัญ
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(priorityMap).map(([pId, info]) => {
                const priorityTickets = analyzedTickets.filter(t => t.priority.toString() === pId && t.isResolved);
                const avgHr = priorityTickets.length > 0
                  ? (priorityTickets.reduce((acc, curr) => acc + curr.durationHours, 0) / priorityTickets.length)
                  : 0;
                
                const targetHr = slaMode === 'fixed' ? fixedSlaHours : prioritySlas[pId] || 8;
                
                // Max for bar scaling
                const maxScale = Math.max(24, Math.max(...Object.values(prioritySlas)), fixedSlaHours);
                const targetPercent = Math.min(100, (targetHr / maxScale) * 100);
                const actualPercent = Math.min(100, (avgHr / maxScale) * 100);

                return (
                  <div key={pId} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ color: info.color }}>{info.label}</span>
                      <span>
                        เฉลี่ย: <strong style={{ color: avgHr > targetHr ? 'var(--danger)' : 'var(--text-primary)' }}>{avgHr.toFixed(1)} ช.ม.</strong> 
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (เป้าหมาย: {targetHr} ช.ม.)</span>
                      </span>
                    </div>
                    
                    {/* Bar track */}
                    <div style={{ 
                      height: '8px', 
                      backgroundColor: 'var(--bg-tertiary)', 
                      borderRadius: '4px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* SLA Target indicator line */}
                      <div style={{
                        position: 'absolute',
                        left: `${targetPercent}%`,
                        top: 0,
                        width: '2px',
                        height: '100%',
                        backgroundColor: 'var(--text-muted)',
                        zIndex: 2,
                        opacity: 0.7
                      }} title="SLA Target Line" />

                      {/* Actual resolution bar */}
                      <div style={{
                        height: '100%',
                        width: `${actualPercent}%`,
                        backgroundColor: avgHr > targetHr ? 'var(--danger)' : 'var(--accent)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Drill Down View (Category / Department Analysis) */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Drill down controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem', 
          borderBottom: '1px solid var(--border)', 
          paddingBottom: '0.75rem' 
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            {drillDownGroup === 'category' ? <Layers size={18} color="var(--primary)" /> : <Users size={18} color="var(--primary)" />}
            <span>เจาะลึกตั๋ว Incident (Drill Down Report)</span>
          </h3>

          {/* Drill down toggles */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => {
                setDrillDownGroup('category');
                setExpandedGroupName(null);
              }}
              style={{
                border: 'none',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                backgroundColor: drillDownGroup === 'category' ? 'var(--card-bg)' : 'transparent',
                color: drillDownGroup === 'category' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: drillDownGroup === 'category' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition)'
              }}
            >
              แยกตามหมวดหมู่ (Category)
            </button>
            <button
              onClick={() => {
                setDrillDownGroup('department');
                setExpandedGroupName(null);
              }}
              style={{
                border: 'none',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                backgroundColor: drillDownGroup === 'department' ? 'var(--card-bg)' : 'transparent',
                color: drillDownGroup === 'department' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: drillDownGroup === 'department' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition)'
              }}
            >
              แยกตามแผนก (Department)
            </button>
          </div>
        </div>

        {/* Drill down table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>
                  {drillDownGroup === 'category' ? 'หมวดหมู่ Incident' : 'แผนกผู้แจ้งเรื่อง'}
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>ตั๋วทั้งหมด</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>แก้เสร็จแล้ว</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>เวลาเฉลี่ย (ช.ม.)</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>ตามเกณฑ์ SLA</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>ระดับความสำเร็จ</th>
                <th style={{ padding: '0.75rem', width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {groupsList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    ไม่พบข้อมูลสำหรับประมวลผลวิเคราะห์ SLA
                  </td>
                </tr>
              ) : (
                groupsList.map(group => {
                  const isExpanded = expandedGroupName === group.name;
                  return (
                    <React.Fragment key={group.name}>
                      <tr 
                        onClick={() => setExpandedGroupName(isExpanded ? null : group.name)}
                        style={{ 
                          borderBottom: '1px solid var(--border)', 
                          cursor: 'pointer',
                          backgroundColor: isExpanded ? 'var(--primary-light)' : 'transparent',
                          transition: 'var(--transition)'
                        }}
                        className="table-row-hover"
                      >
                        <td style={{ padding: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>{group.name}</span>
                        </td>
                        <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 500 }}>{group.total}</td>
                        <td style={{ padding: '0.85rem', textAlign: 'center' }}>{group.resolved}</td>
                        <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
                          {group.avgDuration.toFixed(1)} ช.ม.
                        </td>
                        <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                            <span style={{ fontWeight: 700, color: group.slaRate >= 80 ? 'var(--accent)' : group.slaRate >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                              {group.slaRate}%
                            </span>
                            <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${group.slaRate}%`, height: '100%', backgroundColor: group.slaRate >= 80 ? 'var(--accent)' : group.slaRate >= 60 ? 'var(--warning)' : 'var(--danger)' }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px',
                            fontWeight: 700,
                            backgroundColor: group.slaRate >= 80 ? 'var(--accent-light)' : group.slaRate >= 60 ? 'var(--warning-light)' : 'var(--danger-light)',
                            color: group.statusColor
                          }}>
                            {group.statusLabel}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <span style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>รายละเอียด</span>
                        </td>
                      </tr>

                      {/* Expandable Drill Down Detail Section */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
                            <div style={{
                              padding: '1rem',
                              backgroundColor: 'var(--card-bg)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border)',
                              boxShadow: 'var(--shadow-sm)'
                            }}>
                              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>รายการ Incident ในหัวข้อ: "{group.name}"</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>แสดงตั๋วทั้งหมด {group.tickets.length} ใบ</span>
                              </h4>
                              
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1.5px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                      <th style={{ padding: '0.5rem' }}>ID</th>
                                      <th style={{ padding: '0.5rem' }}>หัวข้อ / Incident Subject</th>
                                      <th style={{ padding: '0.5rem' }}>ผู้แจ้ง (Requester)</th>
                                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>ความสำคัญ</th>
                                      <th style={{ padding: '0.5rem' }}>เวลาเริ่มแจ้ง (Open)</th>
                                      <th style={{ padding: '0.5rem' }}>เวลาแก้ไขเสร็จ (Resolved)</th>
                                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>ระยะเวลารวม</th>
                                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>ผล SLA</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.tickets.map(t => {
                                      const pInfo = priorityMap[t.priority] || { label: 'ทั่วไป', color: 'var(--text-primary)' };
                                      return (
                                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                          <td style={{ padding: '0.5rem 0.25rem', fontWeight: 600 }}>#{t.id}</td>
                                          <td style={{ padding: '0.5rem', fontWeight: 500 }} title={t.content}>
                                            {t.name}
                                          </td>
                                          <td style={{ padding: '0.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                              <span style={{ fontWeight: 600 }}>{t.requester}</span>
                                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.department}</span>
                                            </div>
                                          </td>
                                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                            <span style={{ color: pInfo.color, fontWeight: 700 }}>
                                              {pInfo.label.split(' ')[0]}
                                            </span>
                                          </td>
                                          <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
                                            {t.date ? new Date(t.date).toLocaleString('th-TH') : '-'}
                                          </td>
                                          <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
                                            {t.close_date ? new Date(t.close_date).toLocaleString('th-TH') : (
                                              <span style={{ color: 'var(--warning)', fontWeight: 600 }}>กำลังดำเนินการ...</span>
                                            )}
                                          </td>
                                          <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>
                                            {t.durationHours.toFixed(1)} ช.ม.
                                          </td>
                                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                            <span style={{
                                              padding: '0.15rem 0.4rem',
                                              borderRadius: '4px',
                                              fontSize: '0.7rem',
                                              fontWeight: 800,
                                              backgroundColor: t.slaStatus === 'MET' ? 'var(--accent-light)' : t.slaStatus === 'BREACHED' ? 'var(--danger-light)' : 'var(--warning-light)',
                                              color: t.slaStatus === 'MET' ? 'var(--accent)' : t.slaStatus === 'BREACHED' ? 'var(--danger)' : 'var(--warning)'
                                            }}>
                                              {t.slaStatus === 'MET' ? 'ทันเกณฑ์ (Met)' : t.slaStatus === 'BREACHED' ? 'ช้ากว่าเกณฑ์ (Breached)' : 'รอดำเนินการ'}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
