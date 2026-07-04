const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.get('/api/status', async (req, res) => {
  try {
    const status = await db.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/computers', async (req, res) => {
  try {
    const search = req.query.search || '';
    const computers = await db.getComputers(search);
    res.json(computers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/computers/:id', async (req, res) => {
  try {
    const computer = await db.getComputerById(req.params.id);
    if (!computer) {
      return res.status(404).json({ error: 'ไม่พบคอมพิวเตอร์เครื่องนี้ในระบบ' });
    }
    res.json(computer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const status = req.query.status || null;
    const priority = req.query.priority || null;
    const search = req.query.search || '';
    const tickets = await db.getTickets(status, priority, search);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await db.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'ไม่พบตั๋วแจ้งซ่อมรายการนี้ในระบบ' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assets/rich-data', async (req, res) => {
  try {
    const assets = await db.getRichAssets();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Serve frontend static build files in production
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Fallback all other routes to React SPA index.html in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` GLPI 11 Report Server is running!`);
  console.log(` Port: http://localhost:${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});
