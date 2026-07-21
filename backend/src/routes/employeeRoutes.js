const express = require('express');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getReportees,
  updateManager,
  getDashboardStats,
  importCSV,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  employeeCreateValidation,
  employeeUpdateValidation,
  managerValidation,
} = require('../validators/auth');
const { upload, csvUpload } = require('../utils/upload');

const router = express.Router();

router.use(protect);

router.get('/dashboard/stats', authorize('Super Admin', 'HR Manager'), getDashboardStats);

router.post(
  '/import/csv',
  authorize('Super Admin', 'HR Manager'),
  csvUpload.single('file'),
  importCSV
);

router.get('/', getEmployees);
router.get('/:id/reportees', getReportees);
router.get('/:id', getEmployeeById);

router.post(
  '/',
  authorize('Super Admin', 'HR Manager'),
  upload.single('profileImage'),
  employeeCreateValidation,
  validate,
  createEmployee
);

router.put(
  '/:id',
  upload.single('profileImage'),
  employeeUpdateValidation,
  validate,
  updateEmployee
);

router.patch(
  '/:id/manager',
  authorize('Super Admin', 'HR Manager'),
  managerValidation,
  validate,
  updateManager
);

router.delete('/:id', authorize('Super Admin'), deleteEmployee);

module.exports = router;
