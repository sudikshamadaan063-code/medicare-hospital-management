import React, { useState } from 'react';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Medical Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Medical Inquiry',
        message: '',
      });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-medicare-600">
          24/7 Patient Support & Access
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contact MediCare Hospital
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Have inquiries regarding admissions, consultations, or lab services? Our medical support team
          is available round the clock.
        </p>
      </div>

      {/* Emergency Hotline Alert */}
      <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30">
            <PhoneCall className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-950">Immediate Life-Threatening Emergency?</h3>
            <p className="text-xs sm:text-sm text-rose-700">
              For cardiac emergencies, acute trauma, or stroke symptoms, dial our priority dispatch immediately.
            </p>
          </div>
        </div>
        <a
          href="tel:18005552273"
          className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition-colors text-sm whitespace-nowrap"
        >
          Call Emergency +1 (800) 555-CARE
        </a>
      </div>

      {/* Grid: Contact Information & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Hospital Contact Directory
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3.5">
                <MapPin className="w-5 h-5 text-medicare-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">Campus Location:</strong>
                  <span className="text-slate-600 text-xs">
                    742 Health Boulevard, Medical District, Metropolis, CA 90210
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <PhoneCall className="w-5 h-5 text-tealcare-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">Hospital Central Switchboard:</strong>
                  <span className="text-slate-600 text-xs">+1 (555) 019-2830 (Ext 101 for OPD)</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Mail className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">Email Inquiries:</strong>
                  <span className="text-slate-600 text-xs">info@medicare-hospital.org</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">Visiting & Consultation Hours:</strong>
                  <span className="text-slate-600 text-xs">
                    OPD: Monday - Saturday: 8:00 AM – 8:00 PM<br />
                    Emergency & Trauma: Open 24 Hours, 7 Days a week
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Hotlines */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Department Direct Extensions
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Cardiology</span>
                <span className="font-bold text-slate-700">Ext. 201</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Neurology</span>
                <span className="font-bold text-slate-700">Ext. 305</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Radiology Lab</span>
                <span className="font-bold text-slate-700">Ext. 110</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Pharmacy 24/7</span>
                <span className="font-bold text-slate-700">Ext. 104</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Send an Inquiry or Feedback</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fill in the form below and our medical coordinators will respond within 4 hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">Message Received!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you for reaching out. Our patient liaison officer will follow up with you promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Inquiry Department
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                    >
                      <option>General Medical Inquiry</option>
                      <option>Appointment Scheduling</option>
                      <option>Health Checkup Packages</option>
                      <option>Diagnostic & Lab Services</option>
                      <option>Billing & Insurance Claim</option>
                      <option>Feedback / Patient Care Liaison</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry, symptoms, or requested information..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-medicare-600 hover:bg-medicare-700 shadow-md shadow-medicare-600/30 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
