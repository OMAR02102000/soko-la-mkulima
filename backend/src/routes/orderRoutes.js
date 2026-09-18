const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, roleCheck(['buyer']), orderController.createOrder);
router.get('/mine', auth, roleCheck(['buyer']), orderController.getMyOrders);
router.get('/seller', auth, roleCheck(['seller']), orderController.getSellerOrders);
router.patch('/:id/status', auth, roleCheck(['seller']), orderController.updateOrderStatus);

module.exports = router;
