const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required (e.g., 500mg)'],
    trim: true,
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required (e.g., 1-0-1 or Twice daily)'],
    trim: true,
  },
  duration: {
    type: String,
    required: [true, 'Duration is required (e.g., 5 days)'],
    trim: true,
  },
  instructions: {
    type: String,
    default: 'Take after meals',
    trim: true,
  },
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
      unique: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    medicines: {
      type: [medicineItemSchema],
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: 'Prescription must contain at least one medicine',
      },
    },
    generalAdvice: {
      type: String,
      default: 'Drink plenty of water and get adequate rest.',
    },
    followUpDate: {
      type: String, // Format: YYYY-MM-DD
      default: '',
    },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
