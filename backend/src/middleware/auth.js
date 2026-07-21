const { verifyToken } = require('../utils/jwt');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = verifyToken(token);
    const employee = await Employee.findOne({
      _id: decoded.id,
      isDeleted: false,
    }).select('+password');

    if (!employee) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    if (employee.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }

    req.user = employee;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
