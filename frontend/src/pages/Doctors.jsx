import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Search,
  Filter,
  Stethoscope,
  Star,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('department') || 'All');
  const [activeDoctorModal, setActiveDoctorModal] = useState(null);

  const departments = [
    'All',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Internal Medicine',
    'Dermatology',
  ];

  useEffect(() => {
    fetchDoctors();
  }, [selectedDept]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = '/doctors';
      const params = new URLSearchParams();
      if (selectedDept && selectedDept !== 'All') {
        params.append('department', selectedDept);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-medicare-600">
          Medical Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Find Your Specialist Doctor
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          Search through our board-certified medical faculty, review qualifications and consultation hours,
          and schedule your visit instantly.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor name, specialization, or medical condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-medicare-600 hover:bg-medicare-700 shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        {/* Department Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Department:</span>
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => {
                setSelectedDept(dept);
                setSearchParams({ department: dept });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? 'bg-medicare-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Card Top */}
              <div className="p-5 space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={doc.user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'}
                    alt={doc.user?.name}
                    className="w-16 h-16 rounded-xl object-cover object-top border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-tealcare-700 bg-tealcare-50 px-2 py-0.5 rounded">
                        {doc.department}
                      </span>
                      <div className="flex items-center space-x-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{doc.rating || 4.9}</span>
                      </div>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 truncate mt-1">
                      {doc.user?.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 truncate">
                      {doc.specialization}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {doc.bio || 'Consultant specialist providing comprehensive diagnostic and clinical therapeutic care.'}
                </p>

                {/* Key metadata chips */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <Award className="w-3.5 h-3.5 text-medicare-600 shrink-0" />
                    <span className="truncate">{doc.qualifications?.join(', ')}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-tealcare-600 shrink-0" />
                    <span>{doc.experienceYears} Years Exp.</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Room: {doc.roomNumber || 'OPD-101'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <span className="font-bold text-slate-700">Fee: ${doc.consultationFee}</span>
                  </div>
                </div>

                {/* Available Days tags */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Consultation Days</div>
                  <div className="flex flex-wrap gap-1">
                    {doc.availableDays?.map((d) => (
                      <span key={d} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {d.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDoctorModal(doc)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                >
                  View Profile
                </button>
                <Link
                  to={`/book-appointment?doctorId=${doc._id}`}
                  className="flex-1 text-center px-4 py-2 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-sm transition-colors"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No doctors match your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or select "All" departments to view our full clinical team.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('All');
            }}
            className="px-4 py-2 text-xs font-bold text-medicare-600 hover:bg-medicare-50 rounded-xl border border-medicare-200"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Doctor Detail Modal */}
      {activeDoctorModal && (
        <Modal
          isOpen={!!activeDoctorModal}
          onClose={() => setActiveDoctorModal(null)}
          title={`Doctor Profile: ${activeDoctorModal.user?.name}`}
          subtitle={`${activeDoctorModal.specialization} • ${activeDoctorModal.department}`}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={activeDoctorModal.user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'}
                alt={activeDoctorModal.user?.name}
                className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-slate-200 shadow"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{activeDoctorModal.user?.name}</h3>
                <p className="text-xs text-medicare-600 font-semibold">{activeDoctorModal.qualifications?.join(', ')}</p>
                <p className="text-xs text-slate-500 mt-1">Experience: {activeDoctorModal.experienceYears} Years</p>
                <div className="mt-1 flex items-center space-x-1 text-xs text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{activeDoctorModal.rating || 4.9} / 5.0 Rating</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Biography & Expertise</h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {activeDoctorModal.bio}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-700 block">Consultation Fee</span>
                <span className="text-base font-extrabold text-slate-900">${activeDoctorModal.consultationFee}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700 block">Hospital Clinic Suite</span>
                <span className="text-slate-800">{activeDoctorModal.roomNumber || 'OPD-101'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Available Time Slots</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeDoctorModal.availableTimeSlots?.map((s) => (
                  <span key={s} className="px-2.5 py-1 text-xs font-medium bg-slate-100 rounded-lg text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveDoctorModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <Link
                to={`/book-appointment?doctorId=${activeDoctorModal._id}`}
                className="px-5 py-2.5 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-md transition-colors"
              >
                Proceed to Book
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Doctors;
