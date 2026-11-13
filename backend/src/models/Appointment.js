const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    appointmentDate: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Appointment date is required'],
      trim: true,
    },
    timeSlot: {
      type: String, // e.g., '10:00 AM'
      required: [true, 'Time slot is required'],
      trim: true,
    },
    tokenNumber: {
      type: Number,
      default: 1,
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      maxlength: [300, 'Reason cannot exceed 300 characters'],
      trim: true,
    },
    symptoms: {
      type: String,
      default: '',
      maxlength: [500, 'Symptoms cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    doctorNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Database-level atomic constraint: prevent double booking for pending or confirmed appointments
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
    name: 'unique_active_doctor_slot',
  }
);

// Index for fast query of appointments by patient and doctor
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
