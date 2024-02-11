const express = require('express');
const { getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct, createReview, getReviews, deleteReview, getAdminProducts } = require('../controllers/productController');
const router= express.Router();
const {isAuthenticatedUser, authorizedRoles }= require('../middlewares/authenticate')
const multer=require('multer')
const path=require('path')
const upload=multer({storage: multer.diskStorage({
    destination:function(req,file,cb){
            cb(null,path.join(__dirname,'..','uploads/product'))
    },
    filename:function(req,file,cb){
            cb(null,file.originalname)
    }
})})


router.route('/products').get(getProducts);
//router.route('/product/new').post(isAuthenticatedUser,authorizedRoles('admin'), newProduct)
router.route('/product/:id')
                            .get(getSingleProduct);
                            
                            
//Admin routes
router.route('/admin/product/new').post(isAuthenticatedUser,authorizedRoles('admin'),upload.array('images'),newProduct)
router.route('/admin/products').get(isAuthenticatedUser, authorizedRoles('admin'), getAdminProducts);
router.route('/admin/product/:id').delete(isAuthenticatedUser, authorizedRoles('admin'), deleteProduct);
router.route('/admin/product/:id').put(isAuthenticatedUser, authorizedRoles('admin'),upload.array('images'), updateProduct);
router.route('/admin/reviews').get(isAuthenticatedUser, authorizedRoles('admin'),getReviews)
router.route('/admin/review').delete(isAuthenticatedUser, authorizedRoles('admin'),deleteReview)


//for User review
router.route('/review').put(isAuthenticatedUser,createReview)
                       



module.exports = router; 