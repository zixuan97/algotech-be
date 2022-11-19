const router = require('express').Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken } = require('../middleware/auth');

router.post('/', leaveController.createLeaveApplication);
router.post('/quota', leaveController.createLeaveQuota);
router.get('/allquota', leaveController.getLeaveQuota);
router.get('/alltiers', leaveController.getAllTiers);
router.get('/quota/:id', leaveController.getLeaveQuotaById);
router.put('/quota', leaveController.updateLeaveQuota);
router.delete('/quota/:id', leaveController.deleteLeaveQuotaById);
router.get('/record/:id', leaveController.getLeaveRecordById);
router.get('/employee/:employeeId', leaveController.getEmployeeLeaveRecord);
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
router.put('/vet', verifyToken, leaveController.vetLeaveApplication);
router.post('/approve', verifyToken, leaveController.approveLeaveApplication);
router.post('/cancel/:id', leaveController.cancelLeaveApplication);
router.post('/reject', verifyToken, leaveController.rejectLeaveApplication);
router.post('/tier', leaveController.updateTierByEmployeeId);
router.post(
  '/deletedtier/newtier',
  leaveController.updateEmployeesToNewTierForDeletedTier
);
router.get('/size/tier/:tier', leaveController.getNumberOfEmployeesInTier);
router.get('/records/all', leaveController.getAllEmployeeLeaveRecords);
router.get('/ph/:year', leaveController.getPublicHolidaysInAYear);

module.exports = router;
