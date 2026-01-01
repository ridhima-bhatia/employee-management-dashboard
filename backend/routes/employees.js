const router = require('express').Router();
const Employee = require('../models/employee.model');

// GET all employees with robust filtering capabilities
router.route('/').get((req, res) => {
  const { department, gender, startDate, endDate } = req.query;
  let filter = {};

  if (department) {
    filter.department = department;
  }
  if (gender) {
    filter.gender = gender;
  }

  // Only add the date filter if both start and end dates are provided and valid
  if (startDate && endDate) {
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    
    // Check if the dates created are valid before adding to the filter
    if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
      filter.dateOfJoining = {
        $gte: sDate,
        $lte: eDate,
      };
    }
  }

  Employee.find(filter)
    .then(employees => res.json(employees))
    .catch(err => res.status(400).json({ message: 'Error fetching data', error: err }));
});

// POST: Add a new employee
router.route('/add').post((req, res) => {
  const newEmployee = new Employee({ ...req.body });
  newEmployee.save()
    .then(() => res.json({ message: 'Employee added successfully!' }))
    .catch(err => res.status(400).json('Error: ' + err));
});

// POST: Update an employee by ID
router.route('/update/:id').post((req, res) => {
  Employee.findOne({ id: req.params.id })
    .then(employee => {
      if (!employee) {
        return res.status(404).json('Error: Employee not found');
      }
      Object.assign(employee, req.body);
      employee.save()
        .then(() => res.json({ message: 'Employee updated successfully!' }))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// DELETE: Remove an employee by ID
router.route('/:id').delete((req, res) => {
  Employee.findOneAndDelete({ id: req.params.id })
    .then(() => res.json({ message: 'Employee deleted successfully.' }))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
