const { body } = require('express-validator');
const { DEPARTMENTS, ROLES, STATUSES } = require('../models/Employee');

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const employeeCreateValidation = [
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone')
    .matches(/^[+]?[\d\s()-]{7,20}$/)
    .withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').isIn(DEPARTMENTS).withMessage('Invalid department'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('salary').isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('joiningDate').isISO8601().withMessage('Valid joining date is required'),
  body('status').optional().isIn(STATUSES).withMessage('Invalid status'),
  body('role').optional().isIn(ROLES).withMessage('Invalid role'),
  body('reportingManager').optional({ nullable: true }).isMongoId().withMessage('Invalid manager ID'),
];

const employeeUpdateValidation = [
  body('employeeId').optional().trim().notEmpty().withMessage('Employee ID cannot be empty'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s()-]{7,20}$/)
    .withMessage('Valid phone number is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').optional().isIn(DEPARTMENTS).withMessage('Invalid department'),
  body('designation').optional().trim().notEmpty().withMessage('Designation is required'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('joiningDate').optional().isISO8601().withMessage('Valid joining date is required'),
  body('status').optional().isIn(STATUSES).withMessage('Invalid status'),
  body('role').optional().isIn(ROLES).withMessage('Invalid role'),
  body('reportingManager').optional({ nullable: true }).isMongoId().withMessage('Invalid manager ID'),
];

const managerValidation = [
  body('managerId').optional({ nullable: true }).isMongoId().withMessage('Invalid manager ID'),
];

module.exports = {
  loginValidation,
  employeeCreateValidation,
  employeeUpdateValidation,
  managerValidation,
};
