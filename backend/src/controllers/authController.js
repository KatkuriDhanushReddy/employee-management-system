const Employee = require('../models/Employee');
const { generateToken } = require('../utils/jwt');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email, isDeleted: false }).select('+password');
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (employee.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({ id: employee._id, role: employee.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: employee.toSafeObject(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (_req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user._id)
      .populate('reportingManager', 'name employeeId designation department')
      .select('-password');

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login, logout, getMe };
