const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration
const dbConfig = {
  host: process.env.DB_HOST || '192.168.1.100',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'glpiuser',
  password: process.env.DB_PASSWORD || 'glpipassword',
  database: process.env.DB_NAME || 'glpidb',
  connectTimeout: 5000 // 5 seconds timeout
};

let pool = null;
let useMockData = false;

// Mock Data
const mockUsers = [
  { id: 1, name: 'สมชาย ใจดี', email: 'somchai.j@company.com', phone: '081-234-5678', department: 'IT Operations', title: 'IT Support' },
  { id: 2, name: 'วิภา แก้วดี', email: 'wipa.k@company.com', phone: '089-876-5432', department: 'Human Resources', title: 'HR Manager' },
  { id: 3, name: 'นารี รักเรียน', email: 'naree.r@company.com', phone: '085-555-4433', department: 'Finance & Accounting', title: 'Accountant' },
  { id: 4, name: 'ประพันธ์ ดีเลิศ', email: 'prapan.d@company.com', phone: '086-111-2233', department: 'Marketing', title: 'Marketing Officer' },
  { id: 5, name: 'กิตติศักดิ์ พรหมมา', email: 'kittisak.p@company.com', phone: '083-999-8877', department: 'Sales', title: 'Sales Supervisor' }
];

const mockComputers = [
  {
    id: 1,
    name: 'PC-IT-SOMCHAI',
    serial: 'SN-7890-XYZ',
    otherserial: 'INV-2026-001',
    model: 'ThinkPad L14 Gen 4',
    manufacturer: 'Lenovo',
    location: 'อาคาร A ชั้น 3 (IT Dept)',
    state: 'Active (กำลังใช้งาน)',
    username: 'สมชาย ใจดี',
    user_id: 1,
    cpu: 'Intel Core i5-1335U',
    ram: '16 GB DDR4',
    storage: '512 GB SSD NVMe',
    os: 'Windows 11 Pro',
    purchase_date: '2025-01-15',
    warranty: '3 ปี (หมดประกัน 2028-01-15)'
  },
  {
    id: 2,
    name: 'NB-HR-WIPA',
    serial: 'SN-1234-ABC',
    otherserial: 'INV-2025-045',
    model: 'MacBook Air M2',
    manufacturer: 'Apple',
    location: 'อาคาร B ชั้น 2 (HR Dept)',
    state: 'Active (กำลังใช้งาน)',
    username: 'วิภา แก้วดี',
    user_id: 2,
    cpu: 'Apple M2 (8-core CPU / 8-core GPU)',
    ram: '8 GB Unified Memory',
    storage: '256 GB SSD',
    os: 'macOS Sequoia',
    purchase_date: '2024-06-10',
    warranty: '1 ปี (หมดประกัน 2025-06-10)'
  },
  {
    id: 3,
    name: 'PC-FIN-NAREE',
    serial: 'SN-4567-DEF',
    otherserial: 'INV-2025-110',
    model: 'OptiPlex 7010 Tower',
    manufacturer: 'Dell',
    location: 'อาคาร A ชั้น 1 (Accounting)',
    state: 'Active (กำลังใช้งาน)',
    username: 'นารี รักเรียน',
    user_id: 3,
    cpu: 'Intel Core i7-13700',
    ram: '32 GB DDR5',
    storage: '1 TB SSD + 2 TB HDD',
    os: 'Windows 11 Pro',
    purchase_date: '2025-03-20',
    warranty: '3 ปี (หมดประกัน 2028-03-20)'
  },
  {
    id: 4,
    name: 'NB-MKT-PRAPAN',
    serial: 'SN-3210-MNO',
    otherserial: 'INV-2026-004',
    model: 'Zenbook 14 OLED',
    manufacturer: 'ASUS',
    location: 'อาคาร B ชั้น 4 (Marketing)',
    state: 'Active (กำลังใช้งาน)',
    username: 'ประพันธ์ ดีเลิศ',
    user_id: 4,
    cpu: 'AMD Ryzen 7 7730U',
    ram: '16 GB LPDDR4X',
    storage: '512 GB SSD NVMe',
    os: 'Windows 11 Home',
    purchase_date: '2025-11-05',
    warranty: '2 ปี (หมดประกัน 2027-11-05)'
  },
  {
    id: 5,
    name: 'PC-STOCK-01',
    serial: 'SN-6543-STK',
    otherserial: 'INV-2024-099',
    model: 'ProDesk 400 G9 SFF',
    manufacturer: 'HP',
    location: 'ห้องสโตร์ IT (อาคาร A ชั้น 3)',
    state: 'Spare (สำรอง)',
    username: 'ไม่มีผู้ถือครอง (ส่วนกลาง)',
    user_id: null,
    cpu: 'Intel Core i5-12500',
    ram: '8 GB DDR4',
    storage: '256 GB SSD',
    os: 'Windows 11 Pro',
    purchase_date: '2024-02-12',
    warranty: '3 ปี (หมดประกัน 2027-02-12)'
  },
  {
    id: 6,
    name: 'PC-SALES-KITTI',
    serial: 'SN-8822-SLS',
    otherserial: 'INV-2025-088',
    model: 'Latitude 3440',
    manufacturer: 'Dell',
    location: 'อาคาร A ชั้น 2 (Sales)',
    state: 'Repair (ส่งซ่อม)',
    username: 'กิตติศักดิ์ พรหมมา',
    user_id: 5,
    cpu: 'Intel Core i5-1235U',
    ram: '16 GB DDR4',
    storage: '512 GB SSD',
    os: 'Windows 11 Pro',
    purchase_date: '2024-08-25',
    warranty: '3 ปี (หมดประกัน 2027-08-25)'
  }
];

