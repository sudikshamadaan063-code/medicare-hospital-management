const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const User = require('../models/User');

/**
 * @desc    Get dashboard metrics & statistical reports based on user role
 * @route   GET /api/stats
 * @access  Private
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    if (req.user.role === 'admin') {
      const [
        totalDoctors,
        totalPatients,
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        recentAppointments,
        totalPrescriptions,
      ] = await Promise.all([
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Appointment.countDocuments(),
        Appointment.countDocuments({ appointmentDate: today }),
        Appointment.countDocuments({ status: 'pending' }),
        Appointment.countDocuments({ status: 'confirmed' }),
        Appointment.countDocuments({ status: 'completed' }),
        Appointment.countDocuments({ status: 'cancelled' }),
        Appointment.find()
          .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
          .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
          .sort({ createdAt: -1 })
          .limit(6),
        Prescription.countDocuments(),
      ]);

      // Department distribution
      const doctorsByDepartment = await Doctor.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalDoctors,
          totalPatients,
          totalAppointments,
          todayAppointments,
          totalPrescriptions,
          statusBreakdown: {
            pending: pendingAppointments,
            confirmed: confirmedAppointments,
            completed: completedAppointments,
            cancelled: cancelledAppointments,
          },
          departmentDistribution: doctorsByDepartment.map((d) => ({
            department: d._id || 'General',
            count: d.count,
          })),
          recentAppointments,
        },
      });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }

      const [
        todayAppointments,
        upcomingAppointments,
        completedConsultations,
        totalPrescriptions,
        recentAppointments,
      ] = await Promise.all([
        Appointment.find({
          doctor: doctor._id,
          appointmentDate: today,
          status: { $in: ['pending', 'confirmed'] },
        }).populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } }),
        Appointment.find({
          doctor: doctor._id,
          appointmentDate: { $gte: today },
          status: { $in: ['pending', 'confirmed'] },
        }).countDocuments(),
        Appointment.countDocuments({
          doctor: doctor._id,
          status: 'completed',
        }),
        Prescription.countDocuments({ doctor: doctor._id }),
        Appointment.find({ doctor: doctor._id })
          .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
          .sort({ appointmentDate: -1, timeSlot: 1 })
          .limit(8),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          todayAppointmentsCount: todayAppointments.length,
          upcomingAppointmentsCount: upcomingAppointments,
          completedConsultations,
          totalPrescriptions,
          todaySchedule: todayAppointments,
          recentAppointments,
        },
      });
    }

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient profile not found' });
      }

      const [
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        prescriptionsCount,
        recentBookings,
      ] = await Promise.all([
        Appointment.countDocuments({ patient: patient._id }),
        Appointment.countDocuments({
          patient: patient._id,
          appointmentDate: { $gte: today },
          status: { $in: ['pending', 'confirmed'] },
        }),
        Appointment.countDocuments({
          patient: patient._id,
          status: 'completed',
        }),
        Prescription.countDocuments({ patient: patient._id }),
        Appointment.find({ patient: patient._id })
          .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
          .sort({ appointmentDate: -1 })
          .limit(5),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalAppointments,
          upcomingAppointments,
          completedAppointments,
          prescriptionsCount,
          recentBookings,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};
