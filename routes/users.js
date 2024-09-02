const authentication = require('../auth');
const { register, login, logout, generateAccessToken, myProfile, otherProfile, updatePassword, userNameChange, deleteUser, addAmount } = require('../controllers/user.controllers')



const express = require('express');
const router = express.Router();

router.route('/').post(register)
router.route('/login').post(login)
router.route('/').get(authentication, logout)
router.route('/generateaccesstoken').get(authentication, generateAccessToken)
router.route('/myprofile').get(authentication, myProfile)
router.route('/otherprofile/:id').get(authentication, otherProfile)
router.route('/addamount/:amount').patch(authentication, addAmount)
router.route('/:password/:oldPassword').patch(authentication, updatePassword)
router.route('/:name').patch(authentication, userNameChange)
router.route('/').delete(authentication, deleteUser)


module.exports = router;
