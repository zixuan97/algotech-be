const router = require('express').Router();
const { rotate } = require('pdfkit');
const leaveController = require('../controllers/leaveController');

router.post('/', leaveController.createLeaveApplication);
router.post('/quota', leaveController.createLeaveQuota);
router.get('/allquota', leaveController.getLeaveQuota);
router.put('/quota', leaveController.updateLeaveQuota);
router.delete('/quota/:tier', leaveController.deleteLeaveQuotaByTier);
router.get('/quota/:employeeId', leaveController.getEmployeeLeaveRecord);
router.put('/employee/quota', leaveController.updateEmployeeLeaveQuota);
router.get(
  '/all/:employeeId',
  leaveController.getAllLeaveApplicationsByEmployeeId
);
router.get('/all', leaveController.getAllLeaveApplications);
router.get('/approved/all', leaveController.getAllApprovedLeaveApplications);
router.get('/pending/all', leaveController.getAllPendingLeaveApplications);
router.get(
  '/numberpending',
  leaveController.getNumberOfPendingLeaveApplications
);
router.get('/:id', leaveController.getLeaveApplication);
router.put('/', leaveController.updateLeaveApplication);
router.post('/approve', leaveController.approveLeaveApplication);
router.post('/cancel/:id', leaveController.cancelLeaveApplication);
router.post('/reject', leaveController.rejectLeaveApplication);
router.post('/tier', leaveController.updateTierByEmployeeId);

module.exports = router;
