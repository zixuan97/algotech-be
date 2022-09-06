const router = require('express').Router();
const UserController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.post('/', UserController.createUser);
router.get('/', verifyToken, UserController.getUser);
router.get('/details', UserController.getUserDetails);
router.post('/auth', UserController.auth);
router.get('/all', UserController.getUsers);
router.delete('/', UserController.deleteUser);
router.put('/', UserController.editUser);
router.put('/enable', UserController.enableUser);
router.put('/disable', UserController.disableUser);
router.put('/role', UserController.changeUserRole);
router.post('/forgetpw', UserController.sendForgetEmailPassword);

module.exports = router;
