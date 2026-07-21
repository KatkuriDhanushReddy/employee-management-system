const express = require('express');
const { getOrganizationTree } = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/tree', getOrganizationTree);

module.exports = router;
