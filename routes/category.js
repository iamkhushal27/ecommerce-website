const { setCategory, deleteCategory, getAllCategory, getSingleCategory } = require('../controllers/category.controller')
const ownerAuthentication = require('../owner.auth');
const authentication = require('..//auth');

const express = require('express');
const router = express.Router();

router.route('/:name').post(ownerAuthentication, setCategory)
router.route('/:id').delete(ownerAuthentication, deleteCategory)
router.route('/').get(authentication, getAllCategory)
router.route('/:categoryId').get(authentication, getSingleCategory)


module.exports = router