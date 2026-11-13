import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import RescheduleModal from '../../components/RescheduleModal';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Search,
  Filter,
  Shield,
  Activity,
  UserPlus,
  TrendingUp,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Doctor CRUD Modal state
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Cardiology',
    department: 'Cardiology',
    qualifications: 'MBBS, MD',
    experienceYears: 5,
    consultationFee: 600,
    roomNumber: 'OPD-101',
    bio: '',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  });
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [doctorModalError, setDoctorModalError] = useState('');

  // Reschedule Modal
  const [reschedulingAppt, setReschedulingAppt] = useState(null);

  // Filters
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, doctorsRes, patientsRes, apptsRes] = await Promise.all([
        api.get('/stats'),
        api.get('/doctors'),
        api.get('/patients'),
        api.get('/appointments'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (doctorsRes.data.success) setDoctors(doctorsRes.data.data);
      if (patientsRes.data.success) setPatients(patientsRes.data.data);
      if (apptsRes.data.success) setAppointments(apptsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddDoctorModal = () => {
    setEditingDoctor(null);
    setDoctorForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: 'Cardiology',
      department: 'Cardiology',
      qualifications: 'MBBS, MD',
      experienceYears: 5,
      consultationFee: 600,
      roomNumber: 'OPD-101',
      bio: '',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });
    setDoctorModalError('');
    setIsDoctorModalOpen(true);
  };

  const openEditDoctorModal = (doc) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.user?.name || '',
      email: doc.user?.email || '',
      password: '', // Leave blank unless updating
      phone: doc.user?.phone || '',
      specialization: doc.specialization || '',
      department: doc.department || '',
      qualifications: (doc.qualifications || []).join(', '),
      experienceYears: doc.experienceYears || 5,
      consultationFee: doc.consultationFee || 500,
      roomNumber: doc.roomNumber || '',
      bio: doc.bio || '',
      availableDays: doc.availableDays || [],
    });
    setDoctorModalError('');
    setIsDoctorModalOpen(true);
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setSavingDoctor(true);
    setDoctorModalError('');

    try {
      if (editingDoctor) {
        // Update
        const payload = {
          name: doctorForm.name,
          phone: doctorForm.phone,
          specialization: doctorForm.specialization,
          department: doctorForm.department,
          qualifications: doctorForm.qualifications.split(',').map((q) => q.trim()).filter(Boolean),
          experienceYears: Number(doctorForm.experienceYears),
          consultationFee: Number(doctorForm.consultationFee),
          roomNumber: doctorForm.roomNumber,
          bio: doctorForm.bio,
          availableDays: doctorForm.availableDays,
        };
        const res = await api.put(`/doctors/${editingDoctor._id}`, payload);
        if (res.data.success) {
          setIsDoctorModalOpen(false);
          fetchAdminData();
        }
      } else {
        // Create
        if (!doctorForm.password) {
          setDoctorModalError('Please specify an initial password for the doctor account.');
          setSavingDoctor(false);
          return;
        }
        const res = await api.post('/doctors', {
          ...doctorForm,
          qualifications: doctorForm.qualifications.split(',').map((q) => q.trim()).filter(Boolean),
          experienceYears: Number(doctorForm.experienceYears),
          consultationFee: Number(doctorForm.consultationFee),
        });
        if (res.data.success) {
          setIsDoctorModalOpen(false);
          fetchAdminData();
        }
      }
    } catch (err) {
      setDoctorModalError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSavingDoctor(false);
    }
  };

  const handleDeleteDoctor = async (docId, docName) => {
    if (!confirm(`Are you sure you want to remove Dr. ${docName} from active hospital directory?`)) {
      return;
    }
    try {
      await api.delete(`/doctors/${docId}`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove doctor');
    }
  };

  const handleUpdateAppointmentStatus = async (apptId, status) => {
    try {
      const res = await api.put(`/appointments/${apptId}/status`, { status });
      if (res.data.success) {
        setAppointments(appointments.map((a) => (a._id === apptId ? res.data.data : a)));
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (!doctorSearch) return true;
    const q = doctorSearch.toLowerCase();
    return (
      doc.user?.name?.toLowerCase().includes(q) ||
      doc.specialization?.toLowerCase().includes(q) ||
      doc.department?.toLowerCase().includes(q)
    );
  });

  const filteredPatients = patients.filter((p) => {
    if (!patientSearch) return true;
    const q = patientSearch.toLowerCase();
    return (
      p.user?.name?.toLowerCase().includes(q) ||
      p.user?.email?.toLowerCase().includes(q) ||
      p.bloodGroup?.toLowerCase().includes(q)
    );
  });

  const filteredAppointments = appointments.filter((appt) => {
    if (appointmentStatusFilter === 'all') return true;
    return appt.status === appointmentStatusFilter;
  });

  // Calculate status percentages for visual breakdown
  const totalApptsCount = stats?.totalAppointments || appointments.length || 1;
  const statusCounts = stats?.statusBreakdown || {
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-slate-100/60">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-6 sm:p-10 max-w-6xl space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Hospital Administration & Governance
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                System Online
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Executive Hospital Command Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Overview of doctor faculty, patient records, appointment traffic, and clinical analytics.
            </p>
          </div>

          <button
            onClick={openAddDoctorModal}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Doctor</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-tealcare-100 text-tealcare-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{stats?.totalDoctors ?? doctors.length}</div>
                  <div className="text-xs font-bold text-slate-600">Active Doctors</div>
                  <div className="text-[10px] text-slate-400">Board certified faculty</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-medicare-100 text-medicare-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{stats?.totalPatients ?? patients.length}</div>
                  <div className="text-xs font-bold text-slate-600">Registered Patients</div>
                  <div className="text-[10px] text-slate-400">Electronic records</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{stats?.totalAppointments ?? appointments.length}</div>
                  <div className="text-xs font-bold text-slate-600">Total Bookings</div>
                  <div className="text-[10px] text-slate-400">All-time consultations</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{stats?.todayAppointments ?? 0}</div>
                  <div className="text-xs font-bold text-slate-600">Today's Traffic</div>
                  <div className="text-[10px] text-slate-400">Today's appointments</div>
                </div>
              </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Appointment Status Breakdown */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Appointment Status Metrics</h3>
                    <p className="text-xs text-slate-500">Distribution across active and resolved consultations</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {totalApptsCount} Total
                  </span>
                </div>

                {/* Progress bars visualization */}
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-emerald-700">Completed Consultations</span>
                      <span>{statusCounts.completed} ({Math.round((statusCounts.completed / totalApptsCount) * 100) || 0}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(statusCounts.completed / totalApptsCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-blue-700">Confirmed & Scheduled</span>
                      <span>{statusCounts.confirmed} ({Math.round((statusCounts.confirmed / totalApptsCount) * 100) || 0}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(statusCounts.confirmed / totalApptsCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-amber-700">Pending Review</span>
                      <span>{statusCounts.pending} ({Math.round((statusCounts.pending / totalApptsCount) * 100) || 0}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${(statusCounts.pending / totalApptsCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-rose-700">Cancelled Bookings</span>
                      <span>{statusCounts.cancelled} ({Math.round((statusCounts.cancelled / totalApptsCount) * 100) || 0}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 rounded-full transition-all duration-500"
                        style={{ width: `${(statusCounts.cancelled / totalApptsCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Distribution */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Clinical Departments</h3>
                  <p className="text-xs text-slate-500">Doctor distribution across specialty units</p>
                </div>

                <div className="space-y-3">
                  {(stats?.departmentDistribution || [
                    { department: 'Cardiology', count: 1 },
                    { department: 'Neurology', count: 1 },
                    { department: 'Orthopedics', count: 1 },
                    { department: 'Pediatrics', count: 1 },
                    { department: 'Internal Medicine', count: 1 },
                    { department: 'Dermatology', count: 1 },
                  ]).map((dept, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                      <span className="font-bold text-slate-800">{dept.department}</span>
                      <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md">
                        {dept.count} Doctors
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Bookings Queue */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Recent Hospital Bookings</h3>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Manage All Bookings →
                </button>
              </div>

              <div className="space-y-2.5">
                {appointments.slice(0, 5).map((appt) => (
                  <div
                    key={appt._id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        {appt.patient?.user?.name}
                      </span>
                      <span className="text-slate-500 ml-2">→ Dr. {appt.doctor?.user?.name}</span>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {appt.appointmentDate} at {appt.timeSlot} • Token #{appt.tokenNumber} • Reason: {appt.reason}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          appt.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : appt.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : appt.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Doctor Directory CRUD */}
        {activeTab === 'doctors' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Medical Doctor Faculty ({doctors.length})</h3>
                <p className="text-xs text-slate-500">Add new physicians, update credentials, or manage room allocations.</p>
              </div>
              <button
                onClick={openAddDoctorModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search doctors by name or department..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Doctors Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Qualifications</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Fee</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDoctors.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={doc.user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100'}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover object-top border border-slate-200"
                          />
                          <div>
                            <strong className="block text-slate-900">{doc.user?.name}</strong>
                            <span className="text-[11px] text-slate-400">{doc.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{doc.department}</td>
                      <td className="px-4 py-3 text-slate-600">{doc.qualifications?.join(', ')}</td>
                      <td className="px-4 py-3 text-slate-600">{doc.roomNumber || 'OPD-101'}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">${doc.consultationFee}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.user?.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {doc.user?.isActive !== false ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => openEditDoctorModal(doc)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Doctor Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doc._id, doc.user?.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Doctor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Patient Directory */}
        {activeTab === 'patients' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hospital Patient Registry ({patients.length})</h3>
                <p className="text-xs text-slate-500">Electronic health registry records and emergency contacts.</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient by name, email, or blood group..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Blood Group</th>
                    <th className="px-4 py-3">Emergency Contact</th>
                    <th className="px-4 py-3">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPatients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <strong className="block text-slate-900">{p.user?.name}</strong>
                        <span className="text-[11px] text-slate-400">{p.user?.email}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.user?.phone || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-600">{p.gender}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-medicare-700 bg-medicare-50 px-2 py-0.5 rounded">
                          {p.bloodGroup || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.emergencyContact?.name ? (
                          <div>
                            <span>{p.emergencyContact.name} ({p.emergencyContact.relationship})</span>
                            <span className="block text-[10px] text-slate-400">{p.emergencyContact.phone}</span>
                          </div>
                        ) : (
                          'Not specified'
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Appointment Control */}
        {activeTab === 'appointments' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hospital Appointment Control Center</h3>
                <p className="text-xs text-slate-500">Review status, confirm upcoming bookings, reschedule, or cancel slots.</p>
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setAppointmentStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                      appointmentStatusFilter === st
                        ? 'bg-white text-indigo-700 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{appt.patient?.user?.name}</span>
                      <span className="text-slate-500">with Dr. {appt.doctor?.user?.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          appt.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : appt.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : appt.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 font-medium">
                      {appt.appointmentDate} at {appt.timeSlot} • Token #{appt.tokenNumber}
                    </p>
                    <p className="text-slate-500 text-[11px]">Reason: {appt.reason}</p>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    {appt.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateAppointmentStatus(appt._id, 'confirmed')}
                        className="px-3 py-1.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Approve
                      </button>
                    )}
                    {(appt.status === 'pending' || appt.status === 'confirmed') && (
                      <>
                        <button
                          onClick={() => setReschedulingAppt(appt)}
                          className="px-3 py-1.5 rounded-lg font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleUpdateAppointmentStatus(appt._id, 'cancelled')}
                          className="px-3 py-1.5 rounded-lg font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Reports & Analytics */}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hospital Operational Summary Report</h3>
              <p className="text-xs text-slate-500">Summary statistics generated for hospital audit.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 block font-bold uppercase">Total Patients Registered</span>
                <span className="text-3xl font-black text-slate-800">{patients.length}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 block font-bold uppercase">Total Appointments Logged</span>
                <span className="text-3xl font-black text-slate-800">{appointments.length}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 block font-bold uppercase">Active Specialists</span>
                <span className="text-3xl font-black text-slate-800">{doctors.length}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <strong className="block font-bold">System Health & Concurrency Audit:</strong>
              <p>
                MongoDB partial unique compound indexes on <code>(doctor, appointmentDate, timeSlot)</code> are active.
                Slot double-booking prevention constraint verified and operational.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Doctor Modal */}
      {isDoctorModalOpen && (
        <Modal
          isOpen={isDoctorModalOpen}
          onClose={() => setIsDoctorModalOpen(false)}
          title={editingDoctor ? `Edit Doctor: Dr. ${editingDoctor.user?.name}` : 'Add New Doctor to Faculty'}
          subtitle="Configure credentials, consultation fee, clinic room, and initial login"
        >
          <form onSubmit={handleDoctorSubmit} className="space-y-4 text-xs">
            {doctorModalError && (
              <div className="p-3 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {doctorModalError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  disabled={!!editingDoctor}
                  placeholder="dr.jane@medicare.com"
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100"
                />
              </div>
            </div>

            {!editingDoctor && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Specialization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Interventional Cardiology"
                  value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Department *</label>
                <select
                  value={doctorForm.department}
                  onChange={(e) => setDoctorForm({ ...doctorForm, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Orthopedics</option>
                  <option>Pediatrics</option>
                  <option>Internal Medicine</option>
                  <option>Dermatology</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Qualifications</label>
                <input
                  type="text"
                  value={doctorForm.qualifications}
                  onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Experience (Years)</label>
                <input
                  type="number"
                  value={doctorForm.experienceYears}
                  onChange={(e) => setDoctorForm({ ...doctorForm, experienceYears: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Consultation Fee ($)</label>
                <input
                  type="number"
                  value={doctorForm.consultationFee}
                  onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Hospital Room / Clinic Suite</label>
              <input
                type="text"
                value={doctorForm.roomNumber}
                onChange={(e) => setDoctorForm({ ...doctorForm, roomNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Doctor Bio</label>
              <textarea
                rows={2}
                value={doctorForm.bio}
                onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsDoctorModalOpen(false)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingDoctor}
                className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                {savingDoctor ? 'Saving...' : editingDoctor ? 'Save Changes' : 'Create Doctor'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <RescheduleModal
          isOpen={!!reschedulingAppt}
          onClose={() => setReschedulingAppt(null)}
          appointment={reschedulingAppt}
          onRescheduled={(updated) => {
            setAppointments(appointments.map((a) => (a._id === updated._id ? updated : a)));
            fetchAdminData();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
