import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../lib/axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: 'VARGHESE G T',
    email: 'me2355@krce.ac.in',
    phone: '+91 7878787878',
    rollNo: 'ME2355',
    college: '',
    degree: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    password: '',
    department: '',
    semester: '',
    year: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-300/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-300/30 rounded-full blur-[120px] -z-10" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors z-20">
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-12"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-4 text-emerald-600 ring-1 ring-emerald-200">
            <Bus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500">Join Unibus to book your rides instantly.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Roll / ID Number</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="2021BCS001"
                value={formData.rollNo}
                onChange={e => setFormData({...formData, rollNo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                value={formData.dateOfBirth}
                onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="123 Main St"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 border-t border-slate-200 pt-4 mt-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Academic Details</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">College</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                value={formData.college}
                onChange={e => setFormData({...formData, college: e.target.value, degree: '', department: '', semester: '', year: ''})}
                required
              >
                <option value="" disabled>Select College</option>
                <option value="K. RAMAKRISHNAN COLLEGE OF ENGINEERING">K. RAMAKRISHNAN COLLEGE OF ENGINEERING</option>
                <option value="K. RAMAKRISHNAN COLLEGE OF TECHNOLOGY">K. RAMAKRISHNAN COLLEGE OF TECHNOLOGY</option>
                <option value="M. KUMARASAMY COLLEGE OF ENGINEERING">M. KUMARASAMY COLLEGE OF ENGINEERING</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Degree</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.degree}
                onChange={e => setFormData({...formData, degree: e.target.value, department: '', semester: '', year: ''})}
                required
                disabled={!formData.college}
              >
                <option value="" disabled>Select Degree</option>
                <option value="B.E.">B.E.</option>
                <option value="B.Tech.">B.Tech.</option>
                <option value="M.E.">M.E.</option>
                <option value="MBA">MBA</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                required
                disabled={!formData.degree}
              >
                <option value="" disabled>Select Department</option>
                {formData.degree === 'B.E.' && (
                  <>
                    <option value="CSE">CSE</option>
                    <option value="MECH">MECH</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    {formData.college !== 'K. RAMAKRISHNAN COLLEGE OF ENGINEERING' && (
                      <option value="CIVIL">CIVIL</option>
                    )}
                  </>
                )}
                {formData.degree === 'B.Tech.' && (
                  <>
                    <option value="IT">IT</option>
                    <option value="AIDS">AIDS</option>
                    <option value="CSE(AIML)">CSE(AIML)</option>
                    <option value="CSBS">CSBS</option>
                  </>
                )}
                {formData.degree === 'M.E.' && (
                  <option value="General">General</option>
                )}
                {formData.degree === 'MBA' && (
                  <option value="General">General</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Semester</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.semester}
                onChange={e => {
                  const sem = parseInt(e.target.value);
                  let y = '';
                  if (sem <= 2) y = 'I';
                  else if (sem <= 4) y = 'II';
                  else if (sem <= 6) y = 'III';
                  else y = 'IV';
                  setFormData({...formData, semester: e.target.value, year: y});
                }}
                required
                disabled={!formData.degree}
              >
                <option value="" disabled>Select Semester</option>
                {['B.E.', 'B.Tech.'].includes(formData.degree) && (
                  <>
                    <option value="1">1</option><option value="2">2</option>
                    <option value="3">3</option><option value="4">4</option>
                    <option value="5">5</option><option value="6">6</option>
                    <option value="7">7</option><option value="8">8</option>
                  </>
                )}
                {['M.E.', 'MBA'].includes(formData.degree) && (
                  <>
                    <option value="1">1</option><option value="2">2</option>
                    <option value="3">3</option><option value="4">4</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Year of Study</label>
              <input
                type="text"
                readOnly
                className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 focus:outline-none transition-all cursor-not-allowed"
                placeholder="Auto-calculated"
                value={formData.year}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-600 mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
            Log in instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
