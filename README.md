# MediCare – Hospital Management System
### *B.Tech CSE Capstone Project (Full Stack Web Development)*

---

## 📌 Executive Summary

**MediCare** is a modern, responsive, full-stack Hospital Management System designed to optimize medical workflows, doctor schedules, patient consultations, electronic medical records (EMR), and prescription generation.

Built with the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** and styled with **Tailwind CSS**, MediCare provides Role-Based Access Control (RBAC) across three distinct user roles: **Admin**, **Doctor**, and **Patient**. It features an **atomic double-booking prevention engine** at the database layer to eliminate appointment concurrency conflicts.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite | Single-Page Application (SPA) architecture with React Router v6 |
| **Styling & UI** | Tailwind CSS, Lucide Icons | Responsive modern design, Blue/Teal healthcare aesthetic, Confetti triggers |
| **State & Auth** | Context API, Axios | JWT client-side token persistence with automated interceptors |
| **Backend** | Node.js, Express.js | Modular RESTful API architecture with centralized error handling |
| **Database** | MongoDB & Mongoose ORM | Schema validation, compound indexing, partial unique constraints |
| **Security** | JWT, bcryptjs | Password hashing (salt rounds: 10), role-based middleware guards |
| **Testing** | Jest, Supertest | Automated unit & integration tests for auth, RBAC, and double-booking |
| **Deployment** | Vercel, Render, Atlas | Frontend on Vercel CDN, Backend on Render, Database on MongoDB Atlas |

---

## 👥 Role-Based Access Control (RBAC)

```
                            ┌───────────────────────────────┐
                            │    MediCare Authentication    │
                            │   (JWT & Password Hashing)    │
                            └───────────────┬───────────────┘
                                            │
                ┌───────────────────────────┼───────────────────────────┐
                ▼                           ▼                           ▼
      ┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
      │   Admin Portal   │        │  Doctor Portal   │        │  Patient Portal  │
      ├──────────────────┤        ├──────────────────┤        ├──────────────────┤
      │ • Doctor CRUD    │        │ • Today's Schedule│       │ • Doctor Finder  │
      │ • Patient Records│        │ • Consultation Rx│        │ • Real-time Book │
      │ • Appt Manager   │        │ • Patient Detail │        │ • Appt History   │
      │ • Hospital Stats │        │ • Slot Config    │        │ • Rx PDF Viewer  │
      │ • Reports Audit  │        │ • OPD Status     │        │ • Medical EMR    │
      └──────────────────┘        └──────────────────┘        └──────────────────┘
```

### 1. Admin Role
- **Doctor Faculty Management**: Add new doctors, update credentials, change room allocations, toggle active status, or remove records.
- **Patient Directory**: Search electronic health records, blood groups, and emergency contacts.
- **Appointment Control**: View hospital-wide bookings, approve pending requests, reschedule, or cancel slots.
- **Executive Analytics**: Interactive metrics on appointment distribution, status breakdowns, and departmental workload.

### 2. Doctor Role
- **Consultation Workstation**: Real-time queue of today’s consultations sorted by token sequence.
- **Clinical Prescription (Rx) Creator**: Issue verified digital prescriptions containing medicines, dosage, frequency, course duration, instructions, and follow-up advice.
- **Patient Medical History**: Review allergies, chronic conditions, and previous consultation notes.
- **Availability Manager**: Toggle weekly consultation days, clinic suites, fees, and active OPD availability.

### 3. Patient Role
- **Specialist Directory**: Search and filter doctors by medical department and condition.
- **Real-Time Appointment Booking**: View available time slots for any doctor on any date with booked slots locked out.
- **Personal Dashboard**: Track upcoming visits, reschedule consultations, or cancel appointments.
- **Electronic Health Record**: Store blood group, emergency contact details, allergies, and chronic medical history.
- **Digital Prescription Archive**: View and print official medical prescriptions with hospital branding.

---

## ⚡ Concurrency & Double-Booking Prevention Architecture

A primary requirement of MediCare is eliminating double booking of doctors. This is enforced through a two-layer defense mechanism:

1. **Application-Layer Validation (`appointmentController.js`)**:
   - Queries existing active appointments matching `doctor`, `appointmentDate`, and `timeSlot` where `status IN ['pending', 'confirmed']`.
   - If an active booking exists, immediately rejects the request with HTTP **409 Conflict** and returns a user-friendly message.

2. **Database-Layer Compound Partial Unique Index (`Appointment.js`)**:
   ```javascript
   appointmentSchema.index(
     { doctor: 1, appointmentDate: 1, timeSlot: 1 },
     {
       unique: true,
       partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
       name: 'unique_active_doctor_slot'
     }
   );
   ```
   - **Atomic Concurrency Guarantee**: If two patients submit bookings for the identical doctor and slot in the exact same millisecond, MongoDB’s storage engine atomically accepts the first document and rejects the second with an `E11000` duplicate key exception.
   - **Automatic Slot Recovery**: When an appointment status changes to `cancelled`, it falls outside the partial filter expression, making the slot immediately available for booking by other patients.

