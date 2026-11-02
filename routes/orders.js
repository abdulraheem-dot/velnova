const router = require('express').Router();
const { placeOrder, getMyOrders, getAllOrders, updateStatus } = require('../controllers/orderController');
const { requireLogin, requireAdmin } = require('../middleware/auth');
router.post('/',             requireLogin, placeOrder);
router.get('/my',            requireLogin, getMyOrders);
router.get('/',              requireAdmin, getAllOrders);
router.patch('/:id/status',  requireAdmin, updateStatus);
module.exports = router;
