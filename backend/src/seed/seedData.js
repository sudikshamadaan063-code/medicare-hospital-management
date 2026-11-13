require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicare_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected. Clearing existing collections...');

    // Clear existing collections safely
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});

    console.log('Creating Admin Account...');
    const adminUser = await User.create({
      name: 'Hospital Chief Administrator',
      email: 'admin@medicare.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    });

    console.log('Creating Doctors...');
    const doctorUsersData = [
      {
        name: 'Dr. Priya Sharma',
        email: 'dr.sharma@medicare.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '+1 (555) 234-5678',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        doctorData: {
          specialization: 'Cardiology',
          department: 'Cardiology',
          qualifications: ['MBBS', 'MD (Cardiology)', 'FACC'],
          experienceYears: 12,
          consultationFee: 750,
          roomNumber: 'Cardio-Suite 201',
          rating: 4.9,
          bio: 'Specialist in non-invasive clinical cardiology, coronary artery disease, preventative cardiovascular therapeutics, and hypertension management.',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableTimeSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM'],
        },
      },
      {
        name: 'Dr. Sarah Jenkins',
        email: 'dr.sarah@medicare.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '+1 (555) 345-6789',
        avatar: 'https://images.unsplash.com/photo-1594824813571-638f02638523?auto=format&fit=crop&q=80&w=300',
        doctorData: {
          specialization: 'Neurology',
          department: 'Neurology',
          qualifications: ['MBBS', 'DM (Neurology)', 'Fellow Johns Hopkins'],
          experienceYears: 14,
          consultationFee: 850,
          roomNumber: 'Neuro-Wing 305',
          rating: 4.95,
          bio: 'Expert neurologist focusing on headache management, epilepsy, stroke rehabilitation, and neuro-degenerative disorders.',
          availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
          availableTimeSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'],
        },
      },
      {
        name: 'Dr. Rajesh Patel',
        email: 'dr.patel@medicare.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '+1 (555) 456-7890',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
        doctorData: {
          specialization: 'Orthopedics',
          department: 'Orthopedics',
          qualifications: ['MBBS', 'MS (Orthopedics)', 'MCh Ortho'],
          experienceYears: 10,
          consultationFee: 650,
          roomNumber: 'Ortho-Care 104',
          rating: 4.85,
          bio: 'Orthopedic specialist in joint preservation, arthroscopy, sports injuries, fracture management, and spine biomechanics.',
          availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          availableTimeSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
        },
      },
      {
        name: 'Dr. Ananya Sen',
        email: 'dr.ananya@medicare.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '+1 (555) 567-8901',
        avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300',
        doctorData: {
          specialization: 'Pediatrics',
          department: 'Pediatrics',
          qualifications: ['MBBS', 'MD (Pediatrics)', 'DNB'],
          experienceYears: 8,
          consultationFee: 500,
          roomNumber: 'Pediatric-Zone 108',
          rating: 4.9,
          bio: 'Compassionate pediatrician focused on neonatal care, childhood nutrition, vaccination regimens, and pediatric infectious conditions.',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableTimeSlots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:30 PM'],
        },
      },
      {
        name: 'Dr. Vikram Verma',
        email: 'dr.vikram@medicare.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '+1 (555) 678-9012',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
        doctorData: {
          specialization: 'General Medicine',
          department: 'Internal Medicine',
          qualifications: ['MBBS', 'MD (Internal Medicine)'],
          experienceYears: 16,
          consultationFee: 500,
          roomNumber: 'OPD-102',
          rating: 4.8,
          bio: 'Primary care clinician with comprehensive expertise in diabetes, lifestyle disorders, metabolic health, and geriatrics.',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          availableTimeSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM'],
        },
      },
      {
        name: 'Dr. Maya Iyer',
        email: 'dr.maya@medicare.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '+1 (555) 789-0123',
        avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300',
        doctorData: {
          specialization: 'Dermatology',
          department: 'Dermatology',
          qualifications: ['MBBS', 'MD (Dermatology, Venereology & Leprosy)'],
          experienceYears: 7,
          consultationFee: 600,
          roomNumber: 'Derma-Studio 210',
          rating: 4.75,
          bio: 'Clinical dermatologist offering advanced diagnosis for acne, eczema, psoriasis, autoimmune dermatoses, and aesthetic skin care.',
          availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
          availableTimeSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'],
        },
      },
    ];

    const seededDoctors = [];
    for (const item of doctorUsersData) {
      const user = await User.create({
        name: item.name,
        email: item.email,
        password: item.password,
        role: item.role,
        phone: item.phone,
        avatar: item.avatar,
      });

      const doctor = await Doctor.create({
        user: user._id,
        ...item.doctorData,
      });

      seededDoctors.push({ user, doctor });
    }

    console.log(`Seeded ${seededDoctors.length} doctors.`);

    console.log('Creating Patients...');
    const patientUsersData = [
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        password: 'patient123',
        role: 'patient',
        phone: '+1 (555) 912-3456',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        patientData: {
          dateOfBirth: new Date('1994-05-14'),
          gender: 'Male',
          bloodGroup: 'B+',
          address: { street: '42 Lotus Avenue', city: 'Metropolis', state: 'CA', zipCode: '90210' },
          emergencyContact: { name: 'Sunita Verma', relationship: 'Spouse', phone: '+1 (555) 912-3457' },
          allergies: ['Penicillin', 'Peanuts'],
          chronicConditions: ['Mild Asthma'],
        },
      },
      {
        name: 'Priya Nair',
        email: 'priya.nair@example.com',
        password: 'patient123',
        role: 'patient',
        phone: '+1 (555) 823-4567',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        patientData: {
          dateOfBirth: new Date('1998-11-23'),
          gender: 'Female',
          bloodGroup: 'O+',
          address: { street: '18 Garden Ridge Way', city: 'Metropolis', state: 'CA', zipCode: '90211' },
          emergencyContact: { name: 'Karthik Nair', relationship: 'Brother', phone: '+1 (555) 823-4568' },
          allergies: ['Dust Mites'],
          chronicConditions: [],
        },
      },
      {
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        password: 'patient123',
        role: 'patient',
        phone: '+1 (555) 734-5678',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        patientData: {
          dateOfBirth: new Date('1982-08-30'),
          gender: 'Male',
          bloodGroup: 'A+',
          address: { street: '74 Pine Valley Drive', city: 'Metropolis', state: 'CA', zipCode: '90212' },
          emergencyContact: { name: 'Meena Kumar', relationship: 'Spouse', phone: '+1 (555) 734-5679' },
          allergies: [],
          chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
        },
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        password: 'patient123',
        role: 'patient',
        phone: '+1 (555) 645-6789',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        patientData: {
          dateOfBirth: new Date('2001-02-17'),
          gender: 'Female',
          bloodGroup: 'AB+',
          address: { street: '109 University Heights', city: 'Metropolis', state: 'CA', zipCode: '90213' },
          emergencyContact: { name: 'V. Reddy', relationship: 'Parent', phone: '+1 (555) 645-6780' },
          allergies: ['Sulfa drugs'],
          chronicConditions: ['Migraine'],
        },
      },
    ];

    const seededPatients = [];
    for (const item of patientUsersData) {
      const user = await User.create({
        name: item.name,
        email: item.email,
        password: item.password,
        role: item.role,
        phone: item.phone,
        avatar: item.avatar,
      });

      const patient = await Patient.create({
        user: user._id,
        ...item.patientData,
      });

      seededPatients.push({ user, patient });
    }

    console.log(`Seeded ${seededPatients.length} patients.`);

    // Today's date format
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Helper for offsets
    const getDateOffset = (days) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    console.log('Creating Realistic Appointments...');
    const appt1 = await Appointment.create({
      patient: seededPatients[0].patient._id, // Rahul
      doctor: seededDoctors[0].doctor._id, // Dr. Priya Sharma (Cardio)
      appointmentDate: todayStr,
      timeSlot: '09:30 AM',
      tokenNumber: 1,
      reason: 'Routine cardiovascular checkup and mild palpitations follow-up',
      symptoms: 'Occasional flutter in chest after morning jogging',
      status: 'confirmed',
    });

    const appt2 = await Appointment.create({
      patient: seededPatients[1].patient._id, // Priya
      doctor: seededDoctors[1].doctor._id, // Dr. Sarah Jenkins (Neuro)
      appointmentDate: todayStr,
      timeSlot: '10:30 AM',
      tokenNumber: 1,
      reason: 'Recurrent morning headaches and eye strain',
      symptoms: 'Throbbing pain on right temple for 2 weeks',
      status: 'pending',
    });

    const appt3 = await Appointment.create({
      patient: seededPatients[2].patient._id, // Amit
      doctor: seededDoctors[4].doctor._id, // Dr. Vikram Verma (General Medicine)
      appointmentDate: getDateOffset(-2), // 2 days ago
      timeSlot: '10:00 AM',
      tokenNumber: 1,
      reason: 'Quarterly diabetic management review and HbA1c review',
      symptoms: 'Mild fatigue in late afternoons',
      status: 'completed',
    });

    const appt4 = await Appointment.create({
      patient: seededPatients[3].patient._id, // Sneha
      doctor: seededDoctors[2].doctor._id, // Dr. Patel (Ortho)
      appointmentDate: getDateOffset(2), // 2 days ahead
      timeSlot: '11:30 AM',
      tokenNumber: 1,
      reason: 'Right ankle swelling after badminton match',
      symptoms: 'Localized pain upon weight bearing',
      status: 'confirmed',
    });

    const appt5 = await Appointment.create({
      patient: seededPatients[0].patient._id, // Rahul
      doctor: seededDoctors[5].doctor._id, // Dr. Maya Iyer (Derma)
      appointmentDate: getDateOffset(-5), // 5 days ago
      timeSlot: '02:00 PM',
      tokenNumber: 1,
      reason: 'Contact dermatitis consultation',
      symptoms: 'Itchy erythematous rash on forearms',
      status: 'completed',
    });

    const appt6 = await Appointment.create({
      patient: seededPatients[1].patient._id, // Priya
      doctor: seededDoctors[0].doctor._id, // Dr. Priya Sharma
      appointmentDate: getDateOffset(3),
      timeSlot: '10:00 AM',
      tokenNumber: 1,
      reason: 'Pre-athletic health clearance screening',
      symptoms: 'None',
      status: 'pending',
    });

    console.log('Creating Seed Prescriptions...');
    // Prescription for Completed Appointment #3 (Dr. Vikram -> Amit)
    await Prescription.create({
      appointment: appt3._id,
      doctor: seededDoctors[4].doctor._id,
      patient: seededPatients[2].patient._id,
      diagnosis: 'Type 2 Diabetes Mellitus with Essential Hypertension (Well Controlled)',
      medicines: [
        {
          name: 'Metformin Hydrochloride 500mg (Glucophage)',
          dosage: '500 mg',
          frequency: 'Twice daily (1-0-1)',
          duration: '30 days',
          instructions: 'Take immediately after breakfast and dinner',
        },
        {
          name: 'Telmisartan 40mg',
          dosage: '40 mg',
          frequency: 'Once daily (1-0-0)',
          duration: '30 days',
          instructions: 'Take in morning with a glass of water',
        },
        {
          name: 'Alpha Lipoic Acid & Vitamin B12 Complex',
          dosage: '1 capsule',
          frequency: 'Once daily at night (0-0-1)',
          duration: '30 days',
          instructions: 'Supports peripheral nerve health',
        },
      ],
      generalAdvice: 'Maintain a low glycemic index diet. Walk 30 minutes daily. Recheck fasting blood glucose in 4 weeks.',
      followUpDate: getDateOffset(28),
    });

    // Prescription for Completed Appointment #5 (Dr. Maya -> Rahul)
    await Prescription.create({
      appointment: appt5._id,
      doctor: seededDoctors[5].doctor._id,
      patient: seededPatients[0].patient._id,
      diagnosis: 'Acute Contact Allergic Dermatitis',
      medicines: [
        {
          name: 'Hydrocortisone 1% Topical Cream',
          dosage: 'Thin film application',
          frequency: 'Twice daily',
          duration: '7 days',
          instructions: 'Apply gently to affected rash area only',
        },
        {
          name: 'Cetirizine 10mg',
          dosage: '10 mg',
          frequency: 'Once daily at bedtime (0-0-1)',
          duration: '5 days',
          instructions: 'For relief of pruritus and itchiness',
        },
        {
          name: 'Cetaphil Restoraderm Moisturizing Wash',
          dosage: 'As required',
          frequency: 'During shower',
          duration: '14 days',
          instructions: 'Use mild, lukewarm water; avoid harsh perfumed soaps',
        },
      ],
      generalAdvice: 'Avoid synthetic fabric friction and chemical detergents. Keep area cool and moisturized.',
      followUpDate: getDateOffset(10),
    });

    console.log('===========================================================');
    console.log(' MediCare Hospital Database Successfully Seeded!');
    console.log('===========================================================');
    console.log('Demo Credentials for Testing:');
    console.log('-----------------------------------------------------------');
    console.log('1. Admin Account:');
    console.log('   Email:    admin@medicare.com');
    console.log('   Password: admin123');
    console.log('-----------------------------------------------------------');
    console.log('2. Doctor Accounts:');
    console.log('   Cardiologist: dr.sharma@medicare.com / doctor123');
    console.log('   Neurologist:  dr.sarah@medicare.com  / doctor123');
    console.log('   Orthopedic:   dr.patel@medicare.com  / doctor123');
    console.log('   Pediatrician: dr.ananya@medicare.com / doctor123');
    console.log('   General Med:  dr.vikram@medicare.com / doctor123');
    console.log('   Dermatology:  dr.maya@medicare.com   / doctor123');
    console.log('-----------------------------------------------------------');
    console.log('3. Patient Accounts:');
    console.log('   Patient 1:    rahul.verma@example.com / patient123');
    console.log('   Patient 2:    priya.nair@example.com  / patient123');
    console.log('   Patient 3:    amit.kumar@example.com  / patient123');
    console.log('===========================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Database seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
