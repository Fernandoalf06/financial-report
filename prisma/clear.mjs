import Database from 'better-sqlite3';
const db = new Database('./prisma/dev.db');
db.prepare('DELETE FROM Budget').run();
console.log("Budgets deleted successfully via pure SQLite driver.");
