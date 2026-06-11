import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import AdminLayout from './components/layout/AdminLayout';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  if (adminOnly && !user.admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' as const } }
};

const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen w-full flex flex-col"
    >
      {children}
    </motion.div>
  );
};

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
        <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
        <Route path="/register" element={<AnimatedPage><RegisterPage /></AnimatedPage>} />
        
        {/* User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><AnimatedPage><Dashboard /></AnimatedPage></ProtectedRoute>} />
        <Route path="/dashboard/booking" element={<ProtectedRoute><AnimatedPage><BookingPage /></AnimatedPage></ProtectedRoute>} />
        
        {/* Admin Routes - Direct access (login removed for now) */}
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
