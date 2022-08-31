const router = require('express').Router();
const UserController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.post('/', UserController.create);
router.get('/', verifyToken, UserController.getUser);
router.post('/auth', UserController.auth);

module.exports = router;
