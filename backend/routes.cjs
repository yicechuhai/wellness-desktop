const express = require('express');
const db = require('./db.cjs');
const router = express.Router();

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

router.get('/customers', (req, res) => {
  res.json(db.prepare('SELECT * FROM customer ORDER BY created_at DESC LIMIT 50').all());
});

router.get('/services', (req, res) => {
  res.json(db.prepare('SELECT * FROM service_record ORDER BY date DESC LIMIT 100').all());
});

router.get('/sales', (req, res) => {
  res.json(db.prepare('SELECT * FROM sale_record ORDER BY date DESC LIMIT 100').all());
});

router.get('/cards', (req, res) => {
  res.json(db.prepare('SELECT * FROM membership_card ORDER BY created_at DESC LIMIT 50').all());
});

router.get('/followups', (req, res) => {
  res.json(db.prepare('SELECT * FROM followup_task ORDER BY created_at DESC LIMIT 50').all());
});

router.post('/followups/done', express.json(), (req, res) => {
  db.prepare('UPDATE followup_task SET status = ? WHERE id = ?').run('done', req.body.id);
  res.json({ success: true });
});

router.get('/items', (req, res) => {
  res.json(db.prepare('SELECT * FROM service_item').all());
});

module.exports = router;
