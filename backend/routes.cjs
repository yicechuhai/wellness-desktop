const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db.cjs');
const router = express.Router();

router.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'wellness-desktop-secret-key-2026';

// ========== AUTH HELPERS ==========
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// ========== AUTH ==========
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM user WHERE username = ? AND status = 'active'").get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

router.get('/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, name, role, status, phone FROM user WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ========== USERS CRUD (admin only) ==========
router.get('/users', authMiddleware, requireRole(['admin']), (req, res) => {
  res.json(db.prepare('SELECT id, username, name, role, status, phone, created_at FROM user ORDER BY created_at DESC').all());
});

router.post('/users', authMiddleware, requireRole(['admin']), (req, res) => {
  const { username, password, name, role, phone } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'Username, password and name are required' });
  const existing = db.prepare('SELECT id FROM user WHERE username = ?').get(username);
  if (existing) return res.status(400).json({ error: 'Username already exists' });
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO user (username, password_hash, name, role, phone) VALUES (?,?,?,?,?)').run(username, hash, name, role || 'therapist', phone || '');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/users/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  const { name, role, status, phone } = req.body;
  db.prepare('UPDATE user SET name=?, role=?, status=?, phone=? WHERE id=?').run(name, role, status, phone || '', req.params.id);
  res.json({ success: true });
});

router.put('/users/:id/password', authMiddleware, (req, res) => {
  // Allow users to change their own password, or admin to change any
  if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) return res.status(403).json({ error: 'Forbidden' });
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE user SET password_hash = ? WHERE id = ?').run(hash, req.params.id);
  res.json({ success: true });
});

router.delete('/users/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  db.prepare('DELETE FROM user WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========== DASHBOARD ==========
router.get('/dashboard', authMiddleware, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const svcs = db.prepare('SELECT * FROM service_record WHERE date = ?').all(today);
  const sales = db.prepare('SELECT * FROM sale_record WHERE date = ?').all(today);
  const tc = db.prepare('SELECT COUNT(*) as c FROM customer').get();
  const pt = db.prepare("SELECT COUNT(*) as c FROM followup_task WHERE status = 'pending'").get();
  const ws = sales.filter(s => s.business_line === 'wellness');
  const cs = sales.filter(s => s.business_line === 'clinic');
  res.json({
    today: { serviceCount: svcs.length, wellnessRevenue: ws.reduce((s, r) => s + (r.total_amount || 0), 0), clinicRevenue: cs.reduce((s, r) => s + (r.total_amount || 0), 0), wellnessCash: ws.reduce((s, r) => s + (r.cash_amount || 0), 0), wellnessPos: ws.reduce((s, r) => s + (r.pos_amount || 0), 0), clinicCash: cs.reduce((s, r) => s + (r.cash_amount || 0), 0), clinicPos: cs.reduce((s, r) => s + (r.pos_amount || 0), 0), saleCount: sales.length },
    overview: { totalCustomers: tc.c, pendingTasks: pt.c },
    upcomingTasks: db.prepare("SELECT * FROM followup_task WHERE status = 'pending' ORDER BY due_date LIMIT 10").all(),
    expiringCards: db.prepare("SELECT * FROM membership_card WHERE remaining_times <= 2 AND status = 'active' ORDER BY expire_date LIMIT 10").all(),
  });
});

// ========== CUSTOMERS CRUD ==========
router.get('/customers', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM customer ORDER BY created_at DESC LIMIT 200').all());
});

router.post('/customers', authMiddleware, requireRole(['admin', 'manager', 'reception']), (req, res) => {
  const { name, phone, wechat, type, source, concern, first_visit_date, last_visit_date, owner_staff, note } = req.body;
  const result = db.prepare('INSERT INTO customer (name, phone, wechat, type, source, concern, first_visit_date, last_visit_date, owner_staff, note) VALUES (?,?,?,?,?,?,?,?,?,?)').run(name, phone || '', wechat || '', type || 'new', source || 'walk_in', concern || '', first_visit_date || '', last_visit_date || '', owner_staff || '', note || '');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/customers/:id', authMiddleware, requireRole(['admin', 'manager', 'reception']), (req, res) => {
  const { name, phone, wechat, type, source, concern, first_visit_date, last_visit_date, owner_staff, note } = req.body;
  db.prepare('UPDATE customer SET name=?, phone=?, wechat=?, type=?, source=?, concern=?, first_visit_date=?, last_visit_date=?, owner_staff=?, note=? WHERE id=?').run(name, phone || '', wechat || '', type || 'new', source || 'walk_in', concern || '', first_visit_date || '', last_visit_date || '', owner_staff || '', note || '', req.params.id);
  res.json({ success: true });
});

