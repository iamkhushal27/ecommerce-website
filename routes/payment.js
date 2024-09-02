const { generatePaymentMethod, givePayment } = require("../controllers/payment.controller")
const authentication = require('..//auth');

const express = require('express');
const router = express.Router();

router.route("/:orderId").post(authentication, generatePaymentMethod)
router.route("/givepayment/:paymentId").patch(authentication, givePayment)

module.exports = router
