require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const seedData = [
  {
    employeeId: 'EMP001',
    name: 'Alex Morgan',
    email: 'admin@ems.com',
    phone: '+1-555-0100',
    password: 'Admin@123',
    department: 'Human Resources',
    designation: 'Chief Executive Officer',
    salary: 150000,
    joiningDate: new Date('2020-01-15'),
    status: 'Active',
    role: 'Super Admin',
  },
  {
    employeeId: 'EMP002',
    name: 'Sarah Chen',
    email: 'hr@ems.com',
    phone: '+1-555-0101',
    password: 'Hr@12345',
    department: 'Human Resources',
    designation: 'HR Director',
    salary: 95000,
    joiningDate: new Date('2021-03-10'),
    status: 'Active',
    role: 'HR Manager',
  },
  {
    employeeId: 'EMP003',
    name: 'James Wilson',
    email: 'james@ems.com',
    phone: '+1-555-0102',
    password: 'Emp@12345',
    department: 'Engineering',
    designation: 'Engineering Manager',
    salary: 110000,
    joiningDate: new Date('2021-06-01'),
    status: 'Active',
    role: 'Employee',
  },
  {
    employeeId: 'EMP004',
    name: 'Emily Davis',
    email: 'emily@ems.com',
    phone: '+1-555-0103',
    password: 'Emp@12345',
    department: 'Engineering',
    designation: 'Senior Developer',
    salary: 85000,
    joiningDate: new Date('2022-02-14'),
    status: 'Active',
    role: 'Employee',
  },
  {
    employeeId: 'EMP005',
    name: 'Michael Brown',
    email: 'michael@ems.com',
    phone: '+1-555-0104',
    password: 'Emp@12345',
    department: 'Engineering',
    designation: 'Junior Developer',
    salary: 65000,
    joiningDate: new Date('2023-08-20'),
    status: 'Active',
    role: 'Employee',
  },
  {
    employeeId: 'EMP006',
    name: 'Lisa Anderson',
    email: 'lisa@ems.com',
    phone: '+1-555-0105',
    password: 'Emp@12345',
    department: 'Marketing',
    designation: 'Marketing Manager',
    salary: 90000,
    joiningDate: new Date('2021-09-05'),
    status: 'Active',
    role: 'Employee',
  },
  {
    employeeId: 'EMP007',
    name: 'David Lee',
    email: 'david@ems.com',
    phone: '+1-555-0106',
    password: 'Emp@12345',
    department: 'Finance',
    designation: 'Financial Analyst',
    salary: 75000,
    joiningDate: new Date('2022-11-01'),
    status: 'Inactive',
    role: 'Employee',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Employee.deleteMany({});
    console.log('Cleared existing employees');

    const created = [];
    for (const data of seedData) {
      const emp = await Employee.create(data);
      created.push(emp);
    }

    const admin = created.find((e) => e.employeeId === 'EMP001');
    const hr = created.find((e) => e.employeeId === 'EMP002');
    const engMgr = created.find((e) => e.employeeId === 'EMP003');
    const seniorDev = created.find((e) => e.employeeId === 'EMP004');
    const mktMgr = created.find((e) => e.employeeId === 'EMP006');

    await Employee.findByIdAndUpdate(hr._id, { reportingManager: admin._id });
    await Employee.findByIdAndUpdate(engMgr._id, { reportingManager: admin._id });
    await Employee.findByIdAndUpdate(seniorDev._id, { reportingManager: engMgr._id });
    await Employee.findByIdAndUpdate(
      created.find((e) => e.employeeId === 'EMP005')._id,
      { reportingManager: engMgr._id }
    );
    await Employee.findByIdAndUpdate(mktMgr._id, { reportingManager: hr._id });
    await Employee.findByIdAndUpdate(
      created.find((e) => e.employeeId === 'EMP007')._id,
      { reportingManager: hr._id }
    );

    console.log('Seed data created successfully!');
    console.log('\n--- Login Credentials ---');
    console.log('Super Admin: admin@ems.com / Admin@123');
    console.log('HR Manager:  hr@ems.com / Hr@12345');
    console.log('Employee:    james@ems.com / Emp@12345');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
