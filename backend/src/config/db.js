const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err) => {
  if (err) {
    console.error('Imeshindikana kuunganisha na database:', err.message);
  } else {
    console.log('Umeunganishwa na PostgreSQL vizuri!');
  }
});

module.exports = pool;