const mockTickets = [
  {
    id: 101,
    name: 'คอมพิวเตอร์เปิดไม่ติด หน้าจอดำสนิท ไฟไม่เข้าเครื่อง',
    content: 'เครื่อง Lenovo ThinkPad (PC-IT-SOMCHAI) พยายามกดปุ่มเปิดเครื่องแล้วไม่มีปฏิกิริยาใดๆ ไฟแสดงสถานะการชาร์จไม่ขึ้น ลองสลับเต้ารับไฟฟ้าและสายชาร์จใหม่แล้วก็ยังเปิดไม่ติด คาดว่าพอร์ตชาร์จหรือบอร์ดอาจจะมีปัญหา',
    status: 2, // Processing
    status_text: 'กำลังดำเนินการ (Processing)',
    priority: 4, // High
    priority_text: 'สูง (High)',
    date: '2026-06-21 09:30:00',
    close_date: null,
    category: 'ฮาร์ดแวร์ / เครื่องคอมพิวเตอร์',
    item_name: 'PC-IT-SOMCHAI',
    item_serial: 'SN-7890-XYZ',
    item_type: 'Computer',
    item_id: 1,
    requester: 'สมชาย ใจดี',
    technician: 'ประสิทธิ์ งานดี (IT Support)',
    solution: null
  },
  {
    id: 102,
    name: 'ต้องการติดตั้งโปรแกรม Adobe Acrobat Pro ลิขสิทธิ์บริษัท',
    content: 'เนื่องจากต้องใช้งานตรวจทานและเซ็นเอกสารสัญญาทางการเงินเป็นประจำ จึงต้องการให้ทีม IT ติดตั้ง Adobe Acrobat Pro และลงทะเบียน License ของบริษัทให้เรียบร้อย',
    status: 5, // Solved
    status_text: 'แก้ไขแล้ว (Solved)',
    priority: 3, // Medium
    priority_text: 'ปานกลาง (Medium)',
    date: '2026-06-20 13:15:00',
    close_date: '2026-06-20 15:00:00',
    category: 'ซอฟต์แวร์ / ติดตั้งโปรแกรม',
    item_name: 'PC-FIN-NAREE',
    item_serial: 'SN-4567-DEF',
    item_type: 'Computer',
    item_id: 3,
    requester: 'นารี รักเรียน',
    technician: 'สมคิด ว่องไว (System Admin)',
    solution: 'ดำเนินการติดตั้ง Adobe Acrobat Pro ผ่านระบบคลาวด์ลงบนเครื่องเรียบร้อยแล้ว ได้ทำการลงชื่อเข้าใช้งานด้วย Email บริษัท นารี รักเรียน (naree.r@company.com) เรียบร้อย สิทธิ์ใช้งานถูกต้อง และผู้ใช้ยืนยันใช้งานได้ปกติ'
  },
  {
    id: 103,
    name: 'หน้าจอติดๆ ดับๆ และมีเส้นสีเขียวแนวตั้งขึ้นกลางจอ',
    content: 'ใช้งานหน้าจอนอกต่อแยกจาก Latitude 3440 แล้วเจอปัญหาจอกระพริบบ่อยครั้ง และมีเส้นสีเขียวลากยาวแนวตั้งอยู่ตรงกลางจอ ลองเปลี่ยนสาย HDMI แล้วไม่หาย คาดว่าหน้าจอน่าจะเสื่อมสภาพ',
    status: 1, // New
    status_text: 'ใหม่ (New)',
    priority: 3, // Medium
    priority_text: 'ปานกลาง (Medium)',
    date: '2026-06-22 08:00:00',
    close_date: null,
    category: 'ฮาร์ดแวร์ / จอภาพ (Monitor)',
    item_name: 'PC-SALES-KITTI',
    item_serial: 'SN-8822-SLS',
    item_type: 'Computer',
    item_id: 6,
    requester: 'กิตติศักดิ์ พรหมมา',
    technician: 'ยังไม่ได้มอบหมาย',
    solution: null
  },
  {
    id: 104,
    name: 'ไม่สามารถเข้าใช้งานระบบ ERP ของบริษัทได้',
    content: 'หน้าเว็บบราวเซอร์ขึ้นแจ้งเตือนข้อผิดพลาดเกี่ยวกับการเชื่อมต่อเครือข่าย หรือ Connection Refused เฉพาะเครื่องนี้เท่านั้น เครื่องข้างๆ ของแผนกเดียวกันเข้าได้ปกติ',
    status: 6, // Closed
    status_text: 'ปิดงาน (Closed)',
    priority: 5, // Very High
    priority_text: 'สูงมาก (Very High)',
    date: '2026-06-18 10:00:00',
    close_date: '2026-06-18 11:30:00',
    category: 'ระบบเครือข่าย / ระบบงานภายใน',
    item_name: 'NB-HR-WIPA',
    item_serial: 'SN-1234-ABC',
    item_type: 'Computer',
    item_id: 2,
    requester: 'วิภา แก้วดี',
    technician: 'สมคิด ว่องไว (System Admin)',
    solution: 'ตรวจสอบพบว่ามีการตั้งค่า Proxy Server ค้างอยู่ในเว็บบราวเซอร์ ซึ่งเป็นค่าจากเน็ตเวิร์กเก่า ได้ทำการปิด Proxy Configuration และล้างแคช DNS (ipconfig /flushdns) จากนั้นทดสอบเปิดเว็บอีกครั้ง สามารถใช้งานได้ตามปกติแล้ว'
  }
];

