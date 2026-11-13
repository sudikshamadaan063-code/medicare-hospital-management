const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

/**
 * @desc    Create prescription for an appointment
 * @route   POST /api/prescriptions
 * @access  Private (Doctor or Admin)
 */
exports.createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, diagnosis, medicines, generalAdvice, followUpDate } = req.body;

    if (!appointmentId || !diagnosis || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appointmentId, diagnosis, and at least one medicine.',
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor')
      .populate('patient');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role check: Only the assigned doctor or admin can write prescription
    if (
      req.user.role === 'doctor' &&
      appointment.doctor.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to write prescriptions for your own appointments.',
      });
    }

    // Check if prescription already exists for this appointment
    const existing = await Prescription.findOne({ appointment: appointmentId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A prescription already exists for this appointment. You may update it instead.',
      });
    }

    const prescription = await Prescription.create({
      appointment: appointment._id,
      doctor: appointment.doctor._id,
      patient: appointment.patient._id,
      diagnosis,
      medicines,
      generalAdvice: generalAdvice || 'Rest and stay hydrated.',
      followUpDate: followUpDate || '',
    });

    // Mark appointment status as completed
    appointment.status = 'completed';
    await appointment.save();

    const populated = await Prescription.findById(prescription._id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('appointment');

    res.status(201).json({
      success: true,
      message: 'Prescription generated successfully!',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get prescriptions (Role filtered)
 * @route   GET /api/prescriptions
 * @access  Private
 */
exports.getPrescriptions = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) return res.status(200).json({ success: true, count: 0, data: [] });
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) return res.status(200).json({ success: true, count: 0, data: [] });
      query.doctor = doctor._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get prescription by ID or appointment ID
 * @route   GET /api/prescriptions/:id
 * @access  Private
 */
exports.getPrescriptionById = async (req, res, next) => {
  try {
    let prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate('appointment');

    if (!prescription) {
      // Check if parameter is appointment ID
      prescription = await Prescription.findOne({ appointment: req.params.id })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name email phone avatar' },
        })
        .populate({
          path: 'patient',
          populate: { path: 'user', select: 'name email phone avatar' },
        })
        .populate('appointment');
    }

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Role check
    if (req.user.role === 'patient') {
      if (prescription.patient.user._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (req.user.role === 'doctor') {
      if (prescription.doctor.user._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (err) {
    next(err);
  }
};
