const pool = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.full_name AS seller_name, u.location AS seller_location
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.is_approved = true
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, u.full_name AS seller_name, u.location AS seller_location
       FROM products p JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bidhaa haipo' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
      [sellerId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

// KUONGEZA BIDHAA (sasa na picha)
exports.createProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { name, description, price, quantity_available, unit, category } = req.body;

    if (!name || !price || !quantity_available) {
      return res.status(400).json({ message: 'Jaza jina, bei, na kiasi kilichopo' });
    }

    // req.file inatokana na Multer + Cloudinary (kama picha imetumwa)
    const image_url = req.file ? req.file.path : null;

    const result = await pool.query(
      `INSERT INTO products (seller_id, name, description, price, quantity_available, unit, image_url, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [sellerId, name, description, price, quantity_available, unit || 'kg', image_url, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const check = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Bidhaa haipo' });
    }
    if (check.rows[0].seller_id !== sellerId) {
      return res.status(403).json({ message: 'Hii si bidhaa yako' });
    }

    const { name, description, price, quantity_available, unit, category } = req.body;
    // Kama picha mpya imetumwa, itumike; la sivyo, ibaki ile ya zamani
    const image_url = req.file ? req.file.path : check.rows[0].image_url;

    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, quantity_available=$4,
       unit=$5, image_url=$6, category=$7 WHERE id=$8 RETURNING *`,
      [name, description, price, quantity_available, unit, image_url, category, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const check = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Bidhaa haipo' });
    }
    if (check.rows[0].seller_id !== sellerId) {
      return res.status(403).json({ message: 'Hii si bidhaa yako' });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Bidhaa imefutwa' });
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};
