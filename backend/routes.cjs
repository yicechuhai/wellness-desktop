const express = require('express');
const db = require('./db.cjs');
const router = express.Router();

router.use(express.json());

// ===== Dashboard =====
router.get('/dashboard', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const svcs = db.prepare('SELECT * FROM service_record WHERE date = ?').all(today);
  const sales = db.prepare('SELECT * FROM sale_record WHERE date = ?').all(today);
  const tc = db.prepare('SELECT COUNT(*) as c FROM customer').get();
  const pt = db.prepare("SELECT COUNT(*) as c FROM followup_task WHERE status = 'pending'").get();
  const ws = sales.filter(s => s.business_line === 'wellness');
  const cs = sales.filter(s => s.business_line === 'clinic');
  res.json({
    today: {
      serviceCount: svcs.length,
      wellnessRevenue: ws.reduce((s, r) => s + (r.total_amount || 0), 0),
      clinicRevenue: cs.reduce((s, r) => s + (r.total_amount || 0), 0),
      wellnessCash: ws.reduce((s, r) => s + (r.cash_amount || 0), 0),
      wellnessPos: ws.reduce((s, r) => s + (r.pos_amount || 0), 0),
      clinicCash: cs.reduce((s, r) => s + (r.cash_amount || 0), 0),
      clinicPos: cs.reduce((s, r) => s + (r.pos_amount || 0), 0),
      saleCount: sales.length,
    },
    overview: { totalCustomers: tc.c, pendingTasks: pt.c },
    upcomingTasks: db.prepare("SELECT * FROM followup_task WHERE status = 'pending' ORDER BY due_date LIMIT 10").all(),
    expiringCards: db.prepare("SELECT * FROM membership_card WHERE remaining_times <= 2 AND status = 'active' ORDER BY expire_date LIMIT 10").all(),
  });
});

// ===== Customers CRUD =====
router.get('/customers', (req, res) => {
  res.json(db.prepare('SELECT * FROM customer ORDER BY created_at DESC LIMIT 200').all());
});

