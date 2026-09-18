const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.get('/mine', auth, roleCheck(['seller']), productController.getMyProducts);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.post('/', auth, roleCheck(['seller']), upload.single('image'), productController.createProduct);
router.put('/:id', auth, roleCheck(['seller']), upload.single('image'), productController.updateProduct);
router.delete('/:id', auth, roleCheck(['seller']), productController.deleteProduct);

module.exports = router;