// Initialize Database Connection Pool
async function initializeDB() {
  if (pool) return pool;

  console.log(`[GLPI DB] Attempting to connect to MariaDB at ${dbConfig.host}:${dbConfig.port}...`);
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log(`[GLPI DB] Successfully connected to MariaDB: ${dbConfig.database}`);
    connection.release();
    useMockData = false;
    return pool;
  } catch (error) {
    console.error(`[GLPI DB] Connection failed: ${error.message}`);
    console.log(`[GLPI DB] >>> FALLBACK: Running in Mock Data mode for demonstration <<<`);
    useMockData = true;
    pool = null;
    return null;
  }
}

// Check database mode status
async function getStatus() {
  await initializeDB();
  return {
    connected: !useMockData,
    mode: useMockData ? 'Mock Mode (Demo)' : 'MariaDB Active (Real GLPI)',
    host: dbConfig.host,
    database: dbConfig.database,
    user: dbConfig.user
  };
}

// Get computers list
async function getComputers(search = '') {
  await initializeDB();
  if (useMockData) {
    if (!search) return mockComputers;
    const term = search.toLowerCase();
    return mockComputers.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.serial.toLowerCase().includes(term) || 
      c.otherserial.toLowerCase().includes(term) ||
      c.username.toLowerCase().includes(term)
    );
  }

  try {
    let query = `
      SELECT 
        c.id, 
        c.name, 
        c.serial, 
        c.otherserial, 
        m.name AS manufacturer, 
        mo.name AS model,
        l.completename AS location,
        s.name AS state,
        u.realname AS username,
        u.firstname AS user_firstname,
        u.id AS user_id
      FROM glpi_computers c
      LEFT JOIN glpi_manufacturers m ON c.manufacturers_id = m.id
      LEFT JOIN glpi_computermodels mo ON c.computermodels_id = mo.id
      LEFT JOIN glpi_locations l ON c.locations_id = l.id
      LEFT JOIN glpi_states s ON c.states_id = s.id
      LEFT JOIN glpi_users u ON c.users_id = u.id
      WHERE c.is_deleted = 0
    `;

    const params = [];
    if (search) {
      query += ` AND (c.name LIKE ? OR c.serial LIKE ? OR c.otherserial LIKE ? OR u.realname LIKE ? OR u.firstname LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY c.id DESC LIMIT 100`;
    
    const [rows] = await pool.query(query, params);
    
    // Map rows to friendly format
    return rows.map(row => {
      const fullname = [row.user_firstname, row.username].filter(Boolean).join(' ');
      return {
        id: row.id,
        name: row.name || 'N/A',
        serial: row.serial || 'N/A',
        otherserial: row.otherserial || 'N/A',
        model: row.model || 'Generic Model',
        manufacturer: row.manufacturer || 'Generic',
        location: row.location || 'ไม่ระบุสถานที่',
        state: row.state || 'ไม่ระบุสถานะ',
        username: fullname || 'ไม่มีผู้ถือครอง',
        user_id: row.user_id || null,
        cpu: 'N/A', // Hardware details queried on computer detail page
        ram: 'N/A',
        storage: 'N/A',
        os: 'N/A',
        purchase_date: 'N/A',
        warranty: 'N/A'
      };
    });
  } catch (error) {
    console.error('Error fetching computers:', error);
    throw error;
  }
}

