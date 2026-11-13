import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import PrescriptionModal from '../../components/PrescriptionModal';
import {
  Calendar,
  Clock,
  User,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Plus,
  Save,
  Settings,
  Phone,
  Mail,
  Activity,
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedApptForRx, setSelectedApptForRx] = useState(null);
  const [selectedRxToView, setSelectedRxToView] = useState(null);

  // Doctor Availability & Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    specialization: '',
    department: '',
    qualifications: '',
    experienceYears: 5,
    consultationFee: 500,
    roomNumber: '',
    bio: '',
    availableDays: [],
    isAvailable: true,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [statsRes, apptsRes, meRes] = await Promise.all([
        api.get('/stats'),
        api.get('/appointments'),
        api.get('/auth/me'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (apptsRes.data.success) setAppointments(apptsRes.data.data);

      if (meRes.data.success) {
        const u = meRes.data.user;
        const d = meRes.data.profile || {};
        setDoctorProfile(d);
        setProfileForm({
          name: u.name || '',
          phone: u.phone || '',
          specialization: d.specialization || '',
          department: d.department || '',
          qualifications: (d.qualifications || []).join(', '),
          experienceYears: d.experienceYears || 5,
          consultationFee: d.consultationFee || 500,
          roomNumber: d.roomNumber || '',
          bio: d.bio || '',
          availableDays: d.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          isAvailable: d.isAvailable !== false,
        });
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      const res = await api.put(`/appointments/${appointmentId}/status`, { status });
      if (res.data.success) {
        setAppointments(appointments.map((a) => (a._id === appointmentId ? res.data.data : a)));
        fetchDoctorData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!doctorProfile?._id) return;

    setSavingProfile(true);
    setProfileMessage('');
    try {
      const res = await api.put(`/doctors/${doctorProfile._id}`, {
        name: profileForm.name,
        phone: profileForm.phone,
        specialization: profileForm.specialization,
        department: profileForm.department,
        qualifications: profileForm.qualifications.split(',').map((q) => q.trim()).filter(Boolean),
        experienceYears: Number(profileForm.experienceYears),
        consultationFee: Number(profileForm.consultationFee),
        roomNumber: profileForm.roomNumber,
        bio: profileForm.bio,
        availableDays: profileForm.availableDays,
        isAvailable: profileForm.isAvailable,
      });

      if (res.data.success) {
        setDoctorProfile(res.data.data);
        setProfileMessage('Doctor profile and clinic schedule successfully updated!');
        setTimeout(() => setProfileMessage(''), 3000);
      }
    } catch (err) {
      setProfileMessage(err.response?.data?.message || 'Failed to update details');
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleDay = (day) => {
    if (profileForm.availableDays.includes(day)) {
      setProfileForm({
        ...profileForm,
        availableDays: profileForm.availableDays.filter((d) => d !== day),
      });
    } else {
      setProfileForm({
        ...profileForm,
        availableDays: [...profileForm.availableDays, day],
      });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-slate-100/60">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-6 sm:p-10 max-w-6xl space-y-8 overflow-y-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-tealcare-700 bg-tealcare-50 px-2.5 py-0.5 rounded-full border border-tealcare-200">
                Doctor Workstation • {doctorProfile?.department}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {doctorProfile?.isAvailable ? 'Available for OPD' : 'Away / On Leave'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Welcome, Dr. {user?.name?.replace(/^Dr\.?\s*/i, '')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your daily consultation schedule, review patient history, and issue verified digital prescriptions.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-medium">OPD Status:</span>
            <button
              onClick={() => {
                setProfileForm({ ...profileForm, isAvailable: !profileForm.isAvailable });
                if (doctorProfile?._id) {
                  api.put(`/doctors/${doctorProfile._id}`, { isAvailable: !profileForm.isAvailable });
                }
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                profileForm.isAvailable
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {profileForm.isAvailable ? 'Active' : 'Offline'}
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-tealcare-100 text-tealcare-700 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats?.todayAppointmentsCount ?? todayAppointments.length}
                  </div>
                  <div className="text-xs font-bold text-slate-600">Today's Visits</div>
                  <div className="text-[10px] text-slate-400">Scheduled consultations</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-medicare-100 text-medicare-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats?.upcomingAppointmentsCount ?? appointments.filter((a) => a.status === 'confirmed').length}
                  </div>
                  <div className="text-xs font-bold text-slate-600">Upcoming Queue</div>
                  <div className="text-[10px] text-slate-400">Confirmed patients</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats?.completedConsultations ?? appointments.filter((a) => a.status === 'completed').length}
                  </div>
                  <div className="text-xs font-bold text-slate-600">Completed Visits</div>
                  <div className="text-[10px] text-slate-400">All-time consultations</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats?.totalPrescriptions ?? 0}
                  </div>
                  <div className="text-xs font-bold text-slate-600">Prescriptions Issued</div>
                  <div className="text-[10px] text-slate-400">Digital Rx registered</div>
                </div>
              </div>
            </div>

            {/* Today's Schedule Queue */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Today's Consultation Schedule</h3>
                  <p className="text-xs text-slate-500">Date: {todayStr} • Clinic Suite: {doctorProfile?.roomNumber || 'OPD-101'}</p>
                </div>
                <span className="text-xs font-bold text-tealcare-700 bg-tealcare-50 px-2.5 py-1 rounded-full">
                  {todayAppointments.length} Patients Scheduled
                </span>
              </div>

              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appt) => (
                    <div
                      key={appt._id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center space-x-3.5">
                        <span className="px-2.5 py-1.5 rounded-lg bg-medicare-600 text-white font-mono font-bold text-xs">
                          #{appt.tokenNumber || 1}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              {appt.patient?.user?.name}
                            </span>
                            <span className="text-slate-500 font-medium">({appt.timeSlot})</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                appt.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : appt.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {appt.status}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">
                            <strong>Chief Complaint:</strong> {appt.reason}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Phone: {appt.patient?.user?.phone || 'Not recorded'} • Blood Group: {appt.patient?.bloodGroup || 'Unknown'}
                          </p>
                        </div>
                      </div>

                      {/* Consultation Actions */}
                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        {appt.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(appt._id, 'confirmed')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                          >
                            Confirm Visit
                          </button>
                        )}
                        {appt.status !== 'completed' && (
                          <button
                            onClick={() => setSelectedApptForRx(appt)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-tealcare-600 hover:bg-tealcare-700 shadow-sm flex items-center space-x-1"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Prescribe & Complete</span>
                          </button>
                        )}
                        {appt.status === 'completed' && (
                          <button
                            onClick={() => setSelectedRxToView(appt)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
                          >
                            View Prescription
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  No appointments booked for today. Any newly confirmed walk-ins or bookings will show here.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Today's Schedule View */}
        {activeTab === 'today' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Today's Detailed Consultation Queue</h3>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((appt) => (
                  <div key={appt._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm">Token #{appt.tokenNumber} • {appt.timeSlot}</span>
                      <span className="font-bold uppercase text-slate-600">{appt.status}</span>
                    </div>
                    <p className="text-slate-700">Patient: <strong>{appt.patient?.user?.name}</strong></p>
                    <p className="text-slate-600">Complaint: {appt.reason}</p>
                    {appt.symptoms && <p className="text-slate-500">Symptoms: {appt.symptoms}</p>}
                    <div className="pt-2 flex justify-end gap-2">
                      {appt.status !== 'completed' && (
                        <button
                          onClick={() => setSelectedApptForRx(appt)}
                          className="px-3 py-1.5 rounded-lg font-bold text-white bg-tealcare-600 hover:bg-tealcare-700"
                        >
                          Write Prescription
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No patients scheduled for today.</p>
            )}
          </div>
        )}

        {/* Tab 3: All Consultations */}
        {activeTab === 'appointments' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">All Consultations ({appointments.length})</h3>
            </div>
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800 text-sm">{appt.patient?.user?.name}</span>
                    <p className="text-slate-500">{appt.appointmentDate} • {appt.timeSlot} (Token #{appt.tokenNumber})</p>
                    <p className="text-slate-600 mt-0.5">Complaint: {appt.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">{appt.status}</span>
                    {appt.status !== 'completed' && (
                      <button
                        onClick={() => setSelectedApptForRx(appt)}
                        className="px-3 py-1 rounded bg-tealcare-600 text-white font-bold"
                      >
                        Prescribe
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Availability & Schedule Settings */}
        {activeTab === 'availability' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Consultation Days & Availability</h3>
              <p className="text-xs text-slate-500">Configure which days of the week you are available for patient appointments.</p>
            </div>

            {profileMessage && (
              <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Active Consultation Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = profileForm.availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-tealcare-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Clinic Consultation Room / Suite
                  </label>
                  <input
                    type="text"
                    value={profileForm.roomNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-tealcare-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Consultation Fee ($)
                  </label>
                  <input
                    type="number"
                    value={profileForm.consultationFee}
                    onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-tealcare-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-tealcare-600 hover:bg-tealcare-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  {savingProfile ? 'Saving...' : 'Save Availability Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Doctor Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Doctor Profile & Qualifications</h3>
              <p className="text-xs text-slate-500">Public profile visible to patients on the hospital directory.</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-tealcare-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={profileForm.specialization}
                    onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-tealcare-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Department</label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-tealcare-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Qualifications (comma-separated)</label>
                  <input
                    type="text"
                    value={profileForm.qualifications}
                    onChange={(e) => setProfileForm({ ...profileForm, qualifications: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-tealcare-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Clinical Bio & Overview</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-tealcare-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-tealcare-600 hover:bg-tealcare-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  {savingProfile ? 'Saving...' : 'Update Doctor Profile'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Write Prescription Modal */}
      {selectedApptForRx && (
        <PrescriptionModal
          isOpen={!!selectedApptForRx}
          onClose={() => setSelectedApptForRx(null)}
          appointment={selectedApptForRx}
          mode="create"
          onPrescriptionCreated={() => {
            fetchDoctorData();
          }}
        />
      )}

      {/* View Prescription Modal */}
      {selectedRxToView && (
        <PrescriptionModal
          isOpen={!!selectedRxToView}
          onClose={() => setSelectedRxToView(null)}
          appointment={selectedRxToView}
          mode="view"
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
