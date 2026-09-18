const pool = require('../config/db');

exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const buyerId = req.user.id;
    const { items, payment_method } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Kikapu ni tupu' });
    }

    await client.query('BEGIN');

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const productResult = await client.query(
        'SELECT * FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Bidhaa yenye id ${item.product_id} haipo`);
      }

      const product = productResult.rows[0];

      if (product.quantity_available < item.quantity) {
        throw new Error(`Kiasi cha ${product.name} kilichopo hakitoshi`);
      }

      const subtotal = parseFloat(product.price) * item.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        product_id: product.id,
        quantity: item.quantity,
        price_at_purchase: product.price,
      });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (buyer_id, total_amount, status, payment_method)
       VALUES ($1, $2, 'pending', $3) RETURNING *`,
      [buyerId, totalAmount, payment_method]
    );
    const order = orderResult.rows[0];

    for (const item of orderItemsData) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price_at_purchase]
      );

      await client.query(
        `UPDATE products SET quantity_available = quantity_available - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ order, items: orderItemsData });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const result = await pool.query(
      `SELECT o.*,
       json_agg(json_build_object(
         'product_name', p.name,
         'image_url', p.image_url,
         'quantity', oi.quantity,
         'price_at_purchase', oi.price_at_purchase
       )) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.buyer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [buyerId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const result = await pool.query(
      `SELECT o.id, o.status, o.payment_method, o.created_at, o.buyer_id,
       u.full_name AS buyer_name, u.phone AS buyer_phone,
       json_agg(json_build_object(
         'product_name', p.name,
         'image_url', p.image_url,
         'quantity', oi.quantity,
         'price_at_purchase', oi.price_at_purchase
       )) AS items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       JOIN users u ON o.buyer_id = u.id
       WHERE p.seller_id = $1
       GROUP BY o.id, u.full_name, u.phone
       ORDER BY o.created_at DESC`,
      [sellerId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user.id;

    const check = await pool.query(
      `SELECT DISTINCT o.id FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1 AND p.seller_id = $2`,
      [id, sellerId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ message: 'Huwezi kubadili order hii' });
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu ya server', error: error.message });
  }
};
