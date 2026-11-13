const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Helper to format user response
const sendTokenResponse = (user, statusCode, res, extraData = {}) => {
  const token = user.generateJWT();
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    ...extraData,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

/**
 * @desc    Register a new patient
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, gender, dateOfBirth, bloodGroup, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Always enforce patient role on public registration
    const user = await User.create({
      name,
      email,
      password,
      role: 'patient',
      phone: phone || '',
    });

    // Create Patient profile
    const patient = await Patient.create({
      user: user._id,
      gender: gender || 'Not Specified',
      dateOfBirth: dateOfBirth || null,
      bloodGroup: bloodGroup || 'Unknown',
      address: address || {},
    });

    sendTokenResponse(user, 201, res, { patientProfileId: patient._id });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user (Admin, Doctor, or Patient)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user with password included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact hospital administrator.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Optional role check if logging in through role-specific portal
    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized portal. This account has the role of '${user.role}', but the '${expectedRole}' portal was requested.`,
      });
    }

    let extraData = {};
    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: user._id });
      if (doctorProfile) {
        extraData.doctorProfileId = doctorProfile._id;
        extraData.specialization = doctorProfile.specialization;
        extraData.department = doctorProfile.department;
      }
    } else if (user.role === 'patient') {
      const patientProfile = await Patient.findOne({ user: user._id });
      if (patientProfile) {
        extraData.patientProfileId = patientProfile._id;
      }
    }

    sendTokenResponse(user, 200, res, extraData);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get currently logged in user + role profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'doctor') {
      profile = await Doctor.findOne({ user: user._id });
    } else if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, patientDetails, doctorDetails } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;
    await user.save();

    let profile = null;
    if (user.role === 'patient' && patientDetails) {
      profile = await Patient.findOneAndUpdate(
        { user: user._id },
        { $set: patientDetails },
        { new: true, runValidators: true }
      );
    } else if (user.role === 'doctor' && doctorDetails) {
      profile = await Doctor.findOneAndUpdate(
        { user: user._id },
        { $set: doctorDetails },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
      profile,
    });
  } catch (err) {
    next(err);
  }
};
