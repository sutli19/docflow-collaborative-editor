require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedUsers = require('./utils/seed');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(process.env.MONGO_URI);
  await seedUsers();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();