router.post('/customers', (req, res) => {
  const { name, phone, wechat, type, source, concern, first_visit_date, last_visit_date, owner_staff, note } = req.body;
  const result = db.prepare(
    'INSERT INTO customer (name, phone, wechat, type, source, concern, first_visit_date, last_visit_date, owner_staff, note) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).run(name, phone||'', wechat||'', type||'new', source||'walk_in', concern||'', first_visit_date||'', last_visit_date||'', owner_staff||'', note||'');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/customers/:id', (req, res) => {
  const { name, phone, wechat, type, source, concern, first_visit_date, last_visit_date, owner_staff, note } = req.body;
  db.prepare(
    'UPDATE customer SET name=?, phone=?, wechat=?, type=?, source=?, concern=?, first_visit_date=?, last_visit_date=?, owner_staff=?, note=? WHERE id=?'
  ).run(name, phone||'', wechat||'', type||'new', source||'walk_in', concern||'', first_visit_date||'', last_visit_date||'', owner_staff||'', note||'', req.params.id);
  res.json({ success: true });
});

router.delete('/customers/:id', (req, res) => {
  db.prepare('DELETE FROM customer WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== Service Records CRUD =====
router.get('/services', (req, res) => {
  res.json(db.prepare('SELECT * FROM service_record ORDER BY date DESC, created_at DESC LIMIT 200').all());
});

router.post('/services', (req, res) => {
  const { date, customer_name, customer_type, service_item, therapist, card_amount, quantity, is_gift, note } = req.body;
  let cust = db.prepare('SELECT id, type FROM customer WHERE name = ?').get(customer_name);
  let custId = cust ? cust.id : null;
  let custType = customer_type || (cust ? cust.type : 'new');

  const result = db.prepare(
    'INSERT INTO service_record (date, customer_id, customer_name, customer_type, service_item, therapist, card_amount, quantity, is_gift, note) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).run(date, custId, customer_name, custType, service_item, therapist||'', card_amount||0, quantity||1, is_gift?1:0, note||'');

  if (custId) {
    db.prepare('UPDATE customer SET last_visit_date = ? WHERE id = ?').run(date, custId);
  }

  if (!is_gift && service_item) {
    const card = db.prepare("SELECT * FROM membership_card WHERE customer_name = ? AND applicable_items LIKE ? AND remaining_times > 0 AND status = 'active' ORDER BY expire_date").get(customer_name, `%${service_item}%`);
    if (card) {
      const newUsed = (card.used_times || 0) + (quantity || 1);
      const newRem = (card.total_times || 0) + (card.gift_times || 0) - newUsed;
      db.prepare('UPDATE membership_card SET used_times = ?, remaining_times = ?, status = ? WHERE id = ?')
        .run(newUsed, newRem, newRem <= 0 ? 'used_up' : newRem <= 2 ? 'expiring' : 'active', card.id);
    }
  }

  res.json({ success: true, id: result.lastInsertRowid });
});

router.delete('/services/:id', (req, res) => {
  db.prepare('DELETE FROM service_record WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== Sale Records CRUD =====
router.get('/sales', (req, res) => {
  res.json(db.prepare('SELECT * FROM sale_record ORDER BY date DESC, created_at DESC LIMIT 200').all());
});

router.post('/sales', (req, res) => {
  const { date, business_line, customer_name, item, cash_amount, pos_amount, total_amount, card_times, seller, note } = req.body;
  const result = db.prepare(
    'INSERT INTO sale_record (date, business_line, customer_name, item, cash_amount, pos_amount, total_amount, card_times, seller, note) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).run(date, business_line||'wellness', customer_name, item, cash_amount||0, pos_amount||0, total_amount||0, card_times||0, seller||'', note||'');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.delete('/sales/:id', (req, res) => {
  db.prepare('DELETE FROM sale_record WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== Membership Cards CRUD =====
router.get('/cards', (req, res) => {
  res.json(db.prepare('SELECT * FROM membership_card ORDER BY created_at DESC LIMIT 200').all());
});

router.post('/cards', (req, res) => {
  const { customer_name, card_name, purchase_amount, total_times, gift_times, applicable_items, expire_date } = req.body;
  const cust = db.prepare('SELECT id FROM customer WHERE name = ?').get(customer_name);
  const total = parseInt(total_times) || 0;
  const gift = parseInt(gift_times) || 0;
  const result = db.prepare(
    'INSERT INTO membership_card (customer_id, customer_name, card_name, purchase_amount, total_times, gift_times, used_times, remaining_times, applicable_items, expire_date, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
  ).run(cust ? cust.id : null, customer_name, card_name, purchase_amount||0, total, gift, 0, total + gift, applicable_items||'', expire_date, 'active');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/cards/:id/use', (req, res) => {
  const card = db.prepare('SELECT * FROM membership_card WHERE id = ?').get(req.params.id);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  const newUsed = (card.used_times || 0) + 1;
  const newRem = (card.total_times || 0) + (card.gift_times || 0) - newUsed;
  db.prepare('UPDATE membership_card SET used_times = ?, remaining_times = ?, status = ? WHERE id = ?')
    .run(newUsed, newRem, newRem <= 0 ? 'used_up' : newRem <= 2 ? 'expiring' : 'active', req.params.id);
  res.json({ success: true });
});

router.delete('/cards/:id', (req, res) => {
  db.prepare('DELETE FROM membership_card WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== Followup Tasks CRUD =====
router.get('/followups', (req, res) => {
  res.json(db.prepare('SELECT * FROM followup_task ORDER BY created_at DESC LIMIT 200').all());
});

router.post('/followups', (req, res) => {
  const { customer_name, task_type, due_date, reason, suggested_message, owner_staff } = req.body;
  const cust = db.prepare('SELECT id FROM customer WHERE name = ?').get(customer_name);
  const result = db.prepare(
    'INSERT INTO followup_task (customer_id, customer_name, task_type, due_date, reason, suggested_message, status, owner_staff) VALUES (?,?,?,?,?,?,?,?)'
  ).run(cust ? cust.id : null, customer_name, task_type, due_date, reason||'', suggested_message||'', 'pending', owner_staff||'');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/followups/:id/done', (req, res) => {
  db.prepare('UPDATE followup_task SET status = ? WHERE id = ?').run('done', req.params.id);
  res.json({ success: true });
});

router.delete('/followups/:id', (req, res) => {
  db.prepare('DELETE FROM followup_task WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== Service Items CRUD =====
router.get('/items', (req, res) => {
  res.json(db.prepare('SELECT * FROM service_item ORDER BY created_at DESC').all());
});

router.post('/items', (req, res) => {
  const { name, single_price, package_price, package_times, activity_price, description, contraindication } = req.body;
  const result = db.prepare(
    'INSERT INTO service_item (name, single_price, package_price, package_times, activity_price, description, contraindication) VALUES (?,?,?,?,?,?,?)'
  ).run(name, single_price||0, package_price||0, package_times||10, activity_price||0, description||'', contraindication||'');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/items/:id', (req, res) => {
  const { name, single_price, package_price, package_times, activity_price, description, contraindication } = req.body;
  db.prepare(
    'UPDATE service_item SET name=?, single_price=?, package_price=?, package_times=?, activity_price=?, description=?, contraindication=? WHERE id=?'
  ).run(name, single_price||0, package_price||0, package_times||10, activity_price||0, description||'', contraindication||'', req.params.id);
  res.json({ success: true });
});

router.delete('/items/:id', (req, res) => {
  db.prepare('DELETE FROM service_item WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
