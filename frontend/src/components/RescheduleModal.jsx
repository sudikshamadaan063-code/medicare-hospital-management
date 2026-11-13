import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../services/api';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const RescheduleModal = ({ isOpen, onClose, appointment, onRescheduled }) => {
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (appointment && newDate) {
      fetchSlots(newDate);
    }
  }, [newDate, appointment]);

  const fetchSlots = async (selectedDate) => {
    setLoadingSlots(true);
    setError('');
    setNewSlot('');
    try {
      const docId = appointment.doctor?._id || appointment.doctor;
      const res = await api.get(`/doctors/${docId}/available-slots?date=${selectedDate}`);
      if (res.data.success) {
        setAvailableSlots(res.data.availableSlots || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor slots for this date');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newSlot) {
      setError('Please choose both a new date and a time slot.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.put(`/appointments/${appointment._id}/reschedule`, {
        appointmentDate: newDate,
        timeSlot: newSlot,
        reason: reason || appointment.reason,
      });

      if (res.data.success) {
        if (onRescheduled) onRescheduled(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      subtitle={`Dr. ${appointment.doctor?.user?.name || ''} • Current: ${appointment.appointmentDate} at ${appointment.timeSlot}`}
    >
      <form onSubmit={handleRescheduleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Select New Date *
          </label>
          <input
            type="date"
            required
            min={minDateStr}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
          />
        </div>

        {/* Slots Selector */}
        {newDate && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Time Slot *
            </label>
            {loadingSlots ? (
              <div className="py-4 text-center text-xs text-slate-500">Checking slot availability...</div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setNewSlot(slot)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      newSlot === slot
                        ? 'bg-medicare-600 text-white border-medicare-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-medicare-400'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                No slots currently available for this doctor on {newDate}. Please choose another date.
              </p>
            )}
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Reason for Rescheduling
          </label>
          <input
            type="text"
            placeholder="e.g. Schedule conflict, feeling better, personal travel"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !newSlot}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-medicare-600 hover:bg-medicare-700 disabled:opacity-50 shadow-md shadow-medicare-600/25 transition-all"
          >
            {submitting ? 'Rescheduling...' : 'Confirm New Schedule'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RescheduleModal;
