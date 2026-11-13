const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * @desc    Get all doctors (with search, department filter, active status)
 * @route   GET /api/doctors
 * @access  Public
 */
exports.getAllDoctors = async (req, res, next) => {
  try {
    const { search, department, specialization, isAvailable } = req.query;
    let query = {};

    if (department && department !== 'All') {
      query.department = new RegExp(`^${department}$`, 'i');
    }

    if (specialization && specialization !== 'All') {
      query.specialization = new RegExp(specialization, 'i');
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    let doctors = await Doctor.find(query).populate('user', 'name email phone avatar isActive');

    // Filter by name/search if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter(
        (doc) =>
          (doc.user && searchRegex.test(doc.user.name)) ||
          searchRegex.test(doc.specialization) ||
          searchRegex.test(doc.department)
      );
    }

    // Filter out inactive users unless admin requested
    if (!req.user || req.user.role !== 'admin') {
      doctors = doctors.filter((doc) => doc.user && doc.user.isActive);
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      'user',
      'name email phone avatar isActive'
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get doctor available slots for a specific date
 * @route   GET /api/doctors/:id/available-slots
 * @access  Public
 */
exports.getDoctorAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "date" (YYYY-MM-DD) is required',
      });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check day of week
    const dateObj = new Date(date + 'T00:00:00');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()];

    const isWorkingDay = doctor.availableDays.includes(dayName);
    if (!isWorkingDay) {
      return res.status(200).json({
        success: true,
        date,
        dayName,
        isWorkingDay: false,
        message: `Doctor is not scheduled to consult on ${dayName}s.`,
        availableSlots: [],
        bookedSlots: [],
      });
    }

    // Query active bookings for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: date,
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map((app) => app.timeSlot);
    const availableSlots = doctor.availableTimeSlots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      date,
      dayName,
      isWorkingDay: true,
      totalSlots: doctor.availableTimeSlots,
      bookedSlots,
      availableSlots,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new doctor (Admin only)
 * @route   POST /api/doctors
 * @access  Private/Admin
 */
exports.createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      department,
      qualifications,
      experienceYears,
      consultationFee,
      bio,
      roomNumber,
      availableDays,
      availableTimeSlots,
    } = req.body;

    // Check if user email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Create doctor user
    const user = await User.create({
      name,
      email,
      password: password || 'doctor123',
      role: 'doctor',
      phone: phone || '',
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      department,
      qualifications: Array.isArray(qualifications) ? qualifications : qualifications ? [qualifications] : ['MBBS'],
      experienceYears: experienceYears || 5,
      consultationFee: consultationFee || 500,
      bio: bio || '',
      roomNumber: roomNumber || 'OPD-101',
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableTimeSlots: availableTimeSlots || undefined,
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate(
      'user',
      'name email phone avatar isActive'
    );

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: populatedDoctor,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update doctor (Admin or assigned Doctor)
 * @route   PUT /api/doctors/:id
 * @access  Private (Admin or Doctor self)
 */
exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Authorization: only admin or the doctor themselves
    if (req.user.role !== 'admin' && doctor.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor profile.',
      });
    }

    const {
      name,
      phone,
      specialization,
      department,
      qualifications,
      experienceYears,
      consultationFee,
      bio,
      roomNumber,
      availableDays,
      availableTimeSlots,
      isAvailable,
      isActive,
    } = req.body;

    // Update User record if name, phone, or isActive provided
    if (name || phone !== undefined || isActive !== undefined) {
      const user = await User.findById(doctor.user);
      if (user) {
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (isActive !== undefined && req.user.role === 'admin') user.isActive = isActive;
        await user.save();
      }
    }

    // Update Doctor details
    if (specialization) doctor.specialization = specialization;
    if (department) doctor.department = department;
    if (qualifications) {
      doctor.qualifications = Array.isArray(qualifications) ? qualifications : [qualifications];
    }
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (bio !== undefined) doctor.bio = bio;
    if (roomNumber !== undefined) doctor.roomNumber = roomNumber;
    if (availableDays) doctor.availableDays = availableDays;
    if (availableTimeSlots) doctor.availableTimeSlots = availableTimeSlots;
    if (isAvailable !== undefined) doctor.isAvailable = isAvailable;

    await doctor.save();

    const updated = await Doctor.findById(doctor._id).populate(
      'user',
      'name email phone avatar isActive'
    );

    res.status(200).json({
      success: true,
      message: 'Doctor details updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete doctor (Admin only)
 * @route   DELETE /api/doctors/:id
 * @access  Private/Admin
 */
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Soft delete or hard delete user
    await User.findByIdAndUpdate(doctor.user, { isActive: false });
    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Doctor removed successfully from active directory',
    });
  } catch (err) {
    next(err);
  }
};
