const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * @desc    Get all patients (Admin or Doctor)
 * @route   GET /api/patients
 * @access  Private (Admin or Doctor)
 */
exports.getAllPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    let patients = await Patient.find().populate('user', 'name email phone avatar isActive createdAt');

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      patients = patients.filter(
        (p) =>
          (p.user && searchRegex.test(p.user.name)) ||
          (p.user && searchRegex.test(p.user.email)) ||
          (p.user && searchRegex.test(p.user.phone)) ||
          (p.bloodGroup && searchRegex.test(p.bloodGroup))
      );
    }

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get patient by ID
 * @route   GET /api/patients/:id
 * @access  Private
 */
exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      'user',
      'name email phone avatar isActive createdAt'
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Role check: Patient can only view self; Doctor and Admin can view
    if (
      req.user.role === 'patient' &&
      patient.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own patient record.',
      });
    }

    // Include recent appointment count
    const appointmentsCount = await Appointment.countDocuments({ patient: patient._id });

    res.status(200).json({
      success: true,
      data: {
        ...patient.toObject(),
        totalAppointments: appointmentsCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update patient details
 * @route   PUT /api/patients/:id
 * @access  Private (Admin or Patient self)
 */
exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Authorization
    if (
      req.user.role !== 'admin' &&
      patient.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this patient record.',
      });
    }

    const {
      name,
      phone,
      gender,
      dateOfBirth,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicConditions,
    } = req.body;

    if (name || phone !== undefined) {
      const user = await User.findById(patient.user);
      if (user) {
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        await user.save();
      }
    }

    if (gender) patient.gender = gender;
    if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (address) patient.address = { ...patient.address, ...address };
    if (emergencyContact) patient.emergencyContact = { ...patient.emergencyContact, ...emergencyContact };
    if (allergies) patient.allergies = allergies;
    if (chronicConditions) patient.chronicConditions = chronicConditions;

    await patient.save();

    const updated = await Patient.findById(patient._id).populate('user', 'name email phone avatar');

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
