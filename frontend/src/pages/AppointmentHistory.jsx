import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PrescriptionModal from '../components/PrescriptionModal';
import RescheduleModal from '../components/RescheduleModal';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  RotateCcw,
  XCircle,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';

const AppointmentHistory = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedPrescriptionAppt, setSelectedPrescriptionAppt] = useState(null);
  const [selectedRescheduleAppt, setSelectedRescheduleAppt] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = '/appointments';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    const reason = prompt('Please specify a cancellation reason:');
    if (!reason) return;

    setCancellingId(id);
    try {
      const res = await api.put(`/appointments/${id}/status`, {
        status: 'cancelled',
        cancellationReason: reason,
      });
      if (res.data.success) {
        setAppointments(
          appointments.map((a) => (a._id === id ? res.data.data : a))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const docName = appt.doctor?.user?.name?.toLowerCase() || '';
    const patientName = appt.patient?.user?.name?.toLowerCase() || '';
    const reason = appt.reason?.toLowerCase() || '';
    const date = appt.appointmentDate?.toLowerCase() || '';
    return docName.includes(q) || patientName.includes(q) || reason.includes(q) || date.includes(q);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Confirmed</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-medicare-600">
            Records & Consultations
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Appointment Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track consultation appointments, view prescriptions, or manage reschedule/cancellation requests.
          </p>
        </div>
        <Link
          to="/book-appointment"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 shadow-md transition-all self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>Book New Visit</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-medicare-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by doctor, date, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-medicare-500 outline-none"
          />
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 h-36 animate-pulse"></div>
          ))}
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const isPatient = user?.role === 'patient';
            const canCancel = (appt.status === 'pending' || appt.status === 'confirmed');
            const canReschedule = (appt.status === 'pending' || appt.status === 'confirmed');

            return (
              <div
                key={appt._id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded-lg bg-medicare-50 text-medicare-700 text-xs font-bold font-mono">
                      Token #{appt.tokenNumber || 1}
                    </span>
                    <div className="text-xs text-slate-500">
                      Booked on: {new Date(appt.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>{getStatusBadge(appt.status)}</div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Doctor Info */}
                  <div className="md:col-span-4 flex items-center space-x-3.5">
                    <img
                      src={appt.doctor?.user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'}
                      alt={appt.doctor?.user?.name}
                      className="w-12 h-12 rounded-xl object-cover object-top border border-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Dr. {appt.doctor?.user?.name}
                      </h3>
                      <p className="text-xs text-medicare-600 font-medium">
                        {appt.doctor?.specialization} ({appt.doctor?.department})
                      </p>
                      {!isPatient && (
                        <p className="text-xs text-slate-500">
                          Patient: <strong className="text-slate-700">{appt.patient?.user?.name}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="md:col-span-3 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
                      <Calendar className="w-4 h-4 text-medicare-600 shrink-0" />
                      <span>{appt.appointmentDate}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-tealcare-700 font-bold">
                      <Clock className="w-4 h-4 text-tealcare-600 shrink-0" />
                      <span>{appt.timeSlot}</span>
                    </div>
                  </div>

                  {/* Reason & Notes */}
                  <div className="md:col-span-5 text-xs text-slate-600">
                    <span className="font-bold text-slate-700 block">Chief Complaint:</span>
                    <p className="line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {appt.reason}
                    </p>
                    {appt.status === 'cancelled' && appt.cancellationReason && (
                      <p className="text-rose-600 mt-1 text-[11px]">
                        Cancellation Note: {appt.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 text-xs">
                  {/* View Prescription button if completed */}
                  {appt.status === 'completed' && (
                    <button
                      onClick={() => setSelectedPrescriptionAppt(appt)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold text-medicare-700 bg-medicare-50 hover:bg-medicare-100 border border-medicare-200 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Prescription (Rx)</span>
                    </button>
                  )}

                  {/* Reschedule */}
                  {canReschedule && (
                    <button
                      onClick={() => setSelectedRescheduleAppt(appt)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reschedule</span>
                    </button>
                  )}

                  {/* Cancel */}
                  {canCancel && (
                    <button
                      disabled={cancellingId === appt._id}
                      onClick={() => handleCancelAppointment(appt._id)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{cancellingId === appt._id ? 'Cancelling...' : 'Cancel Booking'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No appointment records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter !== 'all'
              ? `There are currently no appointments with status '${statusFilter}'.`
              : 'You have not booked any appointments yet.'}
          </p>
          <Link
            to="/book-appointment"
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl"
          >
            <span>Book Your First Visit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Prescription View Modal */}
      {selectedPrescriptionAppt && (
        <PrescriptionModal
          isOpen={!!selectedPrescriptionAppt}
          onClose={() => setSelectedPrescriptionAppt(null)}
          appointment={selectedPrescriptionAppt}
          mode="view"
        />
      )}

      {/* Reschedule Modal */}
      {selectedRescheduleAppt && (
        <RescheduleModal
          isOpen={!!selectedRescheduleAppt}
          onClose={() => setSelectedRescheduleAppt(null)}
          appointment={selectedRescheduleAppt}
          onRescheduled={(updated) => {
            setAppointments(
              appointments.map((a) => (a._id === updated._id ? updated : a))
            );
          }}
        />
      )}
    </div>
  );
};

export default AppointmentHistory;
