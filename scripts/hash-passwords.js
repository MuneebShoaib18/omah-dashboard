const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

async function main() {
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  let updated = 0;

  for (const user of db.users) {
    if (!user.password) continue;
    if (user.password.startsWith('$2')) continue;

    user.password = await bcrypt.hash(user.password, 12);
    updated += 1;
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  console.log(`Hashed ${updated} password(s) in db.json`);
}

main().catch((error) => {
  console.error('Password migration failed:', error);
  process.exit(1);
});
