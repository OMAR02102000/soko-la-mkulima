const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// USAJILI (REGISTER)
exports.register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, location } = req.body;

    // Hakiki taarifa muhimu zimetolewa
    if (!full_name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'Tafadhali jaza taarifa zote muhimu' });
    }

    // Ruhusu tu 'seller' au 'buyer' kujisajili wenyewe (admin haisajiliwi hadharani)
    if (role !== 'seller' && role !== 'buyer') {
      return res.status(400).json({ message: 'Role si sahihi' });
    }

    // Hakiki email au simu haijatumika
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email au namba ya simu tayari imesajiliwa' });
    }

    // Simba password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Hifadhi mtumiaji mpya
    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, phone, role, location, created_at`,
      [full_name, email, phone, hashedPassword, role, location || null]
    );

    const user = result.rows[0];

    // Tengeneza JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Weka email na password' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email au password si sahihi' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Akaunti yako imezimwa. Wasiliana na admin.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email au password si sahihi' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    delete user.password_hash; // usirudishe password hash

    res.json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
}; 
