import React, { useState } from 'react';
import Modal from './Modal';
import api from '../services/api';
import { Plus, Trash2, Printer, Activity, CheckCircle, Stethoscope } from 'lucide-react';

const PrescriptionModal = ({
  isOpen,
  onClose,
  appointment,
  existingPrescription,
  onPrescriptionCreated,
  mode = 'view', // 'view' or 'create'
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [generalAdvice, setGeneralAdvice] = useState('Maintain proper hydration and rest.');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medicines, setMedicines] = useState([
    {
      name: '',
      dosage: '',
      frequency: 'Twice a day (1-0-1)',
      duration: '5 days',
      instructions: 'After meals',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '',
        frequency: 'Twice a day (1-0-1)',
        duration: '5 days',
        instructions: 'After meals',
      },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!diagnosis.trim()) {
      setError('Please provide a medical diagnosis.');
      return;
    }

    const invalidMed = medicines.some((m) => !m.name.trim() || !m.dosage.trim());
    if (invalidMed) {
      setError('Please specify both medicine name and dosage for all entered medications.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/prescriptions', {
        appointmentId: appointment._id,
        diagnosis,
        medicines,
        generalAdvice,
        followUpDate,
      });

      if (res.data.success) {
        if (onPrescriptionCreated) {
          onPrescriptionCreated(res.data.data);
        }
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit prescription');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const prescriptionData = existingPrescription || appointment?.prescription;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Write Medical Prescription (Rx)' : 'Official Medical Prescription'}
      subtitle={
        appointment
          ? `Appointment with Dr. ${appointment.doctor?.user?.name || ''} • ${appointment.appointmentDate}`
          : ''
      }
      maxWidth="max-w-3xl"
    >
      {mode === 'create' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Patient summary badge */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <div>
              <span className="font-bold text-slate-700">Patient: </span>
              {appointment?.patient?.user?.name}
            </div>
            <div>
              <span className="font-bold text-slate-700">Chief Complaint: </span>
              {appointment?.reason}
            </div>
            <div>
              <span className="font-bold text-slate-700">Date: </span>
              {appointment?.appointmentDate} ({appointment?.timeSlot})
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Clinical Diagnosis *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Acute Bronchitis / Hypertension Stage 1"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medicare-500 text-sm"
            />
          </div>

          {/* Medicines Dynamic Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Prescribed Medicines (Rx) *
              </label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-medicare-600 hover:text-medicare-700 bg-medicare-50 hover:bg-medicare-100 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end text-xs"
                >
                  <div className="sm:col-span-4">
                    <span className="text-[11px] font-medium text-slate-500">Medicine Name</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amoxicillin 500mg"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-medicare-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[11px] font-medium text-slate-500">Dosage</span>
                    <input
                      type="text"
                      required
                      placeholder="500 mg"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-medicare-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-[11px] font-medium text-slate-500">Frequency</span>
                    <select
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-medicare-500 outline-none"
                    >
                      <option>Once daily (1-0-0)</option>
                      <option>Twice daily (1-0-1)</option>
                      <option>Thrice daily (1-1-1)</option>
                      <option>Once at night (0-0-1)</option>
                      <option>As needed (SOS)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[11px] font-medium text-slate-500">Duration</span>
                    <input
                      type="text"
                      placeholder="5 days"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-medicare-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-center pb-1">
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="sm:col-span-12">
                    <input
                      type="text"
                      placeholder="Special instructions (e.g., Take after food with warm water)"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-600 focus:ring-1 focus:ring-medicare-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice & Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                General Clinical Advice
              </label>
              <textarea
                rows={2}
                value={generalAdvice}
                onChange={(e) => setGeneralAdvice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                placeholder="Dietary restrictions, rest, lifestyle suggestions..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Suggested Follow-up Date (Optional)
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
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
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-medicare-600 hover:bg-medicare-700 disabled:opacity-50 shadow-md shadow-medicare-600/25 transition-all"
            >
              {loading ? 'Submitting...' : 'Issue Prescription & Complete Visit'}
            </button>
          </div>
        </form>
      ) : prescriptionData ? (
        /* Printable Prescription View */
        <div className="space-y-6" id="printable-prescription">
          {/* Hospital Header */}
          <div className="p-4 bg-slate-50 border-b-2 border-medicare-600 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-medicare-600 text-white flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">MediCare Multi-Specialty Hospital</h2>
                <p className="text-xs text-slate-500">742 Health Blvd, Metropolis • Emergency: +1 (800) 555-CARE</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span className="inline-block bg-tealcare-100 text-tealcare-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Verified Rx
              </span>
              <p className="mt-1 font-mono text-slate-600">ID: {prescriptionData._id?.slice(-8)?.toUpperCase()}</p>
            </div>
          </div>

          {/* Doctor & Patient Info Bar */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-800 text-sm">
                Dr. {prescriptionData.doctor?.user?.name || appointment?.doctor?.user?.name}
              </p>
              <p className="text-slate-600">{prescriptionData.doctor?.specialization || appointment?.doctor?.specialization}</p>
              <p className="text-slate-500">Dept: {prescriptionData.doctor?.department || appointment?.doctor?.department}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800 text-sm">
                Patient: {prescriptionData.patient?.user?.name || appointment?.patient?.user?.name}
              </p>
              <p className="text-slate-500">Gender: {prescriptionData.patient?.gender || 'Not specified'}</p>
              <p className="text-slate-500">
                Issued Date: {new Date(prescriptionData.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="p-3 bg-medicare-50/50 border border-medicare-200 rounded-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-medicare-800">
              Clinical Diagnosis
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{prescriptionData.diagnosis}</p>
          </div>

          {/* Rx Medicines Table */}
          <div>
            <div className="flex items-center space-x-2 text-medicare-700 font-bold text-sm mb-2">
              <span className="text-lg font-serif italic">℞</span>
              <span>Prescription Drugs & Regimen</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="px-3.5 py-2">#</th>
                    <th className="px-3.5 py-2">Medicine Name</th>
                    <th className="px-3.5 py-2">Dosage</th>
                    <th className="px-3.5 py-2">Frequency</th>
                    <th className="px-3.5 py-2">Duration</th>
                    <th className="px-3.5 py-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {prescriptionData.medicines?.map((med, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="px-3.5 py-2.5 font-bold text-slate-400">{i + 1}</td>
                      <td className="px-3.5 py-2.5 font-bold text-slate-800">{med.name}</td>
                      <td className="px-3.5 py-2.5 text-slate-600">{med.dosage}</td>
                      <td className="px-3.5 py-2.5 text-slate-600">{med.frequency}</td>
                      <td className="px-3.5 py-2.5 text-slate-600">{med.duration}</td>
                      <td className="px-3.5 py-2.5 text-slate-500 italic">{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advice & Sign */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-800 block mb-1">Doctor's Advice & Lifestyle Guidance:</span>
              <p className="p-3 bg-slate-50 rounded-lg border border-slate-200">{prescriptionData.generalAdvice}</p>
              {prescriptionData.followUpDate && (
                <p className="mt-2 text-xs font-semibold text-medicare-700">
                  Recommended Follow-up: {prescriptionData.followUpDate}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end justify-end text-xs text-slate-500 pt-8">
              <div className="w-48 border-b border-slate-400 text-center pb-1 font-serif italic text-slate-700">
                Dr. {prescriptionData.doctor?.user?.name || appointment?.doctor?.user?.name}
              </div>
              <span className="mt-1 font-medium">Authorized Medical Practitioner</span>
              <span className="text-[10px] text-slate-400">MediCare Clinical Board</span>
            </div>
          </div>

          {/* Action Print Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 shadow transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Prescription</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-500">
          <p>No prescription has been created for this appointment yet.</p>
        </div>
      )}
    </Modal>
  );
};

export default PrescriptionModal;
