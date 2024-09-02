const Order = require("../models/order.models")
const Payment = require("../models/payment.models")


module.exports = {
    generatePaymentMethod: async (req, res) => {
        try {
            const { user } = req
            const { orderId } = req.params
            
            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            if (!orderId) {
                throw {
                    status: 400,
                    message: "orderId is not given"
                }
            }


            const order = await Order.findById(orderId)

            if (!order) {
                throw {
                    status: 400,
                    message: "this order does not exist"
                }
            }

            if (order.user.toString() != user._id.toString()) {
                throw {
                    status: 400,
                    message: "this order is not yours"
                }
            }

            const payment = await Payment.create({
                user: user._id,
                orderId: orderId,
                amount: order.totalPrice,

            })

            if (!payment) {
                throw {
                    status: 400,
                    message: "making paymenet something went worng"
                }
            }
            res.status(200).send(payment)
        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }

    },
    givePayment: async (req, res) => {
        try {

            const { user } = req
            const { paymentId } = req.params
            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            if (!paymentId) {
                throw {
                    status: 400,
                    message: "paymenetId is not given"
                }
            }


            const payment = await Payment.findById(paymentId)


            if (!payment) {
                throw {
                    status: 400,
                    message: "this payment is not pending"
                }
            }

            if (payment.user.toString() != user._id.toString()) {
                throw {
                    status: 400, message: 'this payment is not yours'
                }

            }
            if (payment.status=="Completed") {
                throw {
                    status:400,
                    message:"payment is already paid"
                }
            }
            if (payment.amount>user.amount) {
                throw {
                    status:400,
                    message:"you dont have enough payment to buy"
                }
            }

            user.amount -= payment.amount
            user.save({ validateBeforeSave: false })
            payment.status = "Completed"
            payment.save({ validateBeforeSave: false })
            let order = await Order.findById(payment.orderId)
            order.status = "Shipped"
            order.save({ validateBeforeSave: false })

            res.status(200).send("payment is paid your order is shipped it will be arive in 2 days")

        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || 'something went wrong')
        }
    }
}