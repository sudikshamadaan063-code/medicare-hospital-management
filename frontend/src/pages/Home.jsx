import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Activity,
  Calendar,
  Clock,
  ShieldCheck,
  Award,
  Users,
  Heart,
  ChevronRight,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  Star,
} from 'lucide-react';

const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        if (res.data.success) {
          setFeaturedDoctors(res.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load featured doctors', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const specialties = [
    {
      title: 'Cardiology & Heart Care',
      desc: 'Advanced cardiac catheterization, coronary diagnostics, and heart rhythm management.',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      badge: '24/7 Cath Lab',
    },
    {
      title: 'Neurology & Brain Sciences',
      desc: 'Expert neuro-interventional treatments, stroke recovery, and epilepsy therapies.',
      icon: Activity,
      color: 'from-indigo-500 to-blue-600',
      badge: 'Advanced MRI',
    },
    {
      title: 'Orthopedics & Joint Surgery',
      desc: 'Minimally invasive joint reconstruction, sports medicine, and spinal biomechanics.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Robotic Precision',
    },
    {
      title: 'Pediatrics & Child Wellness',
      desc: 'Compassionate pediatric specialty care, neonatal intensive care, and growth monitoring.',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      badge: 'Level III NICU',
    },
    {
      title: 'Internal Medicine',
      desc: 'Comprehensive adult health assessments, metabolic medicine, and chronic disease protocols.',
      icon: Stethoscope,
      color: 'from-sky-500 to-cyan-600',
      badge: 'Preventative Care',
    },
    {
      title: 'Dermatology & Skin Science',
      desc: 'Clinical dermatology, pediatric dermatology, immunotherapy, and skin health solutions.',
      icon: Sparkles,
      color: 'from-purple-500 to-violet-600',
      badge: 'Laser Technology',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-medicare-50/70 via-white to-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-medicare-100/80 border border-medicare-200 text-medicare-800 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-medicare-600 animate-ping"></span>
                <span>Premier Tertiary Healthcare & Patient Portal</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Modern Medical Care{' '}
                <span className="bg-gradient-to-r from-medicare-600 via-tealcare-600 to-medicare-800 bg-clip-text text-transparent">
                  Centered on You
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                MediCare provides seamless appointment booking, world-renowned medical specialists,
                and digital health management. Schedule appointments in seconds with transparent availability.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-medicare-600 to-tealcare-600 hover:from-medicare-700 hover:to-tealcare-700 shadow-lg shadow-medicare-600/30 transition-all hover:scale-[1.02]"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/doctors"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm hover:border-slate-400 transition-all"
                >
                  <Stethoscope className="w-5 h-5 text-medicare-600" />
                  <span>Meet Our Specialists</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 max-w-lg text-slate-600 text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">Instant Slot Confirmation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">No Double Booking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">Digital Prescriptions</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Floating Hospital Card */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800"
                    alt="MediCare Modern Hospital Campus"
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-5 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          OPD & Emergency Active
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-tealcare-700 bg-tealcare-50 px-2.5 py-0.5 rounded-full">
                        Walk-ins & Online
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                      MediCare Multi-Specialty Medical Center
                    </h3>
                    <p className="text-xs text-slate-500">
                      Advanced robotic operation suites, round-the-clock pathology lab, and 120-bed critical care wing.
                    </p>
                  </div>
                </div>

                {/* Floating Badge Card */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3.5 hidden sm:flex">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-tealcare-500 to-emerald-400 text-white flex items-center justify-center font-bold shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-800">NABH & JCI Certified</div>
                    <div className="text-xs text-slate-500">Highest Clinical Standards</div>
                  </div>
                </div>

                {/* Floating Hotline Card */}
                <div className="absolute -top-6 -right-6 bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center space-x-3 hidden sm:flex">
                  <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                    <PhoneCall className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase">Emergency 24/7</div>
                    <div className="text-xs font-bold text-rose-300">+1 (800) 555-CARE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Statistics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="border-r last:border-0 border-slate-100">
            <div className="text-3xl sm:text-4xl font-black text-medicare-600 tracking-tight">40+</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Eminent Specialists</div>
            <div className="text-[11px] text-slate-400">Board-certified clinicians</div>
          </div>
          <div className="border-r last:border-0 border-slate-100">
            <div className="text-3xl sm:text-4xl font-black text-tealcare-600 tracking-tight">18,500+</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Happy Patients</div>
            <div className="text-[11px] text-slate-400">Treated with compassion</div>
          </div>
          <div className="border-r last:border-0 border-slate-100">
            <div className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">99.4%</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Patient Satisfaction</div>
            <div className="text-[11px] text-slate-400">Clinical excellence feedback</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">24/7</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Emergency & ICU</div>
            <div className="text-[11px] text-slate-400">Zero response latency</div>
          </div>
        </div>
      </section>

      {/* Medical Specialties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-medicare-600">
            Comprehensive Clinical Care
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Our Medical Departments
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Equipped with breakthrough diagnostic infrastructure, cutting-edge surgical suites, and dedicated specialist teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${spec.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {spec.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-medicare-600 transition-colors">
                  {spec.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {spec.desc}
                </p>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/doctors?department=${encodeURIComponent(spec.title.split(' ')[0])}`}
                    className="text-xs font-bold text-medicare-600 hover:text-medicare-700 inline-flex items-center space-x-1"
                  >
                    <span>View Department Doctors</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="bg-slate-100/60 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-medicare-600">
                Medical Excellence
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                Featured Medical Specialists
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Consult with our senior consultants and surgical specialists across premier departments.
              </p>
            </div>
            <Link
              to="/doctors"
              className="inline-flex items-center space-x-2 text-sm font-bold text-medicare-600 hover:text-medicare-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm shrink-0"
            >
              <span>View All Doctors ({featuredDoctors.length}+)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingDoctors ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDoctors.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={doc.user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'}
                        alt={doc.user?.name}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-800 flex items-center space-x-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{doc.rating || 4.9}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-tealcare-700 bg-tealcare-50 px-2 py-0.5 rounded">
                        {doc.specialization}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 pt-1">
                        {doc.user?.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {doc.qualifications?.join(', ')} • {doc.experienceYears} yrs experience
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 pt-1 font-normal">
                        {doc.bio}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Consultation Fee</span>
                      <span className="text-sm font-bold text-slate-800">${doc.consultationFee}</span>
                    </div>
                    <Link
                      to={`/book-appointment?doctorId=${doc._id}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 shadow-sm transition-colors"
                    >
                      Book Visit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Emergency CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-medicare-900 via-slate-900 to-tealcare-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -bottom-10 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
              Emergency Trauma & Cardiac Care 24/7
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Need Urgent Medical Attention?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Our trauma triage and cardiac resuscitation unit operate with immediate standby teams.
              Contact our emergency dispatch hotline or walk straight into our Emergency Wing.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="tel:18005552273"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl text-base font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all"
              >
                <PhoneCall className="w-5 h-5 text-rose-600" />
                <span>Call +1 (800) 555-CARE</span>
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                <span>Directions to Hospital</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
