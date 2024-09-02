const Cart = require("../models/cart.models");
const Order = require("../models/order.models");

module.exports = {
    setOrder: async (req, res) => {
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
                    message: "this card"
                }
            }
          
            if (cart.user.toString() != user._id.toString()) {
                throw {
                    status: 400,
                    message: "this cart is not yours"
                }
            }
            let totalPrice = 0
            for (let i = 0; i < cart.items.length; i++) {
                totalPrice += cart.items[i].price

            }

            const order = await Order.create({
                user: user._id,
                cart: cartId,
                totalPrice
            })

            res.status(200).send(order)
        } catch (error) {
            console.log(error)
        }

    }
}