// const { set } = require('../app');
const { setProduct, getAllProductOfOwn, getAllProductOfOther, getSingleProduct, productNameChange, productPriceChange, productStockChange, productPictureChange, deleteproduct, productCategoryChange } = require('../controllers/product.controllers')
const upload = require('../public/javascripts/multer')
const authentication = require('../auth');



const express = require('express');
const router = express.Router();

router.route('/').post(authentication, upload.single('picture'), setProduct);
router.route('/').get(authentication, getAllProductOfOwn);
router.route('/:productid').delete(authentication, deleteproduct);
router.route('/getsingleproduct/:productid').get(authentication, getSingleProduct);
router.route('/picture/:productid').patch(authentication, upload.single('picture'), productPictureChange); // More specific route
router.route('/price/:price/:productid').patch(authentication, productPriceChange);
router.route('/stock/:stockQuantity/:productid').patch(authentication, productStockChange);
router.route('/:name/:productid').patch(authentication, productNameChange); // Less specific route, placed last
router.route('/change/:category/:productid').patch(authentication, productCategoryChange); // Less specific route, placed last
router.route('/:userid').get(authentication, getAllProductOfOther); // Also less specific


module.exports = router

