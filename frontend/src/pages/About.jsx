import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  Award,
  Heart,
  CheckCircle,
  Building,
  Users,
  Target,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const About = () => {
  const values = [
    {
      title: 'Compassionate Patient-First Care',
      desc: 'Treating every patient with empathy, dignity, and personalized clinical attention throughout their healing journey.',
      icon: Heart,
    },
    {
      title: 'Clinical Excellence & Safety',
      desc: 'Adhering strictly to international evidence-based guidelines, zero-harm protocols, and patient safety standards.',
      icon: ShieldCheck,
    },
    {
      title: 'Technological Innovation',
      desc: 'Deploying state-of-the-art robotic surgery, automated electronic health records, and AI-assisted radiological diagnostics.',
      icon: Sparkles,
    },
    {
      title: 'Uncompromising Integrity',
      desc: 'Transparent medical counsel, ethical billing, and complete medical record privacy.',
      icon: Award,
    },
  ];

  const facilities = [
    { name: 'Total Inpatient Beds', count: '350+' },
    { name: 'Ultra-Clean Modular OTs', count: '14' },
    { name: 'Cardiac Catheterization Labs', count: '3' },
    { name: 'Critical Care ICU Beds', count: '65' },
    { name: 'Full-Service Pathology Tests/Yr', count: '120k+' },
    { name: 'Clinical Specialty Disciplines', count: '28' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-medicare-900 via-slate-900 to-tealcare-950 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3.5 py-1 rounded-full bg-medicare-500/20 text-medicare-300 border border-medicare-500/30 text-xs font-bold uppercase tracking-widest">
            About MediCare Healthcare System
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            Pioneering Healthcare Excellence with Compassion and Innovation
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Established as a center of medical excellence, MediCare brings together global clinical expertise,
            cutting-edge diagnostic technology, and patient-first digital healthcare systems.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-medicare-100 text-medicare-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Our Mission</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To deliver world-class, affordable, and evidence-driven healthcare to every individual in need,
                leveraging state-of-the-art medical technology, compassionate nursing care, and rigorous clinical safety standards.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center space-x-2 text-xs font-bold text-medicare-700">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Dedicated to saving lives 24/7/365</span>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-tealcare-100 text-tealcare-700 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Our Vision</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To be the region's most trusted quaternary healthcare institution and academic medical hub,
                recognized globally for medical breakthroughs, surgical precision, and transparent digital patient governance.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center space-x-2 text-xs font-bold text-tealcare-800">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Zero-barrier access to top medical specialists</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-medicare-600">The MediCare Promise</span>
            <h2 className="text-3xl font-black text-slate-900">Our Core Principles</h2>
            <p className="text-sm text-slate-600">
              Guided by clinical ethics and modern medical science in every consultation and surgery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-medicare-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{v.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Infrastructure & Numbers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-tealcare-700">Hospital Capacity</span>
          <h2 className="text-3xl font-black text-slate-900">Advanced Medical Infrastructure</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {facilities.map((f, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-medicare-600">{f.count}</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">{f.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ready to Consult CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Experience world-class healthcare today</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Schedule your consultation with our board-certified specialists or manage existing appointments.
        </p>
        <div>
          <Link
            to="/book-appointment"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-medicare-600 hover:bg-medicare-700 shadow-lg shadow-medicare-600/30 transition-all"
          >
            <span>Book Your Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
