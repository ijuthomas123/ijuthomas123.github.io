// PEBEC ReportGov Backend - by Ijudigal Thomas
// Node.js + Express - Full-Stack Sample
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Security: XSS sanitization
function clean(s) {
  if (!s) return '';
  return String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

// Load DB
let dbPath = path.join(__dirname, 'database.json');
function loadDB() {
  try { return JSON.parse(fs.readFileSync(dbPath, 'utf8')); }
  catch(e) { return { reports: [], users: [{ email: 'demo@pebec.ng', password: 'Demo123', role: 'admin' }] }; }
}
function saveDB(db) { fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); }

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'PEBEC ReportGov API', by: 'Ijudigal Thomas', time: new Date().toISOString() });
});

// 2. Create report - with validation
app.post('/api/reports', (req, res) => {
  let { name, mda, state, type, issue } = req.body;
  if (!name || name.length < 2) return res.status(400).json({ error: 'Name required, min 2 chars' });
  if (!issue || issue.length < 10) return res.status(400).json({ error: 'Issue must be at least 10 characters' });
  let db = loadDB();
  let id = 'PEBEC-2026-' + Math.floor(1000 + Math.random() * 9000);
  let report = {
    id,
    name: clean(name),
    mda: clean(mda || 'Others'),
    state: clean(state || 'Others'),
    type: clean(type || 'Others'),
    issue: clean(issue),
    status: 'Received',
    createdAt: new Date().toISOString(),
    slaDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
  };
  db.reports.push(report);
  saveDB(db);
  res.json({ success: true, trackingId: id, report });
});

// 3. Get all reports
app.get('/api/reports', (req, res) => {
  let db = loadDB();
  res.json({ total: db.reports.length, reports: db.reports });
});

// 4. Get one report by ID
app.get('/api/reports/:id', (req, res) => {
  let db = loadDB();
  let found = db.reports.find(r => r.id === req.params.id);
  if (!found) return res.status(404).json({ error: 'Report not found' });
  res.json(found);
});

// 5. Login - Role Based
app.post('/api/login', (req, res) => {
  let { email, password } = req.body;
  let db = loadDB();
  let user = db.users.find(u => u.email === clean(email) && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ success: true, message: 'Welcome ' + user.role, user: { email: user.email, role: user.role } });
});

// 6. Stats for Leaderboard / Dashboard
app.get('/api/stats', (req, res) => {
  let db = loadDB();
  res.json({
    totalReports: db.reports.length,
    mdas: 69,
    resolved: db.reports.filter(r => r.status === 'Resolved').length,
    avgResponse: '48hrs',
    slaTarget: '72hrs'
  });
});

app.get('/', (req, res) => {
  res.send('PEBEC ReportGov Backend is LIVE - by Ijudigal Thomas - Try /api/health');
});

app.listen(PORT, () => console.log('PEBEC Backend running on port ' + PORT));
