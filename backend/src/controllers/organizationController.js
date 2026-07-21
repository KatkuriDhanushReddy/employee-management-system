const Employee = require('../models/Employee');

const buildTree = async (managerId = null) => {
  const employees = await Employee.find({
    reportingManager: managerId,
    isDeleted: false,
  })
    .select('name employeeId designation department role status profileImage reportingManager')
    .sort({ name: 1 });

  const tree = [];
  for (const emp of employees) {
    const node = {
      _id: emp._id,
      employeeId: emp.employeeId,
      name: emp.name,
      designation: emp.designation,
      department: emp.department,
      role: emp.role,
      status: emp.status,
      profileImage: emp.profileImage,
      children: await buildTree(emp._id),
    };
    tree.push(node);
  }
  return tree;
};

const getOrganizationTree = async (_req, res) => {
  try {
    const tree = await buildTree(null);
    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getOrganizationTree };
