const router = require('express').Router();
const UserController = require('../controllers/userController');
const OrganisationalChartController = require('../controllers/organisationalChartController');
const { verifyToken } = require('../middleware/auth');

router.post('/', UserController.createUser);
router.post('/b2b', UserController.createB2BUser);
router.get('/', verifyToken, UserController.getUser);
router.get('/details/:id', UserController.getUserDetails);
router.post('/auth', UserController.auth);
router.get('/all', verifyToken, UserController.getUsers);
router.delete('/:id', UserController.deleteUser);
router.put('/', UserController.editUser);
router.put('/enable/:id', UserController.enableUser);
router.put('/disable/:id', UserController.disableUser);
router.put('/role/:id/:action', UserController.changeUserRole);
router.post('/forgetpw', UserController.sendForgetEmailPassword);
router.post('/updatepw', UserController.verifyPassword);
router.put('/approve/:id', UserController.approveB2BUser);
router.put('/reject/:id', UserController.rejectB2BUser);
router.get('/b2b/all', UserController.getAllB2BUsers);
router.get('/b2b/pending', UserController.getAllPendingB2BUsers);
router.get('/nonb2b/all', verifyToken, UserController.getAllNonB2BUsers);
router.get('/pending/count', UserController.getNumberOfPendingUsers);
router.get('/employee/all', UserController.getAllEmployees);
router.get('/jobrole/:id', UserController.getJobRoleById);
router.get('/jobrole/name/:jobRole', UserController.getJobRoleByName);
router.get('/jobroles/all', UserController.getAllJobRoles);
router.post('/jobrole', UserController.createJobRole);
router.put('/jobrole', UserController.editJobRole);
router.post('/jobroles', UserController.addJobRolesToUser);
router.delete('/jobrole/:id', UserController.deleteJobRole);
router.post('/assign/subordinates', UserController.assignSubordinatesToManager);
router.post(
  '/unassign/subordinates',
  UserController.unassignSubordinatesToManager
);
router.put('/employee', UserController.updateEmployee);

router.post('/org', OrganisationalChartController.organisationChart);
router.post('/ceo/:ceoId', UserController.setCEO);
router.get('/ceo', UserController.getCEO);
router.post('/changeceo/:ceoId', UserController.changeCEO);

module.exports = router;