---

## 📁 Project Directory Structure

```
medicare-hospital-management/
├── package.json                    # Root orchestration scripts
├── README.md                       # Comprehensive project documentation
├── DEPLOYMENT.md                   # Production deployment manual
├── backend/
│   ├── package.json
│   ├── server.js                   # Entry point, DB connection, server bootstrap
│   ├── .env.example
│   ├── .env
│   ├── src/
│   │   ├── app.js                  # Express middleware, CORS, route registration
│   │   ├── config/
│   │   │   └── db.js               # MongoDB Mongoose connection handler
│   │   ├── models/                 # Mongoose schemas & constraints
│   │   │   ├── User.js             # User accounts & auth methods
│   │   │   ├── Doctor.js           # Doctor profiles, fees, availability
│   │   │   ├── Patient.js          # Patient medical profile & emergency contacts
│   │   │   ├── Appointment.js      # Appointments with partial unique index
│   │   │   └── Prescription.js     # Clinical prescriptions & medications
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT Bearer verification
│   │   │   ├── roleCheck.js        # RBAC role guards
│   │   │   └── errorHandler.js     # Centralized error handler & status codes
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── doctorController.js
│   │   │   ├── patientController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── prescriptionController.js
│   │   │   └── statsController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── doctorRoutes.js
│   │   │   ├── patientRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── prescriptionRoutes.js
│   │   │   └── statsRoutes.js
│   │   └── seed/
│   │       └── seedData.js         # Realistic demo seed script
│   └── tests/                      # Automated test suite
│       ├── setup.js                # Isolated test DB harness
│       ├── auth.test.js            # Authentication & RBAC tests
│       └── appointment.test.js     # Booking & double-booking tests
└── frontend/
    ├── package.json
    ├── vite.config.js              # Vite server & API proxy
    ├── tailwind.config.js          # MediCare healthcare color palette
    ├── postcss.config.js
    ├── index.html
    ├── vercel.json                 # SPA routing rewrites
    ├── .env.example
    ├── .env
    └── src/
        ├── main.jsx
        ├── App.jsx                 # Route declarations & layout
        ├── index.css               # Tailwind directives & print styles
        ├── context/
        │   └── AuthContext.jsx     # Auth state provider & JWT storage
        ├── services/
        │   └── api.js              # Axios instance with auth interceptor
        ├── components/
        │   ├── Navbar.jsx          # Top brand bar, portal links, mobile drawer
        │   ├── Footer.jsx          # Emergency numbers, departments, accreditation
        │   ├── Sidebar.jsx         # Dashboard navigation sidebar
        │   ├── ProtectedRoute.jsx  # Role-based route protection
        │   ├── Modal.jsx           # Accessible dialog component
        │   ├── PrescriptionModal.jsx # Rx prescription creator & print view
        │   └── RescheduleModal.jsx # Interactive reschedule workflow
        └── pages/
            ├── Home.jsx            # Hero, stats, departments, doctors, emergency CTA
            ├── About.jsx           # Mission, values, hospital infrastructure
            ├── Doctors.jsx         # Doctor search, filters, profile cards
            ├── Contact.jsx         # Emergency hotline, department extensions, form
            ├── Login.jsx           # Multi-role login with 1-click demo accounts
            ├── Register.jsx        # Patient self-registration
            ├── BookAppointment.jsx # Real-time slot selector & booking engine
            ├── AppointmentHistory.jsx # Status filterable consultation history
            ├── NotFound.jsx        # 404 handler
            └── dashboards/
                ├── AdminDashboard.jsx   # Stats, charts, Doctor CRUD, appt control
                ├── DoctorDashboard.jsx  # Today's queue, Rx issuance, availability
                └── PatientDashboard.jsx # Upcoming visits, Rx viewer, medical profile
```

---

## 🔑 Demo Login Accounts

| Role | Name | Email | Password | Access Highlights |
|---|---|---|---|---|
| **Admin** | Chief Administrator | `admin@medicare.com` | `admin123` | Doctor CRUD, hospital analytics, appt control |
| **Doctor** | Dr. Priya Sharma | `dr.sharma@medicare.com` | `doctor123` | Cardiology OPD, issue Rx, schedule manager |
| **Doctor** | Dr. Sarah Jenkins | `dr.sarah@medicare.com` | `doctor123` | Neurology OPD, issue Rx, schedule manager |
| **Doctor** | Dr. Rajesh Patel | `dr.patel@medicare.com` | `doctor123` | Orthopedics OPD, issue Rx, schedule manager |
| **Patient** | Rahul Verma | `rahul.verma@example.com` | `patient123` | Bookings, prescription archive, asthma EMR |
| **Patient** | Priya Nair | `priya.nair@example.com` | `patient123` | Bookings, scheduled consultations |
| **Patient** | Amit Kumar | `amit.kumar@example.com` | `patient123` | Prescriptions for Diabetes & Hypertension |

