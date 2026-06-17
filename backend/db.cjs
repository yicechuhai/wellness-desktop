const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const dbDir = path.join(os.homedir(), '.wellness');
const dbPath = path.join(dbDir, 'data.db');

// Ensure directory exists
try { require('fs').mkdirSync(dbDir, { recursive: true }); } catch(e) {}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const initSQL = `
CREATE TABLE IF NOT EXISTS customer (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, phone TEXT, wechat TEXT,
  type TEXT DEFAULT 'new', source TEXT DEFAULT 'walk_in',
  concern TEXT, first_visit_date TEXT, last_visit_date TEXT,
  owner_staff TEXT, note TEXT, created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS service_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
  single_price REAL DEFAULT 0, package_price REAL DEFAULT 0,
  package_times INTEGER DEFAULT 10, activity_price REAL DEFAULT 0,
  description TEXT, contraindication TEXT, ai_intro TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS service_record (
  id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL,
  customer_id INTEGER, customer_name TEXT NOT NULL,
  customer_type TEXT DEFAULT 'new', service_item TEXT NOT NULL,
  therapist TEXT, card_amount REAL DEFAULT 0, quantity INTEGER DEFAULT 1,
  is_gift INTEGER DEFAULT 0, note TEXT, created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS sale_record (
  id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL,
  business_line TEXT DEFAULT 'wellness', customer_id INTEGER,
  customer_name TEXT NOT NULL, item TEXT NOT NULL,
  cash_amount REAL DEFAULT 0, pos_amount REAL DEFAULT 0,
  total_amount REAL DEFAULT 0, card_times INTEGER DEFAULT 0,
  seller TEXT, note TEXT, created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS membership_card (
  id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER,
  customer_name TEXT NOT NULL, card_name TEXT NOT NULL,
  purchase_amount REAL DEFAULT 0, total_times INTEGER DEFAULT 0,
  gift_times INTEGER DEFAULT 0, used_times INTEGER DEFAULT 0,
  remaining_times INTEGER DEFAULT 0, applicable_items TEXT,
  expire_date TEXT, status TEXT DEFAULT 'active',
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS followup_task (
  id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER,
  customer_name TEXT NOT NULL, task_type TEXT NOT NULL,
  due_date TEXT NOT NULL, reason TEXT, suggested_message TEXT,
  status TEXT DEFAULT 'pending', owner_staff TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
`;
db.exec(initSQL);

