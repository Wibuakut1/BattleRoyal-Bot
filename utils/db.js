const Database = require('better-sqlite3');
let db;

function initDB() {
  db = new Database('database.db');
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    wins INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
  )`).run();
}

function getPlayerStats(userId) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(userId);
  if (!user) return 'Kamu belum pernah ikut battle! Gunakan /rumble lalu klik 🗡️!';
  return `**${user.username}**\nLevel: ${user.level}\nXP: ${user.xp}\nMenang: ${user.wins}`;
}

function ensureUser(user) {
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  if (!existing) {
    db.prepare('INSERT INTO users (id, username) VALUES (?, ?)').run(user.id, user.username);
  }
}

function addWinAndXP(userId, amount = 50) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const xp = user.xp + amount;
  const level = Math.floor(xp / 100) + 1;
  db.prepare(`UPDATE users SET xp = ?, level = ?, wins = wins + 1 WHERE id = ?`)
    .run(xp, level, userId);
}

function getLeaderboard() {
  const users = db.prepare('SELECT * FROM users ORDER BY xp DESC LIMIT 10').all();
  return users.map((u, i) => `${i + 1}. **${u.username}** - LVL ${u.level} (${u.xp} XP)`).join('\n') || 'Belum ada pemain.';
}

module.exports = { initDB, getPlayerStats, ensureUser, addWinAndXP, getLeaderboard };
