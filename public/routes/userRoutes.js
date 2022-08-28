const router = require('express').Router();
const UserController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/', UserController.create);
router.post('/login', UserController.login);

module.exports = router;
