import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Award,
  DollarSign,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Slots state
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotMessage, setSlotMessage] = useState('');

  // Booking outcome
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Minimum date: tomorrow (or today if working)
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId && doctors.length > 0) {
      const found = doctors.find((d) => d._id === selectedDoctorId);
      setSelectedDoctor(found || null);
    }
  }, [selectedDoctorId, doctors]);

  useEffect(() => {
    if (selectedDoctorId && appointmentDate) {
      fetchDoctorSlots(selectedDoctorId, appointmentDate);
    } else {
      setAvailableSlots([]);
      setBookedSlots([]);
      setTimeSlot('');
    }
  }, [selectedDoctorId, appointmentDate]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      if (res.data.success) {
        setDoctors(res.data.data);
        if (preselectedDoctorId) {
          const found = res.data.data.find((d) => d._id === preselectedDoctorId);
          setSelectedDoctor(found || null);
        }
      }
    } catch (err) {
      console.error('Failed to load doctors', err);
    }
  };

  const fetchDoctorSlots = async (docId, date) => {
    setLoadingSlots(true);
    setError('');
    setTimeSlot('');
    try {
      const res = await api.get(`/doctors/${docId}/available-slots?date=${date}`);
      if (res.data.success) {
        setAvailableSlots(res.data.availableSlots || []);
        setBookedSlots(res.data.bookedSlots || []);
        setSlotMessage(res.data.message || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor slot availability.');
      setAvailableSlots([]);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login?portal=patient&redirect=/book-appointment');
      return;
    }

    if (!selectedDoctorId || !appointmentDate || !timeSlot || !reason) {
      setError('Please select a doctor, appointment date, available time slot, and reason.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/appointments', {
        doctorId: selectedDoctorId,
        appointmentDate,
        timeSlot,
        reason,
        symptoms,
      });

      if (res.data.success) {
        setConfirmedBooking(res.data.data);
        // Fire confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Appointment booking failed. Please try a different slot.'
      );
      // Refresh slots in case of collision
      if (selectedDoctorId && appointmentDate) {
        fetchDoctorSlots(selectedDoctorId, appointmentDate);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-medicare-600">
          Online Appointment System
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Schedule Your Medical Consultation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Select a verified physician, choose an open time slot with real-time atomic availability,
          and receive instant booking confirmation.
        </p>
      </div>

      {confirmedBooking ? (
        /* Confirmation Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl max-w-2xl mx-auto text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Booking Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Appointment Successfully Scheduled!
            </h2>
            <p className="text-xs text-slate-500">
              Your consultation request is registered. A confirmation has been generated in your patient dashboard.
            </p>
          </div>

          {/* Token & Details Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold">Consultation Token</span>
                <span className="text-2xl font-black text-medicare-600">
                  Token #{confirmedBooking.tokenNumber || 1}
                </span>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                Status: {confirmedBooking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Doctor</span>
                <strong className="text-slate-800 text-sm">
                  Dr. {confirmedBooking.doctor?.user?.name || selectedDoctor?.user?.name}
                </strong>
                <span className="text-slate-500 block">
                  {confirmedBooking.doctor?.specialization || selectedDoctor?.specialization}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Date & Time</span>
                <strong className="text-slate-800 text-sm">
                  {confirmedBooking.appointmentDate}
                </strong>
                <span className="text-medicare-700 block font-bold">
                  {confirmedBooking.timeSlot}
                </span>
              </div>
            </div>

            <div className="text-xs pt-2 border-t border-slate-200">
              <span className="text-slate-400 block font-semibold">Reason for Visit</span>
              <p className="text-slate-700 font-medium">{confirmedBooking.reason}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/patient/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white bg-medicare-600 hover:bg-medicare-700 shadow-md transition-all"
            >
              Go to Patient Dashboard
            </Link>
            <button
              onClick={() => {
                setConfirmedBooking(null);
                setTimeSlot('');
                setReason('');
                setSymptoms('');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Book Another Visit
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            {error && (
              <div className="p-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isAuthenticated && (
              <div className="p-4 bg-medicare-50 border border-medicare-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-medicare-900 block">Fast Track Booking</span>
                  <span className="text-medicare-700">
                    Sign in to prefill your patient profile or register in seconds.
                  </span>
                </div>
                <Link
                  to="/login?portal=patient&redirect=/book-appointment"
                  className="px-3 py-1.5 bg-medicare-600 text-white font-bold rounded-lg shrink-0 hover:bg-medicare-700"
                >
                  Sign In
                </Link>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Step 1: Select Doctor */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Step 1: Choose Medical Specialist *
                </label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none bg-white font-medium"
                >
                  <option value="">-- Choose from our Medical Specialists --</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.user?.name} — {doc.specialization} ({doc.department}) • ${doc.consultationFee}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Step 2: Choose Appointment Date *
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Step 3: Real-Time Available Time Slots */}
              {selectedDoctorId && appointmentDate && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Step 3: Select Available Time Slot *
                    </label>
                    <div className="flex items-center space-x-3 text-[11px]">
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 rounded bg-medicare-600"></span>
                        <span className="text-slate-600 font-medium">Selected</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 rounded bg-white border border-slate-300"></span>
                        <span className="text-slate-600 font-medium">Available</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 rounded bg-slate-200"></span>
                        <span className="text-slate-400 font-medium">Booked</span>
                      </span>
                    </div>
                  </div>

                  {loadingSlots ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                      Checking Dr. {selectedDoctor?.user?.name}'s schedule for {appointmentDate}...
                    </div>
                  ) : slotMessage ? (
                    <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
                      {slotMessage}
                    </div>
                  ) : availableSlots.length > 0 || bookedSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* Available slots */}
                      {availableSlots.map((slot) => {
                        const isSelected = timeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTimeSlot(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                              isSelected
                                ? 'bg-medicare-600 text-white border-medicare-600 shadow-md shadow-medicare-600/30'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-medicare-500 hover:bg-medicare-50/50'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                            <span>{slot}</span>
                          </button>
                        );
                      })}

                      {/* Booked slots (disabled) */}
                      {bookedSlots.map((slot) => (
                        <div
                          key={slot}
                          title="Already booked by another patient"
                          className="py-2.5 px-3 rounded-xl text-xs font-medium border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed text-center line-through decoration-slate-400/60"
                        >
                          <Clock className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-slate-400" />
                          <span>{slot}</span>
                          <span className="text-[9px] block text-rose-500 no-underline font-bold">Booked</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 text-slate-500 text-xs rounded-xl text-center">
                      No consultation slots configured for this date.
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Reason & Symptoms */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Step 4: Chief Complaint / Reason for Consultation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chest tightness on exertion, routine cardiology checkup, persistent headache"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Known Symptoms or Medical History (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe any fever, pain duration, existing medications or allergies..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 inline text-emerald-500 mr-1" />
                  Instant confirmation & confidential record
                </span>
                <button
                  type="submit"
                  disabled={submitting || !selectedDoctorId || !appointmentDate || !timeSlot}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-medicare-600 to-tealcare-600 hover:from-medicare-700 hover:to-tealcare-700 shadow-lg shadow-medicare-600/30 transition-all disabled:opacity-40"
                >
                  {submitting ? 'Confirming Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>

          {/* Doctor Info Sidebar Card */}
          <div className="lg:col-span-4 space-y-6">
            {selectedDoctor ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={selectedDoctor.user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'}
                    alt={selectedDoctor.user?.name}
                    className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-slate-200 shadow"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-tealcare-700 bg-tealcare-50 px-2 py-0.5 rounded">
                      {selectedDoctor.department}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedDoctor.user?.name}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedDoctor.specialization}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Qualifications:</span>
                    <span className="font-bold text-slate-800">{selectedDoctor.qualifications?.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Experience:</span>
                    <span className="font-bold text-slate-800">{selectedDoctor.experienceYears} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Clinic Room:</span>
                    <span className="font-bold text-slate-800">{selectedDoctor.roomNumber || 'OPD-101'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-600 font-bold">Consultation Fee:</span>
                    <span className="text-base font-extrabold text-medicare-600">
                      ${selectedDoctor.consultationFee}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 leading-relaxed">
                  <strong className="block text-slate-700 mb-1">Doctor's Schedule Note:</strong>
                  Available on {selectedDoctor.availableDays?.join(', ')}. Appointments adhere to allocated timeslots.
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center space-y-3 text-slate-400">
                <Stethoscope className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="text-sm font-bold text-slate-600">Doctor Information</h4>
                <p className="text-xs text-slate-500">
                  Select a doctor from Step 1 above to review qualifications, clinic suite, and consultation fees.
                </p>
              </div>
            )}

            {/* Hospital Guarantee */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3">
              <div className="flex items-center space-x-2 text-tealcare-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>The MediCare Guarantee</span>
              </div>
              <h4 className="text-sm font-bold">No Overlapping or Double Booked Slots</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our database guarantees atomic scheduling locks. If your selected slot is secured,
                the consultation is reserved exclusively for you.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
