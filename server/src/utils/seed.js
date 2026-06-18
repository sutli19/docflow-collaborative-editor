const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SEED_USERS = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
];

async function seedUsers() {
  const existingCount = await User.countDocuments();
  if (existingCount > 0) return;

  const password = process.env.SEED_PASSWORD || 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  await User.insertMany(SEED_USERS.map((u) => ({ ...u, passwordHash })));

  console.log('Seeded users: alice@example.com / bob@example.com');
  console.log(`Shared seed password: ${password}`);
}

module.exports = seedUsers;