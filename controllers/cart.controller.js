const Cart = require("../models/cart.models");
const Product = require("../models/product.models");

module.exports = {
    addingProductsToCart: async (req, res) => {
        try {
            const { user } = req
            let { productId, quantity, isFinilize } = req.params
            isFinilize = await JSON.parse(isFinilize)

            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }

            if (!productId) {
                throw {
                    status: 400,
                    message: "product is not specified"
                }
            }

            if (!quantity) {
                throw {
                    status: 400,
                    message: "quantity is not specified"
                }
            }

            const product = await Product.findById(productId)

            if (!product) {
                throw {
                    status: 400,
                    message: "this product does not exist"
                }
            }

            if (product.stock < Number(quantity)) {

                throw {
                    status: 400,
                    message: `this product does not have that much qauntity it has only ${product.stock}`
                }
            }

            const perPrice = product.price / product.stock

            const items = {
                productId,
                quantity: Number(quantity),
                price: perPrice * quantity
            }
            product.stock = product.stock - items.quantity
            product.price = product.price - items.price
            product.save({ validateBeforeSave: true })

            let Allproducts
            const moreProudctsAdd = await Cart.find()
            for (let i = 0; i < moreProudctsAdd.length; i++) {
                if (moreProudctsAdd[i].isFinilize === false) {
                    moreProudctsAdd[i].items.push(items)
                    Allproducts = await moreProudctsAdd[i].populate('items')
                    if (isFinilize === true) {
                        Allproducts.isFinilize = isFinilize
                        Allproducts.save({ validateBeforeSave: false })
                        return res.status(200).send(Allproducts)
                    }
                    Allproducts.save({ validateBeforeSave: false })
                    return res.send(Allproducts)


                }

            }

            let addProduct = await Cart.create({
                user: user._id,
                items: items,
                isFinilize
            })
            res.send(addProduct)


        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || "something went wrong")
        }
    },
    removeCart: async (req, res) => {
        try {
            const { user } = req
            const { cartId } = req.params
            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            if (!cartId) {
                throw {
                    status: 400,
                    message: "cartId is not given"
                }
            }
            const cart = await Cart.findById(cartId)
            if (!cart) {
                throw {
                    status: 400,
                    message: "this cart does not exist"
                }
            }

            const allproducts = await Product.find()

            if (!allproducts) {
                throw {
                    status: 400,
                    message: "something went wrong during getting all the products"
                }
            }
            for (let i = 0; i < allproducts.length; i++) {
                for (let j = 0; j < cart.items.length; j++) {
                    if (allproducts[i]._id.toString() == cart.items[j].productId.toString()) {
                        allproducts[i].stock += cart.items[j].quantity
                        allproducts[i].price += cart.items[j].price

                    }

                }
                allproducts[i].save({ validateBeforeSave: false })


            }
            const deletedCart = await Cart.findByIdAndDelete(cartId)
            if (!deletedCart) {
                throw {
                    status: 400,
                    message: "something went wrong during deleting the cart"
                }
            }
            res.status(200).send(deletedCart)

        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || "something went wrong")
        }
    },
    getSingleCart: async (req, res) => {
        try {
            const { user } = req
            const { cartId } = req.params

            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            if (!cartId) {
                throw {
                    status: 400,
                    message: "cartId is not given"
                }
            }
            const cart = await Cart.findOne({ _id: cartId }).populate('items.productId')

            if (!cart) {
                throw {
                    status: 400,
                    message: "this cart does not exist"
                }
            }
            res.status(200).send(cart)
        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || "something went wrong")
        }
    },
    getAllCarts: async (req, res) => {
        try {
            const { user } = req


            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }

            const cart = await Cart.find().populate('items.productId')

            if (!cart) {
                throw {
                    status: 400,
                    message: "this cart does not exist"
                }
            }
            res.status(200).send(cart)
        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || "something went wrong")
        }
    },
    deleteProductfromCart: async (req, res) => {
        try {
            const { user } = req
            const { cartId, productId } = req.params
            
            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            if (!cartId) {
                throw {
                    status: 400,
                    message: "cartId is not given"
                }
            }
            if (!productId) {
                throw {
                    status: 400,
                    message: "productId is not given"
                }
            }
            const cart = await Cart.findOne({ _id: cartId })
    
            if (cart.items.length == 0) {
                throw {
                    status: 400,
                    message: 'this cart have no products'
                }
            }
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId.toString() != productId) {
                    throw {
                        status: 400,
                        message: 'this product does not exist in this cart'
                    }
                }
            }
            let product = await Product.findById(productId)

            if (!cart) {
                throw {
                    status: 400,
                    message: "productId is not given"
                }
            }
            for (let i = 0; i < cart.items.length; i++) {
                if (productId == cart.items[i].productId.toString()) {
                    product.stock += cart.items[i].quantity
                    product.price += cart.items[i].price
                    product.save({ validateBeforeSave: false })
                    cart.items.splice(i, 1)
                    await cart.save({ validateBeforeSave: false })


                }

            }
            res.status(200).send(cart)
        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || "something went wrong")
        }

    }
}