> **Tip:** The Login page includes **1-Click Demo Buttons** that automatically populate credentials for testing each portal.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new patient account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user name, phone, or EMR data |

### Doctors (`/api/doctors`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/doctors` | Public | List all active doctors (with filters) |
| `GET` | `/api/doctors/:id` | Public | Get single doctor details |
| `GET` | `/api/doctors/:id/available-slots` | Public | Check doctor slots for a date (YYYY-MM-DD) |
| `POST` | `/api/doctors` | Admin | Create a new doctor user & profile |
| `PUT` | `/api/doctors/:id` | Admin / Doctor | Update doctor qualifications, fees, schedule |
| `DELETE` | `/api/doctors/:id` | Admin | Deactivate/remove doctor |

### Patients (`/api/patients`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/patients` | Admin / Doctor | List registered hospital patients |
| `GET` | `/api/patients/:id` | Authenticated | View patient electronic medical record |
| `PUT` | `/api/patients/:id` | Admin / Patient | Update patient address, allergies, conditions |

### Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/appointments` | Patient / Admin | Book appointment with concurrency protection |
| `GET` | `/api/appointments` | Authenticated | List appointments (role-scoped) |
| `GET` | `/api/appointments/:id` | Authenticated | Get appointment details and linked prescription |
| `PUT` | `/api/appointments/:id/status` | Authenticated | Confirm, complete, or cancel appointment |
| `PUT` | `/api/appointments/:id/reschedule` | Authenticated | Change appointment date and slot |

### Prescriptions (`/api/prescriptions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/prescriptions` | Doctor / Admin | Issue digital prescription with medications |
| `GET` | `/api/prescriptions` | Authenticated | List prescriptions for doctor/patient |
| `GET` | `/api/prescriptions/:id` | Authenticated | View official prescription by ID or appt ID |

### Dashboard Analytics (`/api/stats`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/stats` | Authenticated | Returns role-specific KPI stats & reports |

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (running on port 27017) or a free MongoDB Atlas connection string.

### 1. Clone or Open the Project
```bash
cd /Users/sudikshamadaan/.gemini/antigravity/scratch/medicare-hospital-management
```

### 2. Configure Environment Files

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/medicare_db
JWT_SECRET=medicare_super_secret_jwt_key_2026_capstone
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 4. Seed Database with Realistic Demo Data
```bash
cd ../backend
npm run seed
```
*Populates 1 Admin, 6 Doctors across 6 specialties, 4 Patients, realistic appointments, and medical prescriptions.*

### 5. Start the Application
Open two terminal windows:

**Terminal 1 (Backend API Server):**
```bash
cd backend
npm run dev
# Server runs on: http://localhost:5000
# Health check:  http://localhost:5000/api/health
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Frontend runs on: http://localhost:5173
```

Now open **http://localhost:5173** in your web browser.

---

## 🧪 Automated Testing

The project includes an automated test suite verifying critical hospital workflows:
- User registration and JWT issuance
- Duplicate email rejection with 409
- Login authentication & incorrect password rejection
- JWT token guard protection
- Role-based authorization (Patients blocked from Admin routes with 403)
- Appointment booking
- **DOUBLE-BOOKING PREVENTION**: Concurrent booking attempts for the same doctor, date, and slot return **409 Conflict**.
- **SLOT RECOVERY**: Cancelled slots immediately become available for re-booking.

To run the automated tests:
```bash
cd backend
npm test
```

---

## 🌐 Production Deployment

Refer to [DEPLOYMENT.md](file:///Users/sudikshamadaan/.gemini/antigravity/scratch/medicare-hospital-management/DEPLOYMENT.md) for complete step-by-step instructions for:
1. **MongoDB Atlas**: Free M0 multi-region cloud database cluster.
2. **Render**: Free web service deployment for the Express.js API.
3. **Vercel**: Edge global CDN deployment for the React + Vite frontend.

---

## 📜 Capstone Academic Compliance

This application meets all technical and documentation criteria for a final-year **B.Tech CSE Capstone Project in Full Stack Development**:
- Complete, non-mocked CRUD operations across all entities.
- Enterprise-grade security (salted password hashing, signed JWTs, RBAC middleware).
- Production-ready database schema design with atomic concurrency locking.
- Clean, documented code structure following industry best practices.