// Get computer detail (including components and details)
async function getComputerById(id) {
  await initializeDB();
  const numericId = parseInt(id);

  if (useMockData) {
    return mockComputers.find(c => c.id === numericId) || null;
  }

  try {
    // 1. Get basic computer details with user joins
    const hasTitles = await checkTableExists('glpi_usertitles');
    const hasGroups = await checkTableExists('glpi_groups');

    const basicQuery = `
      SELECT 
        c.id, 
        c.name, 
        c.serial, 
        c.otherserial, 
        m.name AS manufacturer, 
        mo.name AS model,
        l.completename AS location,
        s.name AS state,
        CONCAT(COALESCE(u.firstname, ''), ' ', COALESCE(u.realname, '')) AS username,
        u.id AS user_id,
        COALESCE(NULLIF(u.mobile, ''), NULLIF(u.phone, ''), 'N/A') AS user_phone,
        ue.email AS user_email,
        ${hasTitles ? 'ut.name' : 'NULL'} AS user_title,
        ${hasGroups ? '(SELECT g.name FROM glpi_groups_users gu JOIN glpi_groups g ON gu.groups_id = g.id WHERE gu.users_id = u.id LIMIT 1)' : 'NULL'} AS user_dept,
        c.comment,
        c.date_creation
      FROM glpi_computers c
      LEFT JOIN glpi_manufacturers m ON c.manufacturers_id = m.id
      LEFT JOIN glpi_computermodels mo ON c.computermodels_id = mo.id
      LEFT JOIN glpi_locations l ON c.locations_id = l.id
      LEFT JOIN glpi_states s ON c.states_id = s.id
      LEFT JOIN glpi_users u ON c.users_id = u.id
      LEFT JOIN glpi_useremails ue ON u.id = ue.users_id AND ue.is_default = 1
      ${hasTitles ? 'LEFT JOIN glpi_usertitles ut ON u.usertitles_id = ut.id' : ''}
      WHERE c.id = ? AND c.is_deleted = 0
    `;
    const [basicRows] = await pool.query(basicQuery, [numericId]);
    if (basicRows.length === 0) return null;

    const row = basicRows[0];
    const usernameVal = row.username ? row.username.trim() : '';

    const computer = {
      id: row.id,
      name: row.name || 'N/A',
      serial: row.serial || 'N/A',
      otherserial: row.otherserial || 'N/A',
      model: row.model || 'Generic Model',
      manufacturer: row.manufacturer || 'Generic',
      location: row.location || 'ไม่ระบุสถานที่',
      state: row.state || 'ไม่ระบุสถานะ',
      user_id: row.user_id || null,
      username: usernameVal || 'ไม่มีผู้ถือครอง',
      user_phone: row.user_phone || 'N/A',
      user_email: row.user_email || 'N/A',
      user_title: row.user_title || 'พนักงาน',
      user_dept: row.user_dept || 'สำนักงานใหญ่',
      comment: row.comment || '',
      date_creation: row.date_creation,
      cpu: 'ไม่ระบุ (N/A)',
      ram: 'ไม่ระบุ (N/A)',
      storage: 'ไม่ระบุ (N/A)',
      os: 'ไม่ระบุ (N/A)',
      purchase_date: 'ไม่ระบุ (N/A)',
      warranty: 'ไม่ระบุ (N/A)'
    };

    // 2. Fetch Operating System info (Defensively)
    try {
      const osQuery = `
        SELECT o.name AS os_name, v.name AS os_version 
        FROM glpi_items_operatingsystems ios
        JOIN glpi_operatingsystems o ON ios.operatingsystems_id = o.id
        LEFT JOIN glpi_operatingsystemversions v ON ios.operatingsystemversions_id = v.id
        WHERE ios.items_id = ? AND ios.itemtype = 'Computer'
        LIMIT 1
      `;
      const [osRows] = await pool.query(osQuery, [numericId]);
      if (osRows.length > 0) {
        computer.os = [osRows[0].os_name, osRows[0].os_version].filter(Boolean).join(' ');
      }
    } catch (e) {
      console.warn('Could not query OS from glpi_items_operatingsystems', e.message);
    }

    // 3. Fetch CPU (Defensively)
    try {
      const cpuQuery = `
        SELECT d.designation AS cpu_name 
        FROM glpi_items_deviceprocessors idp
        JOIN glpi_deviceprocessors d ON idp.deviceprocessors_id = d.id
        WHERE idp.items_id = ? AND idp.itemtype = 'Computer'
        LIMIT 1
      `;
      const [cpuRows] = await pool.query(cpuQuery, [numericId]);
      if (cpuRows.length > 0) {
        computer.cpu = cpuRows[0].cpu_name;
      }
    } catch (e) {
      console.warn('Could not query CPU details', e.message);
    }

    // 4. Fetch RAM (Defensively)
    try {
      const ramQuery = `
        SELECT SUM(idm.size) AS total_ram, d.designation AS ram_type 
        FROM glpi_items_devicememories idm
        LEFT JOIN glpi_devicememories d ON idm.devicememories_id = d.id
        WHERE idm.items_id = ? AND idm.itemtype = 'Computer'
        GROUP BY idm.devicememories_id, d.designation
      `;
      const [ramRows] = await pool.query(ramQuery, [numericId]);
      if (ramRows.length > 0) {
        // Sum total ram across sticks
        const totalSize = ramRows.reduce((acc, curr) => acc + parseInt(curr.total_ram || 0), 0);
        const ramType = ramRows[0].ram_type || '';
        computer.ram = `${totalSize > 0 ? totalSize + ' MB' : 'ไม่ระบุ'} ${ramType}`.trim();
      }
    } catch (e) {
      console.warn('Could not query RAM details', e.message);
    }

    // 5. Fetch Storage (Defensively)
    try {
      const storageQuery = `
        SELECT SUM(ids.size) AS total_storage, d.designation AS storage_type 
        FROM glpi_items_devicesensordrives ids
        LEFT JOIN glpi_devicesensordrives d ON ids.devicesensordrives_id = d.id
        WHERE ids.items_id = ? AND ids.itemtype = 'Computer'
        GROUP BY ids.devicesensordrives_id, d.designation
      `;
      const [storageRows] = await pool.query(storageQuery, [numericId]);
      if (storageRows.length > 0) {
        const totalSize = storageRows.reduce((acc, curr) => acc + parseInt(curr.total_storage || 0), 0);
        const storageType = storageRows[0].storage_type || 'SSD/HDD';
        computer.storage = `${totalSize > 0 ? (totalSize / 1024).toFixed(0) + ' GB' : 'ไม่ระบุ'} (${storageType})`;
      }
    } catch (e) {
      // Try fallback to glpi_items_deviceharddrives if older version of GLPI
      try {
        const hddQuery = `
          SELECT SUM(idh.capacity) AS total_storage 
          FROM glpi_items_deviceharddrives idh
          WHERE idh.items_id = ? AND idh.itemtype = 'Computer'
        `;
        const [hddRows] = await pool.query(hddQuery, [numericId]);
        if (hddRows.length > 0 && hddRows[0].total_storage) {
          computer.storage = `${(parseInt(hddRows[0].total_storage) / 1024).toFixed(0)} GB SSD/HDD`;
        }
      } catch (e2) {
        console.warn('Could not query Storage details from both sensory and harddrive tables', e2.message);
      }
    }

    // 6. Fetch Purchase Date & Warranty info (Defensively)
    try {
      const infonetQuery = `
        SELECT buy_date AS date_purchase, warranty_duration 
        FROM glpi_infocoms 
        WHERE items_id = ? AND itemtype = 'Computer'
        LIMIT 1
      `;
      const [infoRows] = await pool.query(infonetQuery, [numericId]);
      if (infoRows.length > 0 && infoRows[0].date_purchase) {
        computer.purchase_date = infoRows[0].date_purchase.toISOString().split('T')[0];
        const duration = infoRows[0].warranty_duration;
        computer.warranty = duration ? `${duration} เดือน` : 'ไม่ระบุประกัน';
      }
    } catch (e) {
      console.warn('Could not query infocomms details', e.message);
    }

    return computer;
  } catch (error) {
    console.error(`Error fetching computer detail for id ${id}:`, error);
    throw error;
  }
}

