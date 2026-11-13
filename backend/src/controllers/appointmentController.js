const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient or Admin on behalf of patient)
 */
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, patientId, appointmentDate, timeSlot, reason, symptoms } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, appointmentDate, timeSlot, and reason.',
      });
    }

    // Determine target patient
    let targetPatientId = patientId;
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ user: req.user.id });
      if (!patientProfile) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found for current user.',
        });
      }
      targetPatientId = patientProfile._id;
    } else if (!targetPatientId) {
      return res.status(400).json({
        success: false,
        message: 'Admin must specify patientId when booking an appointment.',
      });
    }

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId).populate('user', 'name isActive');
    if (!doctor || (doctor.user && !doctor.user.isActive) || !doctor.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected doctor is not available for appointments.',
      });
    }

    // Check doctor's scheduled working days
    const dateObj = new Date(appointmentDate + 'T00:00:00');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()];
    if (!doctor.availableDays.includes(dayName)) {
      return res.status(400).json({
        success: false,
        message: `Dr. ${doctor.user?.name || ''} does not consult on ${dayName}s.`,
      });
    }

    // Check doctor's valid slots
    if (!doctor.availableTimeSlots.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: `Invalid time slot. Allowed slots: ${doctor.availableTimeSlots.join(', ')}`,
      });
    }

    // Atomic Double Booking Check: Query if slot is already occupied
    const existingActiveBooking = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingActiveBooking) {
      return res.status(409).json({
        success: false,
        message: `Conflict: Dr. ${doctor.user?.name || ''} already has a booking at ${timeSlot} on ${appointmentDate}. Please choose another slot.`,
      });
    }

    // Calculate Token number for the day
    const appointmentsCountToday = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate,
    });
    const tokenNumber = appointmentsCountToday + 1;

    // Create Appointment
    const appointment = await Appointment.create({
      patient: targetPatientId,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      tokenNumber,
      reason,
      symptoms: symptoms || '',
      status: 'pending',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' },
      });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: populatedAppointment,
    });
  } catch (err) {
    // Database unique index fallback for race condition concurrency
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot was just booked by another user. Please pick a different slot.',
      });
    }
    next(err);
  }
};

/**
 * @desc    Get appointments with role-based filtering
 * @route   GET /api/appointments
 * @access  Private
 */
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, date, doctorId, patientId, search } = req.query;
    let query = {};

    // Role-based restrictions
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) return res.status(200).json({ success: true, count: 0, data: [] });
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) return res.status(200).json({ success: true, count: 0, data: [] });
      query.doctor = doctor._id;
    } else if (req.user.role === 'admin') {
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      query.appointmentDate = date;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .sort({ appointmentDate: -1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone avatar' },
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role check
    if (req.user.role === 'patient') {
      if (appointment.patient.user._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (req.user.role === 'doctor') {
      if (appointment.doctor.user._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    // Check if prescription exists for this appointment
    const prescription = await Prescription.findOne({ appointment: appointment._id });

    res.status(200).json({
      success: true,
      data: {
        ...appointment.toObject(),
        prescription: prescription || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update appointment status (Confirm, Complete, Cancel)
 * @route   PUT /api/appointments/:id/status
 * @access  Private
 */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason, doctorNotes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of [${validStatuses.join(', ')}]`,
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'doctor', select: 'user' })
      .populate({ path: 'patient', select: 'user' });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization checks
    if (req.user.role === 'patient') {
      // Patients may only cancel their own pending/confirmed appointments
      if (appointment.patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Patients can only cancel appointments. To confirm or complete, please contact clinic.',
        });
      }
      if (appointment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel an appointment that has already been completed.',
        });
      }
    } else if (req.user.role === 'doctor') {
      // Doctors can confirm, complete, or cancel their assigned appointments
      if (appointment.doctor.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this appointment.',
        });
      }
    }
    // Admins can perform any status transition

    appointment.status = status;
    if (status === 'cancelled') {
      appointment.cancellationReason = cancellationReason || 'Cancelled by user';
      appointment.cancelledBy = req.user.id;
    }
    if (doctorNotes !== undefined) {
      appointment.doctorNotes = doctorNotes;
    }

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' },
      });

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reschedule appointment
 * @route   PUT /api/appointments/:id/reschedule
 * @access  Private (Patient, Doctor, Admin)
 */
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, timeSlot, reason } = req.body;

    if (!appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date and time slot are required.',
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor')
      .populate('patient');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role check
    if (req.user.role === 'patient') {
      if (appointment.patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    } else if (req.user.role === 'doctor') {
      if (appointment.doctor.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule an appointment that is already ${appointment.status}.`,
      });
    }

    // Double-booking check on the new date and slot
    const slotConflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor._id,
      appointmentDate,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (slotConflict) {
      return res.status(409).json({
        success: false,
        message: `The selected slot (${timeSlot} on ${appointmentDate}) is already booked. Please choose another slot.`,
      });
    }

    appointment.appointmentDate = appointmentDate;
    appointment.timeSlot = timeSlot;
    if (reason) {
      appointment.reason = reason;
    }
    appointment.status = 'pending'; // Reset to pending upon reschedule

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' },
      });

    res.status(200).json({
      success: true,
      message: 'Appointment successfully rescheduled',
      data: updated,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot was just booked by another patient.',
      });
    }
    next(err);
  }
};
