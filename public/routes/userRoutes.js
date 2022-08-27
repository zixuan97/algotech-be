const router = require('express').Router()
const UserController = require('../controllers/userController')

router.post('/', UserController.create)

module.exports = router