// Get tickets list
async function getTickets(status = null, priority = null, search = '') {
  await initializeDB();
  if (useMockData) {
    let result = mockTickets;
    if (status) result = result.filter(t => t.status === parseInt(status));
    if (priority) result = result.filter(t => t.priority === parseInt(priority));
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(term) || 
        t.content.toLowerCase().includes(term) || 
        t.requester.toLowerCase().includes(term) ||
        (t.item_name && t.item_name.toLowerCase().includes(term))
      );
    }
    return result;
  }

  try {
    let query = `
      SELECT 
        t.id, 
        t.name, 
        t.content, 
        t.status, 
        t.priority, 
        t.date, 
        t.closedate,
        tc.name AS category,
        it.items_id AS item_id,
        it.itemtype AS item_type,
        c.name AS item_name,
        c.serial AS item_serial
      FROM glpi_tickets t
      LEFT JOIN glpi_itilcategories tc ON t.itilcategories_id = tc.id
      LEFT JOIN glpi_items_tickets it ON t.id = it.tickets_id AND it.itemtype = 'Computer'
      LEFT JOIN glpi_computers c ON it.items_id = c.id
      WHERE t.is_deleted = 0
    `;

    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('t.status = ?');
      params.push(parseInt(status));
    }
    if (priority) {
      conditions.push('t.priority = ?');
      params.push(parseInt(priority));
    }
    if (search) {
      conditions.push('(t.name LIKE ? OR t.content LIKE ? OR c.name LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.id DESC LIMIT 100';

    const [rows] = await pool.query(query, params);

    // Friendly mapping and status definitions
    const statusMap = {
      1: 'ใหม่ (New)',
      2: 'กำลังดำเนินการ (Processing)',
      3: 'รอดำเนินการ (Pending)',
      4: 'วางแผน (Planned)',
      5: 'แก้ไขแล้ว (Solved)',
      6: 'ปิดงาน (Closed)'
    };
    const priorityMap = {
      1: 'ต่ำมาก (Very Low)',
      2: 'ต่ำ (Low)',
      3: 'ปานกลาง (Medium)',
      4: 'สูง (High)',
      5: 'สูงมาก (Very High)'
    };

    const tickets = [];

    for (const row of rows) {
      // Fetch requester and technician
      let requester = 'ไม่ทราบผู้แจ้ง';
      let technician = 'ยังไม่ได้มอบหมาย';

      try {
        const usersQuery = `
          SELECT u.realname, u.firstname, tu.type 
          FROM glpi_tickets_users tu
          JOIN glpi_users u ON tu.users_id = u.id
          WHERE tu.tickets_id = ?
        `;
        const [userRows] = await pool.query(usersQuery, [row.id]);
        
        const requesters = userRows.filter(u => u.type === 1).map(u => [u.firstname, u.realname].filter(Boolean).join(' '));
        const technicians = userRows.filter(u => u.type === 2).map(u => [u.firstname, u.realname].filter(Boolean).join(' '));
        
        if (requesters.length > 0) requester = requesters.join(', ');
        if (technicians.length > 0) technician = technicians.join(', ');
      } catch (e) {
        console.warn('Could not query users associated with ticket', e.message);
      }

      tickets.push({
        id: row.id,
        name: row.name || 'N/A',
        content: row.content || '',
        status: row.status,
        status_text: statusMap[row.status] || `สถานะ ${row.status}`,
        priority: row.priority,
        priority_text: priorityMap[row.priority] || `ระดับ ${row.priority}`,
        date: row.date,
        close_date: row.closedate,
        category: row.category || 'ทั่วไป / อื่นๆ',
        item_name: row.item_name || null,
        item_serial: row.item_serial || null,
        item_type: row.item_type || null,
        item_id: row.item_id || null,
        requester,
        technician,
        solution: null // Queried in ticket detail page
      });
    }

    return tickets;
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
}

// Get ticket detail with solution
async function getTicketById(id) {
  await initializeDB();
  const numericId = parseInt(id);

  if (useMockData) {
    return mockTickets.find(t => t.id === numericId) || null;
  }

  try {
    // 1. Get base ticket
    const tickets = await getTickets(null, null, '');
    const ticket = tickets.find(t => t.id === numericId);
    if (!ticket) return null;

    // 2. Fetch Solution (Defensively)
    try {
      const solutionQuery = `
        SELECT content 
        FROM glpi_itilsolutions 
        WHERE items_id = ? AND itemtype = 'Ticket'
        LIMIT 1
      `;
      const [solRows] = await pool.query(solutionQuery, [numericId]);
      if (solRows.length > 0) {
        // Strip HTML tags from solution content if any, or keep it
        ticket.solution = solRows[0].content.replace(/<[^>]*>/g, '').trim();
      }
    } catch (e) {
      console.warn('Could not query solution details', e.message);
    }

    return ticket;
  } catch (error) {
    console.error(`Error fetching ticket detail for id ${id}:`, error);
    throw error;
  }
}

// Get users list
async function getUsers() {
  await initializeDB();
  if (useMockData) return mockUsers;

  try {
    const hasTitles = await checkTableExists('glpi_usertitles');
    const hasGroups = await checkTableExists('glpi_groups');

    const query = `
      SELECT 
        u.id, 
        u.realname, 
        u.firstname, 
        COALESCE(NULLIF(u.mobile, ''), NULLIF(u.phone, ''), 'N/A') AS phone, 
        ue.email, 
        u.name AS username,
        ${hasTitles ? 'ut.name' : 'NULL'} AS title,
        ${hasGroups ? '(SELECT g.name FROM glpi_groups_users gu JOIN glpi_groups g ON gu.groups_id = g.id WHERE gu.users_id = u.id LIMIT 1)' : 'NULL'} AS department
      FROM glpi_users u
      LEFT JOIN glpi_useremails ue ON u.id = ue.users_id AND ue.is_default = 1
      ${hasTitles ? 'LEFT JOIN glpi_usertitles ut ON u.usertitles_id = ut.id' : ''}
      WHERE u.is_deleted = 0 AND u.is_active = 1
      ORDER BY u.realname ASC, u.firstname ASC
      LIMIT 200
    `;
    const [rows] = await pool.query(query);

    return rows.map(row => {
      const fullname = [row.firstname, row.realname].filter(Boolean).join(' ');
      return {
        id: row.id,
        name: fullname || row.username,
        email: row.email || 'N/A',
        phone: row.phone || 'N/A',
        department: row.department || 'สำนักงานใหญ่',
        title: row.title || 'พนักงาน'
      };
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Helper to check table existence dynamically
async function checkTableExists(tableName) {
  if (useMockData || !pool) return false;
  try {
    const [rows] = await pool.query('SHOW TABLES LIKE ?', [tableName]);
    return rows.length > 0;
  } catch (e) {
    return false;
  }
}

// Get rich computers asset list with details, specs, user details, and management info
async function getRichAssets() {
  await initializeDB();
  
  if (useMockData) {
    return mockComputers.map(c => {
      const u = mockUsers.find(user => user.id === c.user_id) || {};
      return {
        id: c.id,
        name: c.name,
        serial: c.serial,
        otherserial: c.otherserial,
        manufacturer: c.manufacturer,
        model: c.model,
        location: c.location,
        state: c.state,
        username: c.username,
        user_title: u.title || 'พนักงาน',
        user_dept: u.department || 'สำนักงานใหญ่',
        user_phone: u.phone || 'N/A',
        user_email: u.email || 'N/A',
        os: c.os,
        cpu: c.cpu,
        ram: c.ram,
        storage: c.storage,
        buy_date: c.purchase_date,
        use_date: c.purchase_date,
        delivery_date: c.purchase_date,
        order_date: c.purchase_date,
        warranty_duration: 36,
        value: 15000 + (c.id * 3450),
        buy_number: 'PO-2025-' + c.id.toString().padStart(3, '0'),
        bill: 'TAX-2025-' + c.id.toString().padStart(3, '0'),
        supplier_name: c.manufacturer === 'Apple' ? 'Apple Store Thailand' : 'IT City Co., Ltd.'
      };
    });
  }

  try {
    // 1. Check table existences dynamically to build safe subqueries
    const hasSensorDrives = await checkTableExists('glpi_items_devicesensordrives');
    const hasHardDrives = await checkTableExists('glpi_items_deviceharddrives');
    const hasMemories = await checkTableExists('glpi_items_devicememories');
    const hasProcessors = await checkTableExists('glpi_items_deviceprocessors');
    const hasOS = await checkTableExists('glpi_items_operatingsystems');
    const hasInfo = await checkTableExists('glpi_infocoms');
    const hasSuppliers = await checkTableExists('glpi_suppliers');
    const hasTitles = await checkTableExists('glpi_usertitles');
    const hasGroups = await checkTableExists('glpi_groups');

    // 2. Build subqueries dynamically
    const osSub = hasOS 
      ? `(SELECT CONCAT(o.name, ' ', COALESCE(ov.name, '')) FROM glpi_items_operatingsystems ios JOIN glpi_operatingsystems o ON ios.operatingsystems_id = o.id LEFT JOIN glpi_operatingsystemversions ov ON ios.operatingsystemversions_id = ov.id WHERE ios.items_id = c.id AND ios.itemtype = 'Computer' LIMIT 1)`
      : `NULL`;

    const cpuSub = hasProcessors 
      ? `(SELECT dp.designation FROM glpi_items_deviceprocessors idp JOIN glpi_deviceprocessors dp ON idp.deviceprocessors_id = dp.id WHERE idp.items_id = c.id AND idp.itemtype = 'Computer' LIMIT 1)`
      : `NULL`;

    const ramSub = hasMemories 
      ? `(SELECT CONCAT(SUM(idm.size), ' MB') FROM glpi_items_devicememories idm WHERE idm.items_id = c.id AND idm.itemtype = 'Computer')`
      : `NULL`;

    let storageSub = `NULL`;
    if (hasSensorDrives) {
      storageSub = `(SELECT CONCAT(ROUND(SUM(ids.size)/1024), ' GB') FROM glpi_items_devicesensordrives ids WHERE ids.items_id = c.id AND ids.itemtype = 'Computer')`;
    } else if (hasHardDrives) {
      storageSub = `(SELECT CONCAT(ROUND(SUM(idh.capacity)/1024), ' GB') FROM glpi_items_deviceharddrives idh WHERE idh.items_id = c.id AND idh.itemtype = 'Computer')`;
    }

    const deptSub = hasGroups
      ? `(SELECT GROUP_CONCAT(g.name SEPARATOR ', ') FROM glpi_groups_users gu JOIN glpi_groups g ON gu.groups_id = g.id WHERE gu.users_id = u.id)`
      : `NULL`;

    // 3. Build main query
    let selectFields = `
      c.id, 
      c.name, 
      c.serial, 
      c.otherserial, 
      m.name AS manufacturer, 
      mo.name AS model,
      l.completename AS location,
      s.name AS state,
      CONCAT(COALESCE(u.firstname, ''), ' ', COALESCE(u.realname, '')) AS username,
      u.phone AS user_phone,
      ue.email AS user_email,
      ${hasTitles ? 'ut.name' : 'NULL'} AS user_title,
      ${deptSub} AS user_dept,
      ${osSub} AS os,
      ${cpuSub} AS cpu,
      ${ramSub} AS ram,
      ${storageSub} AS storage
    `;

    let joinTables = `
      FROM glpi_computers c
      LEFT JOIN glpi_manufacturers m ON c.manufacturers_id = m.id
      LEFT JOIN glpi_computermodels mo ON c.computermodels_id = mo.id
      LEFT JOIN glpi_locations l ON c.locations_id = l.id
      LEFT JOIN glpi_states s ON c.states_id = s.id
      LEFT JOIN glpi_users u ON c.users_id = u.id
      LEFT JOIN glpi_useremails ue ON u.id = ue.users_id AND ue.is_default = 1
    `;

    if (hasTitles) {
      joinTables += ` LEFT JOIN glpi_usertitles ut ON u.usertitles_id = ut.id`;
    }

    // Dynamic joins for management (infocomms and suppliers)
    if (hasInfo) {
      selectFields += `,
        info.buy_date,
        info.use_date,
        info.delivery_date,
        info.order_date,
        info.warranty_duration,
        info.value,
        info.order_number,
        info.bill
      `;
      joinTables += `
        LEFT JOIN glpi_infocoms info ON c.id = info.items_id AND info.itemtype = 'Computer'
      `;

      if (hasSuppliers) {
        selectFields += `, sup.name AS supplier_name`;
        joinTables += `
          LEFT JOIN glpi_suppliers sup ON info.suppliers_id = sup.id
        `;
      } else {
        selectFields += `, NULL AS supplier_name`;
      }
    } else {
      selectFields += `,
        NULL AS buy_date,
        NULL AS use_date,
        NULL AS delivery_date,
        NULL AS order_date,
        NULL AS warranty_duration,
        NULL AS value,
        NULL AS buy_number,
        NULL AS bill,
        NULL AS supplier_name
      `;
    }

    const query = `
      SELECT ${selectFields}
      ${joinTables}
      WHERE c.is_deleted = 0
      ORDER BY c.id DESC
    `;

    const [rows] = await pool.query(query);

    // Clean up dates and values for frontend consumption
    return rows.map(row => {
      // Format username nicely (trim space)
      const username = (row.username || '').trim() || 'ไม่มีผู้ถือครอง';
      
      return {
        ...row,
        username,
        user_title: row.user_title || 'พนักงาน',
        user_dept: row.user_dept || 'สำนักงานใหญ่',
        user_phone: row.user_phone || 'N/A',
        user_email: row.user_email || 'N/A',
        buy_date: row.buy_date ? row.buy_date.toISOString().split('T')[0] : 'N/A',
        use_date: row.use_date ? row.use_date.toISOString().split('T')[0] : 'N/A',
        delivery_date: row.delivery_date ? row.delivery_date.toISOString().split('T')[0] : 'N/A',
        order_date: row.order_date ? row.order_date.toISOString().split('T')[0] : 'N/A',
        value: row.value ? parseFloat(row.value).toLocaleString() : 'N/A',
        warranty_duration: row.warranty_duration ? `${row.warranty_duration} เดือน` : 'N/A',
        buy_number: row.order_number || 'N/A',
        bill: row.bill || 'N/A',
        supplier_name: row.supplier_name || 'N/A'
      };
    });
  } catch (error) {
    console.error('Error fetching rich assets:', error);
    throw error;
  }
}

module.exports = {
  getStatus,
  getComputers,
  getComputerById,
  getTickets,
  getTicketById,
  getUsers,
  getRichAssets
};

