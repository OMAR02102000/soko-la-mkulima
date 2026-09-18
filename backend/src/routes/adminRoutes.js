const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Routes zote hapa ni za Admin pekee
router.use(auth, roleCheck(['admin']));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/products', adminController.getAllProducts);
router.get('/orders', adminController.getAllOrders);

module.exports = router;
