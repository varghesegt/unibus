import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bus, ArrowRight, ShieldCheck, Map, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          <Bus className="text-blue-400" />
          Unibus
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Log in</Link>
          <Link to="/register" className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32 relative">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-200/50 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[100px] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium mb-6 inline-block">
              Welcome to the future of campus transit
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-slate-900">
              Book your seat.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600">
                Never wait in line again.
              </span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Unibus is a smart, real-time bus seat booking system. Reserve your spot instantly and enjoy a stress-free commute.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8"
          >
            <Link to="/register" className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20">
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="flex items-center justify-center px-8 py-4 w-full sm:w-auto rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all shadow-sm">
              I already have an account
            </Link>
          </motion.div>
        </div>

        {/* Features grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-32 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {[
            { icon: <Map className="w-8 h-8 text-blue-600" />, title: 'Visual Seat Map', desc: 'Select your exact seat using our intuitive interactive bus layout.' },
            { icon: <Clock className="w-8 h-8 text-emerald-600" />, title: 'Real-time Sync', desc: 'Seat statuses update instantly. No double bookings, ever.' },
            { icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />, title: 'Secure & Reliable', desc: 'Gender-based seating restrictions and fully secure reservations.' },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-300 transition-colors">
              <div className="p-3 bg-blue-50 rounded-xl inline-block mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