router.delete('/customers/:id', authMiddleware, requireRole(['admin', 'manager']), (req, res) => {
  db.prepare('DELETE FROM customer WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========== SERVICE RECORDS CRUD ==========
router.get('/services', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM service_record ORDER BY date DESC, created_at DESC LIMIT 200').all());
});

router.post('/services', authMiddleware, requireRole(['admin', 'manager', 'therapist', 'reception']), (req, res) => {
  const { date, customer_name, customer_type, service_item, therapist, card_amount, quantity, is_gift, note } = req.body;
  let cust = db.prepare('SELECT id, type FROM customer WHERE name = ?').get(customer_name);
  let custId = cust ? cust.id : null;
  let custType = customer_type || (cust ? cust.type : 'new');
  const result = db.prepare('INSERT INTO service_record (date, customer_id, customer_name, customer_type, service_item, therapist, card_amount, quantity, is_gift, note) VALUES (?,?,?,?,?,?,?,?,?,?)').run(date, custId, customer_name, custType, service_item, therapist || '', card_amount || 0, quantity || 1, is_gift ? 1 : 0, note || '');
  if (custId) db.prepare('UPDATE customer SET last_visit_date = ? WHERE id = ?').run(date, custId);
  if (!is_gift && service_item) {
    const card = db.prepare("SELECT * FROM membership_card WHERE customer_name = ? AND applicable_items LIKE ? AND remaining_times > 0 AND status = 'active' ORDER BY expire_date").get(customer_name, `%${service_item}%`);
    if (card) {
      const newUsed = (card.used_times || 0) + (quantity || 1);
      const newRem = (card.total_times || 0) + (card.gift_times || 0) - newUsed;
      db.prepare('UPDATE membership_card SET used_times = ?, remaining_times = ?, status = ? WHERE id = ?').run(newUsed, newRem, newRem <= 0 ? 'used_up' : newRem <= 2 ? 'expiring' : 'active', card.id);
    }
  }
  res.json({ success: true, id: result.lastInsertRowid });
});

router.delete('/services/:id', authMiddleware, requireRole(['admin', 'manager']), (req, res) => {
  db.prepare('DELETE FROM service_record WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========== SALE RECORDS CRUD ==========
router.get('/sales', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM sale_record ORDER BY date DESC, created_at DESC LIMIT 200').all());
});

router.post('/sales', authMiddleware, requireRole(['admin', 'manager', 'reception']), (req, res) => {
  const { date, business_line, customer_name, item, cash_amount, pos_amount, total_amount, card_times, seller, note } = req.body;
  const result = db.prepare('INSERT INTO sale_record (date, business_line, customer_name, item, cash_amount, pos_amount, total_amount, card_times, seller, note) VALUES (?,?,?,?,?,?,?,?,?,?)').run(date, business_line || 'wellness', customer_name, item, cash_amount || 0, pos_amount || 0, total_amount || 0, card_times || 0, seller || '', note || '');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.delete('/sales/:id', authMiddleware, requireRole(['admin', 'manager']), (req, res) => {
  db.prepare('DELETE FROM sale_record WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========== MEMBERSHIP CARDS CRUD ==========
router.get('/cards', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM membership_card ORDER BY created_at DESC LIMIT 200').all());
});

router.post('/cards', authMiddleware, requireRole(['admin', 'manager', 'reception']), (req, res) => {
  const { customer_name, card_name, purchase_amount, total_times, gift_times, applicable_items, expire_date } = req.body;
  const cust = db.prepare('SELECT id FROM customer WHERE name = ?').get(customer_name);
  const total = parseInt(total_times) || 0;
  const gift = parseInt(gift_times) || 0;
  const result = db.prepare('INSERT INTO membership_card (customer_id, customer_name, card_name, purchase_amount, total_times, gift_times, used_times, remaining_times, applicable_items, expire_date, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(cust ? cust.id : null, customer_name, card_name, purchase_amount || 0, total, gift, 0, total + gift, applicable_items || '', expire_date, 'active');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.delete('/cards/:id', authMiddleware, requireRole(['admin', 'manager']), (req, res) => {
  db.prepare('DELETE FROM membership_card WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========== FOLLOWUP TASKS CRUD ==========
router.get('/followups', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM followup_task ORDER BY created_at DESC LIMIT 200').all());
});

router.post('/followups', authMiddleware, requireRole(['admin', 'manager', 'therapist']), (req, res) => {
  const { customer_name, task_type, due_date, reason, suggested_message, owner_staff } = req.body;
  const cust = db.prepare('SELECT id FROM customer WHERE name = ?').get(customer_name);
  const result = db.prepare('INSERT INTO followup_task (customer_id, customer_name, task_type, due_date, reason, suggested_message, status, owner_staff) VALUES (?,?,?,?,?,?,?,?)').run(cust ? cust.id : null, customer_name, task_type, due_date, reason || '', suggested_message || '', 'pending', owner_staff || '');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/followups/:id/done', authMiddleware, (req, res) => {
  db.prepare('UPDATE followup_task SET status = ? WHERE id = ?').run('done', req.params.id);
  res.json({ success: true });
});

router.delete('/followups/:id', authMiddleware, requireRole(['admin', 'manager']), (req, res) => {
  db.prepare('DELETE FROM followup_task WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========== SERVICE ITEMS CRUD ==========
router.get('/items', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM service_item ORDER BY created_at DESC').all());
});

router.post('/items', authMiddleware, requireRole(['admin', 'manager']), (req, res) => {
  const { name, single_price, package_price, package_times, activity_price, description, contraindication } = req.body;
  const result = db.prepare('INSERT INTO service_item (name, single_price, package_price, package_times, activity_price, description, contraindication) VALUES (?,?,?,?,?,?,?)').run(name, single_price || 0, package_price || 0, package_times || 10, activity_price || 0, description || '', contraindication || '');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/items/:id', authMiddleware, requireRole(['admin', 'manager']), (req, res) => {
  const { name, single_price, package_price, package_times, activity_price, description, contraindication } = req.body;
  db.prepare('UPDATE service_item SET name=?, single_price=?, package_price=?, package_times=?, activity_price=?, description=?, contraindication=? WHERE id=?').run(name, single_price || 0, package_price || 0, package_times || 10, activity_price || 0, description || '', contraindication || '', req.params.id);
  res.json({ success: true });
});

router.delete('/items/:id', authMiddleware, requireRole(['admin', 'manager']), (req, res) => {
  db.prepare('DELETE FROM service_item WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========== EXPORT ==========
router.get('/export/:table', authMiddleware, (req, res) => {
  const { table } = req.params;
  const allowed = ['customer', 'service_record', 'sale_record', 'membership_card', 'followup_task', 'service_item'];
  if (!allowed.includes(table)) return res.status(400).json({ error: 'Invalid table' });
  const rows = db.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC`).all();
  const XLSX = require('xlsx');
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, table);
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${table}_${new Date().toISOString().slice(0,10)}.xlsx`);
  res.send(buf);
});

// ========== SETTINGS ==========
router.get('/settings', authMiddleware, requireRole(['admin', 'manager']), (req, res) => {
  const rows = db.prepare('SELECT * FROM system_setting').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

router.put('/settings/:key', authMiddleware, requireRole(['admin', 'manager']), (req, res) => {
  const { value } = req.body;
  db.prepare('INSERT OR REPLACE INTO system_setting (key, value, updated_at) VALUES (?,?,unixepoch())').run(req.params.key, value);
  res.json({ success: true });
});

module.exports = { router, authMiddleware };
