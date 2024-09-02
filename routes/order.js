const { setOrder } = require('../controllers/order.controller')
const authentication = require('..//auth');

const express = require('express');
const router = express.Router();

router.route("/:cartId").post(authentication, setOrder)

module.exports = router