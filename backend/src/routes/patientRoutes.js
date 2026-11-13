const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  updatePatient,
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, authorize('admin', 'doctor'), getAllPatients);
router.get('/:id', protect, getPatientById);
router.put('/:id', protect, updatePatient);

module.exports = router;
