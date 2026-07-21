const Employee = require('../models/Employee');

/**
 * Check if assigning managerId as manager of employeeId would create a cycle.
 */
const wouldCreateCycle = async (employeeId, managerId) => {
  if (!managerId) return false;
  if (employeeId.toString() === managerId.toString()) return true;

  let current = await Employee.findOne({ _id: managerId, isDeleted: false });
  const visited = new Set([employeeId.toString()]);

  while (current) {
    if (current._id.toString() === employeeId.toString()) return true;
    if (!current.reportingManager) break;
    const nextId = current.reportingManager.toString();
    if (visited.has(nextId)) return true;
    visited.add(nextId);
    current = await Employee.findOne({ _id: nextId, isDeleted: false });
  }

  return false;
};

module.exports = { wouldCreateCycle };
