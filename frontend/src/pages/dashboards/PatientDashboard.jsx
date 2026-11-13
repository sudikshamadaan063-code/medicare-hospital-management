import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import PrescriptionModal from '../../components/PrescriptionModal';
import RescheduleModal from '../../components/RescheduleModal';
import {
  Calendar,
  Clock,
  FileText,
  User,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Heart,
  Activity,
  ArrowRight,
  Shield,
  Phone,
  Save,
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile edit form
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    bloodGroup: 'Unknown',
    gender: 'Male',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    allergies: '',
    chronicConditions: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Modals
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [reschedulingAppt, setReschedulingAppt] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, apptsRes, rxRes, meRes] = await Promise.all([
        api.get('/stats'),
        api.get('/appointments'),
        api.get('/prescriptions'),
        api.get('/auth/me'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (apptsRes.data.success) setAppointments(apptsRes.data.data);
      if (rxRes.data.success) setPrescriptions(rxRes.data.data);

      if (meRes.data.success) {
        const u = meRes.data.user;
        const p = meRes.data.profile || {};
        setProfileData(p);
        setProfileForm({
          name: u.name || '',
          phone: u.phone || '',
          bloodGroup: p.bloodGroup || 'Unknown',
          gender: p.gender || 'Male',
          street: p.address?.street || '',
          city: p.address?.city || '',
          state: p.address?.state || '',
          zipCode: p.address?.zipCode || '',
          emergencyName: p.emergencyContact?.name || '',
          emergencyRelationship: p.emergencyContact?.relationship || '',
          emergencyPhone: p.emergencyContact?.phone || '',
          allergies: (p.allergies || []).join(', '),
          chronicConditions: (p.chronicConditions || []).join(', '),
        });
      }
    } catch (err) {
      console.error('Failed to load patient dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
        patientDetails: {
          bloodGroup: profileForm.bloodGroup,
          gender: profileForm.gender,
          address: {
            street: profileForm.street,
            city: profileForm.city,
            state: profileForm.state,
            zipCode: profileForm.zipCode,
          },
          emergencyContact: {
            name: profileForm.emergencyName,
            relationship: profileForm.emergencyRelationship,
            phone: profileForm.emergencyPhone,
          },
          allergies: profileForm.allergies
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          chronicConditions: profileForm.chronicConditions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMessage('Medical profile saved successfully!');
        setTimeout(() => setProfileMessage(''), 3000);
      }
    } catch (err) {
      setProfileMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment? The slot will be released.')) return;
    try {
      const res = await api.put(`/appointments/${id}/status`, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by patient from dashboard',
      });
      if (res.data.success) {
        setAppointments(appointments.map((a) => (a._id === id ? res.data.data : a)));
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const upcomingAppts = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed'
  );

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-slate-100/60">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-6 sm:p-10 max-w-6xl space-y-8 overflow-y-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-medicare-600">
                Patient Health Portal
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active Member
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage appointments, review prescriptions, and update your personal electronic health record.
            </p>
          </div>

          <Link
            to="/book-appointment"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 shadow-md shadow-medicare-600/30 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-medicare-100 text-medicare-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats?.upcomingAppointments ?? upcomingAppts.length}
                  </div>
                  <div className="text-xs font-bold text-slate-600">Upcoming Visits</div>
                  <div className="text-[10px] text-slate-400">Scheduled consultations</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-tealcare-100 text-tealcare-700 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats?.completedAppointments ?? appointments.filter((a) => a.status === 'completed').length}
                  </div>
                  <div className="text-xs font-bold text-slate-600">Past Consultations</div>
                  <div className="text-[10px] text-slate-400">Completed visits</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats?.prescriptionsCount ?? prescriptions.length}
                  </div>
                  <div className="text-xs font-bold text-slate-600">Digital Prescriptions</div>
                  <div className="text-[10px] text-slate-400">Active Rx on file</div>
                </div>
              </div>
            </div>

            {/* Next Upcoming Appointment Highlight */}
            {upcomingAppts.length > 0 ? (
              <div className="bg-gradient-to-r from-medicare-900 to-tealcare-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-tealcare-300 bg-white/10 px-3 py-1 rounded-full">
                      Next Scheduled Consultation
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      Token #{upcomingAppts[0].tokenNumber || 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-7 flex items-center space-x-4">
                      <img
                        src={upcomingAppts[0].doctor?.user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'}
                        alt={upcomingAppts[0].doctor?.user?.name}
                        className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-white/20 shrink-0"
                      />
                      <div>
                        <h3 className="text-lg font-black text-white">
                          Dr. {upcomingAppts[0].doctor?.user?.name}
                        </h3>
                        <p className="text-xs text-tealcare-200">
                          {upcomingAppts[0].doctor?.specialization} ({upcomingAppts[0].doctor?.department})
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          Room: {upcomingAppts[0].doctor?.roomNumber || 'OPD-101'}
                        </p>
                      </div>
                    </div>

                    <div className="sm:col-span-5 bg-white/10 backdrop-blur-sm p-4 rounded-2xl space-y-2">
                      <div className="flex items-center space-x-2 text-sm font-bold text-white">
                        <Calendar className="w-4 h-4 text-tealcare-300" />
                        <span>{upcomingAppts[0].appointmentDate}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm font-bold text-tealcare-200">
                        <Clock className="w-4 h-4" />
                        <span>{upcomingAppts[0].timeSlot}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 truncate">
                        Reason: {upcomingAppts[0].reason}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setReschedulingAppt(upcomingAppts[0])}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(upcomingAppts[0]._id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Upcoming Appointments</h4>
                <p className="text-xs text-slate-500">
                  You are not currently scheduled for any consultations. Book an appointment whenever you need care.
                </p>
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Book Consultation</span>
                </Link>
              </div>
            )}

            {/* Recent Prescriptions Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Medical Prescriptions</h3>
                <button
                  onClick={() => setActiveTab('prescriptions')}
                  className="text-xs font-bold text-medicare-600 hover:text-medicare-700"
                >
                  View All ({prescriptions.length})
                </button>
              </div>

              {prescriptions.length > 0 ? (
                <div className="space-y-3">
                  {prescriptions.slice(0, 3).map((rx) => (
                    <div
                      key={rx._id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">
                            Dr. {rx.doctor?.user?.name}
                          </span>
                          <span className="text-[10px] text-tealcare-700 bg-tealcare-50 px-2 py-0.5 rounded font-bold">
                            {rx.doctor?.specialization}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Diagnosis: <strong>{rx.diagnosis}</strong> ({rx.medicines?.length} medicines)
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Issued on {new Date(rx.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedPrescription(rx)}
                        className="px-3.5 py-2 text-xs font-bold text-medicare-700 bg-white hover:bg-medicare-50 border border-medicare-200 rounded-xl shrink-0 transition-colors"
                      >
                        View & Print Rx
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No prescriptions issued yet. Consult with a doctor to receive prescriptions.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: My Appointments */}
        {activeTab === 'appointments' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">All Appointment Bookings</h3>
              <span className="text-xs text-slate-500">{appointments.length} Total</span>
            </div>

            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <div
                    key={appt._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          Dr. {appt.doctor?.user?.name}
                        </span>
                        <span className="text-slate-500">({appt.doctor?.specialization})</span>
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
                        {appt.appointmentDate} at {appt.timeSlot} • Token #{appt.tokenNumber || 1}
                      </p>
                      <p className="text-slate-500 mt-0.5">Reason: {appt.reason}</p>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      {(appt.status === 'pending' || appt.status === 'confirmed') && (
                        <>
                          <button
                            onClick={() => setReschedulingAppt(appt)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appt._id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 font-bold text-rose-700 hover:bg-rose-100"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No appointments found.</p>
            )}
          </div>
        )}

        {/* Tab 3: Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Your Electronic Prescriptions (Rx)</h3>
              <span className="text-xs text-slate-500">{prescriptions.length} Records</span>
            </div>

            {prescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((rx) => (
                  <div
                    key={rx._id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-medicare-700">
                          Dr. {rx.doctor?.user?.name}
                        </span>
                        <span className="text-slate-400">
                          {new Date(rx.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Diagnosis: {rx.diagnosis}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {rx.medicines?.length} Prescribed Medications:
                      </p>
                      <ul className="text-xs space-y-1 list-disc list-inside text-slate-700">
                        {rx.medicines?.slice(0, 3).map((m, i) => (
                          <li key={i}>
                            <strong>{m.name}</strong> ({m.dosage}) - {m.frequency}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => setSelectedPrescription(rx)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 shadow-sm transition-colors"
                      >
                        Open Official Rx Document
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center">
                No electronic prescriptions recorded yet.
              </p>
            )}
          </div>
        )}

        {/* Tab 4: Medical Profile Form */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Electronic Health Profile</h3>
              <p className="text-xs text-slate-500">
                Update your emergency contact, blood group, allergies, and chronic conditions for doctor reference.
              </p>
            </div>

            {profileMessage && (
              <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                  >
                    <option>Unknown</option>
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Gender
                  </label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Emergency Contact Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={profileForm.emergencyName}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyName: e.target.value })}
                    className="px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-medicare-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse/Parent)"
                    value={profileForm.emergencyRelationship}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyRelationship: e.target.value })}
                    className="px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-medicare-500 outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Emergency Phone"
                    value={profileForm.emergencyPhone}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                    className="px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-medicare-500 outline-none"
                  />
                </div>
              </div>

              {/* Allergies & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Known Drug/Food Allergies (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts, Sulfa"
                    value={profileForm.allergies}
                    onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Chronic Medical Conditions (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension, Diabetes, Asthma"
                    value={profileForm.chronicConditions}
                    onChange={(e) => setProfileForm({ ...profileForm, chronicConditions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 shadow-md transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Health Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Prescription View Modal */}
      {selectedPrescription && (
        <PrescriptionModal
          isOpen={!!selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          existingPrescription={selectedPrescription}
          mode="view"
        />
      )}

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <RescheduleModal
          isOpen={!!reschedulingAppt}
          onClose={() => setReschedulingAppt(null)}
          appointment={reschedulingAppt}
          onRescheduled={(updated) => {
            setAppointments(appointments.map((a) => (a._id === updated._id ? updated : a)));
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