// Seed data if empty
const hasData = db.prepare('SELECT COUNT(*) as c FROM customer').get();
if (hasData.c === 0) {
  const insC = db.prepare('INSERT INTO customer (name, phone, type, source, concern, first_visit_date, last_visit_date, owner_staff) VALUES (?,?,?,?,?,?,?,?)');
  [
    ['王女士','13800138001','old','referral','肩颈','2026-01-15','2026-06-10','张调理师'],
    ['李先生','13800138002','old','walk_in','腰椎','2026-02-20','2026-06-12','李调理师'],
    ['张阿姨','13800138003','old','referral','艾灸','2026-03-01','2026-06-08','王调理师'],
    ['陈小姐','13800138004','new','douyin','面护','2026-06-12','2026-06-12','张调理师'],
    ['赵先生','13800138005','old','meituan','经络','2026-01-10','2026-05-28','李调理师'],
    ['刘女士','13800138006','hotel','hotel','腿部','2026-06-11','2026-06-11','王调理师'],
    ['孙先生','13800138007','new','douyin','肩颈','2026-06-13','2026-06-13','张调理师'],
    ['周女士','13800138008','old','referral','肠胃','2026-04-05','2026-06-09','李调理师'],
  ].forEach(r => insC.run(r));

  const insI = db.prepare('INSERT INTO service_item (name, single_price, package_price, package_times, activity_price, description, contraindication, ai_intro) VALUES (?,?,?,?,?,?,?,?)');
  [
    ['肩颈调理',128,980,10,19.9,'针对肩颈僵硬、酸痛，疏通经络，缓解疲劳','颈部手术后、严重颈椎病需咨询医生','肩颈调理是我们店的明星项目'],
    ['腰椎调理',168,1280,10,99,'针对腰部酸痛、僵硬，改善腰椎不适','腰椎手术后、严重腰椎间盘突出','腰椎调理适合久坐办公人群'],
    ['艾灸',98,780,10,19.9,'传统艾灸温经散寒，调理气血','孕妇、皮肤过敏、发热期','艾灸是传统养生方法'],
    ['经络调理',198,1580,10,68,'全身经络疏通，调理亚健康状态','严重心脏病、高血压未控制','经络调理通过疏通全身经络'],
    ['面护',158,1280,10,39.9,'面部护理，深层清洁滋养','面部皮肤破损、严重过敏','面护项目适合改善面部皮肤'],
    ['腿部调理',138,1080,10,29.9,'针对腿部酸痛、水肿，促进循环','静脉曲张严重、腿部皮肤破损','腿部调理适合久站人群'],
    ['头疗',88,680,10,19.9,'头部按摩放松，改善睡眠','头部外伤、严重偏头痛','头疗通过头部穴位按摩放松神经'],
    ['肠胃调理',178,1380,10,49.9,'腹部温养，调理肠胃功能','急性肠胃炎、腹部手术恢复期','肠胃调理通过腹部温养'],
  ].forEach(r => insI.run(r));

  const insCard = db.prepare('INSERT INTO membership_card (customer_id, customer_name, card_name, purchase_amount, total_times, gift_times, used_times, remaining_times, applicable_items, expire_date, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  [
    [1,'王女士','肩颈10次卡',980,10,1,7,4,'肩颈调理','2026-12-31','active'],
    [2,'李先生','腰椎10次卡',1280,10,0,8,2,'腰椎调理','2026-09-30','expiring'],
    [3,'张阿姨','艾灸10次卡',780,10,2,5,7,'艾灸','2026-11-30','active'],
    [4,'陈小姐','面护10次卡',1280,10,1,1,10,'面护','2026-12-31','active'],
    [5,'赵先生','经络10次卡',1580,10,1,10,1,'经络调理','2026-06-30','expiring'],
  ].forEach(r => insCard.run(r));

  const today = '2026-06-17';
  const insT = db.prepare('INSERT INTO followup_task (customer_id, customer_name, task_type, due_date, reason, suggested_message, owner_staff) VALUES (?,?,?,?,?,?,?)');
  [
    [4,'陈小姐','new_experience',today,'昨日新客体验肩颈调理，需回访体验感受','陈小姐您好！昨天您体验了肩颈调理，今天肩膀感觉轻松些了吗？建议连续做3次效果更明显哦~','张调理师'],
    [2,'李先生','renew_reminder',today,'腰椎卡仅剩2次，需提醒续卡','李先生您好！您的腰椎调理卡还剩2次，要不要趁活动续一个疗程？现在续卡还有赠送哦~','李调理师'],
    [5,'赵先生','renew_reminder',today,'经络卡仅剩1次，6月30日到期','赵先生您好！您的经络卡快用完了，月底就到期了。这次618活动很划算，要不要续一张？','李调理师'],
    [6,'刘女士','convert_package',today,'酒店客人体验后转化','刘女士您好！昨天您体验的腿部调理感觉怎么样？如果效果不错，我们有个10次卡特别划算，每次才108元~','王调理师'],
    [7,'孙先生','new_experience',today,'今日新客到店体验','孙先生您好！感谢您今天来体验肩颈调理，做完之后肩膀感觉怎么样？有任何问题随时问我~','张调理师'],
    [8,'周女士','sleeping_wake',today,'4天未到店','周姐您好！有4天没见您啦，最近肠胃怎么样？记得按时来调理哦，我帮您预约明天的时间？','李调理师'],
  ].forEach(r => insT.run(r));

  console.log('[DB] Seed data inserted');
}

module.exports = db;
