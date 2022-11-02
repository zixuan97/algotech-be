const router = require('express').Router();
const leaveController = require('../controllers/leaveController');

router.post('/', leaveController.createLeave);
router.get('/all/:employeeId', leaveController.getAllLeavesByEmployeeId);
router.get('/all', leaveController.getAllLeaves);
router.get('/:id', leaveController.getLeave);
router.put('/', leaveController.updateLeave);
router.delete('/:id', leaveController.deleteLeave);

module.exports = router;
