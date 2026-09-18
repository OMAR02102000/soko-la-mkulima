 const pool = require('../config/db');

// KUONA WATUMIAJI WOTE (wauzaji + wanunuzi + admin)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, role, location, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

// KUZIMA / KUWEZESHA AKAUNTI
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const result = await pool.query(
      `UPDATE users SET is_active = $1 WHERE id = $2
       RETURNING id, full_name, email, role, is_active`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mtumiaji hapatikani' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

// KUONA BIDHAA ZOTE (mfumo mzima)
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.full_name AS seller_name
       FROM products p JOIN users u ON p.seller_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

// KUONA ORDERS ZOTE (mfumo mzima)
exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.full_name AS buyer_name, u.phone AS buyer_phone
       FROM orders o JOIN users u ON o.buyer_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

// TAKWIMU ZA JUMLA (Dashboard summary)
exports.getStats = async (req, res) => {
  try {
    const sellers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'seller'");
    const buyers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'buyer'");
    const products = await pool.query("SELECT COUNT(*) FROM products");
    const orders = await pool.query("SELECT COUNT(*) FROM orders");
    const revenue = await pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status != 'cancelled'");

    res.json({
      total_sellers: parseInt(sellers.rows[0].count),
      total_buyers: parseInt(buyers.rows[0].count),
      total_products: parseInt(products.rows[0].count),
      total_orders: parseInt(orders.rows[0].count),
      total_revenue: parseFloat(revenue.rows[0].total),
    });
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};
