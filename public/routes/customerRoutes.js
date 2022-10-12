const router = require('express').Router();
const customerController = require('../controllers/customerController');

router.post('/', customerController.createCustomer);
router.get('/all', customerController.getAllCustomers);
router.get('/id/:id', customerController.getCustomerById);
router.post('/email', customerController.getCustomerByEmail);
router.put('/', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.post('/excel', customerController.generateExcel);
module.exports = router;
