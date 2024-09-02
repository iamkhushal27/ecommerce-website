const { addingProductsToCart, removeCart, getSingleCart, getAllCarts, deleteProductfromCart } = require('../controllers/cart.controller')
const authentication = require('..//auth');

const { Router } = require("express")
const router = Router()


router.route("/").get(authentication, getAllCarts)
router.route("/deleteproduct/:cartId/:productId").delete(authentication, deleteProductfromCart)
router.route("/:productId/:quantity/:isFinilize").post(authentication, addingProductsToCart)
router.route("/:cartId").delete(authentication, removeCart)
router.route("/:cartId").get(authentication, getSingleCart)

module.exports = router
