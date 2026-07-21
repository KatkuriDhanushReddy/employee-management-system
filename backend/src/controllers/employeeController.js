const Employee = require('../models/Employee');
const { wouldCreateCycle } = require('../utils/hierarchy');
const csv = require('csv-parser');
const { Readable } = require('stream');

const populateFields = 'name employeeId designation department role status profileImage';

const getEmployees = async (req, res) => {
  try {
    const {
      search,
      department,
      role,
      status,
      sortBy = 'joiningDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isDeleted: false };

    if (req.user.role === 'Employee') {
      query._id = req.user._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) query.department = department;
    if (role) query.role = role;
    if (status) query.status = status;

    const sortField = ['name', 'joiningDate', 'employeeId', 'department'].includes(sortBy)
      ? sortBy
      : 'joiningDate';
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('reportingManager', populateFields)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: employees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false })
      .populate('reportingManager', populateFields)
      .select('-password');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (req.user.role === 'Employee' && employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this employee' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    if (req.user.role === 'HR Manager' && req.body.role === 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'HR Manager cannot assign Super Admin role',
      });
    }

    const existing = await Employee.findOne({
      $or: [{ email: req.body.email }, { employeeId: req.body.employeeId }],
      isDeleted: false,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email or ID already exists',
      });
    }

    if (req.body.reportingManager) {
      const manager = await Employee.findOne({
        _id: req.body.reportingManager,
        isDeleted: false,
      });
      if (!manager) {
        return res.status(400).json({ success: false, message: 'Reporting manager not found' });
      }
    }

    if (req.file) {
      req.body.profileImage = `/uploads/${req.file.filename}`;
    }

    const employee = await Employee.create(req.body);
    const populated = await Employee.findById(employee._id)
      .populate('reportingManager', populateFields)
      .select('-password');

    res.status(201).json({ success: true, message: 'Employee created', data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate email or employee ID' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (req.user.role === 'Employee') {
      if (employee._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      const allowed = ['name', 'phone', 'profileImage'];
      const updates = {};
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });
      if (req.file) updates.profileImage = `/uploads/${req.file.filename}`;
      Object.assign(employee, updates);
      await employee.save();
      const updated = await Employee.findById(employee._id)
        .populate('reportingManager', populateFields)
        .select('-password');
      return res.json({ success: true, message: 'Profile updated', data: updated });
    }

    if (req.user.role === 'HR Manager') {
      if (req.body.role === 'Super Admin' || employee.role === 'Super Admin') {
        return res.status(403).json({
          success: false,
          message: 'HR Manager cannot modify Super Admin role',
        });
      }
    }

    if (req.body.reportingManager) {
      const cycle = await wouldCreateCycle(employee._id, req.body.reportingManager);
      if (cycle) {
        return res.status(400).json({
          success: false,
          message: 'Circular reporting relationship detected',
        });
      }
    }

    if (req.file) {
      req.body.profileImage = `/uploads/${req.file.filename}`;
    }

    const fields = [
      'employeeId', 'name', 'email', 'phone', 'department', 'designation',
      'salary', 'joiningDate', 'status', 'role', 'reportingManager', 'profileImage',
    ];
    if (req.body.password) {
      employee.password = req.body.password;
    }
    fields.forEach((field) => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });

    await employee.save();
    const updated = await Employee.findById(employee._id)
      .populate('reportingManager', populateFields)
      .select('-password');

    res.json({ success: true, message: 'Employee updated', data: updated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate email or employee ID' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.role === 'Super Admin') {
      const superAdminCount = await Employee.countDocuments({
        role: 'Super Admin',
        isDeleted: false,
      });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the only Super Admin',
        });
      }
    }

    employee.isDeleted = true;
    employee.status = 'Inactive';
    await employee.save();

    res.json({ success: true, message: 'Employee soft-deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReportees = async (req, res) => {
  try {
    const reportees = await Employee.find({
      reportingManager: req.params.id,
      isDeleted: false,
    })
      .populate('reportingManager', populateFields)
      .select('-password')
      .sort({ name: 1 });

    res.json({ success: true, data: reportees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (managerId) {
      const manager = await Employee.findOne({ _id: managerId, isDeleted: false });
      if (!manager) {
        return res.status(400).json({ success: false, message: 'Manager not found' });
      }

      const cycle = await wouldCreateCycle(employee._id, managerId);
      if (cycle) {
        return res.status(400).json({
          success: false,
          message: 'Circular reporting relationship detected',
        });
      }
    }

    employee.reportingManager = managerId || null;
    await employee.save();

    const updated = await Employee.findById(employee._id)
      .populate('reportingManager', populateFields)
      .select('-password');

    res.json({ success: true, message: 'Manager updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const baseQuery = { isDeleted: false };

    const [total, active, inactive, departments] = await Promise.all([
      Employee.countDocuments(baseQuery),
      Employee.countDocuments({ ...baseQuery, status: 'Active' }),
      Employee.countDocuments({ ...baseQuery, status: 'Inactive' }),
      Employee.distinct('department', baseQuery),
    ]);

    const byDepartment = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byRole = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees: total,
        activeEmployees: active,
        inactiveEmployees: inactive,
        departmentCount: departments.length,
        byDepartment,
        byRole,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const importCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'CSV file is required' });
    }

    const rows = [];
    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    const results = { created: 0, failed: 0, errors: [] };

    for (const row of rows) {
      try {
        if (req.user.role === 'HR Manager' && row.role === 'Super Admin') {
          results.failed++;
          results.errors.push({ row: row.email, message: 'Cannot assign Super Admin' });
          continue;
        }

        const existing = await Employee.findOne({
          $or: [{ email: row.email }, { employeeId: row.employeeId }],
          isDeleted: false,
        });
        if (existing) {
          results.failed++;
          results.errors.push({ row: row.email, message: 'Already exists' });
          continue;
        }

        await Employee.create({
          employeeId: row.employeeId,
          name: row.name,
          email: row.email,
          phone: row.phone,
          password: row.password || 'Password@123',
          department: row.department,
          designation: row.designation,
          salary: parseFloat(row.salary),
          joiningDate: new Date(row.joiningDate),
          status: row.status || 'Active',
          role: row.role || 'Employee',
        });
        results.created++;
      } catch (err) {
        results.failed++;
        results.errors.push({ row: row.email, message: err.message });
      }
    }

    res.json({ success: true, message: 'CSV import completed', data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getReportees,
  updateManager,
  getDashboardStats,
  importCSV,
};
