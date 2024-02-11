const express=require('express');
const { newOrder, getSingleOrder, myorders, orders, updateOrder, deleteOrder } = require('../controllers/orderController');
const { isAuthenticatedUser, authorizedRoles } = require('../middlewares/authenticate');
const router = express.Router();
router.route('/order/new').post(isAuthenticatedUser,newOrder);
router.route('/order/:id').get(isAuthenticatedUser,getSingleOrder);
router.route('/myorders').get(isAuthenticatedUser,myorders)

//Admin Routes
router.route('/admin/orders').get(isAuthenticatedUser,authorizedRoles('admin'),orders)
router.route('/admin/order/:id').put(isAuthenticatedUser,authorizedRoles('admin'),updateOrder)
                                .delete(isAuthenticatedUser,authorizedRoles('admin'),deleteOrder)


module.exports=router;





