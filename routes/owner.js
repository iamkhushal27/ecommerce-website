const { registerOwner, login, logout, generateAccessToken } = require('../controllers/owner.controller')
const ownerAuthentication = require('../owner.auth');

const express = require('express');
const router = express.Router();

router.route('/').post(registerOwner);
router.route('/login').post(login);
router.route('/logout').get(ownerAuthentication, logout);
router.route('/tokens').get(ownerAuthentication, generateAccessToken);

module.exports = router