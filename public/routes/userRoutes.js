const router = require('express').Router();
const UserController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.post('/', UserController.createUser);
router.get('/', verifyToken, UserController.getUser);
router.get('/details/:id', UserController.getUserDetails);
router.post('/auth', UserController.auth);
router.get('/all', UserController.getUsers);
router.delete('/:id', UserController.deleteUser);
router.put('/', UserController.editUser);
router.put('/enable/:id', UserController.enableUser);
router.put('/disable/:id', UserController.disableUser);
router.put('/role/:id/:action', UserController.changeUserRole);
router.post('/forgetpw', UserController.sendForgetEmailPassword);

module.exports = router;
