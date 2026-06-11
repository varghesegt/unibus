import React, { useState } from "react";
import { Link, useLocation, Routes, Route, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Bus, Settings, MapPin, LogOut, Menu, X, Users, ChevronRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

// Import Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBuses from "@/pages/admin/AdminBuses";
import AdminModels from "@/pages/admin/AdminModels";
import AdminBoardingPoints from "@/pages/admin/AdminBoardingPoints";
import AdminUserDetails from "@/pages/admin/AdminUserDetails";
import AdminBusDetails from "@/pages/admin/AdminBusDetails";
import { Bell } from "lucide-react";
import AdminCirculars from "@/pages/admin/AdminCirculars";
import AdminGrievances from "@/pages/admin/AdminGrievances";

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: "easeIn" as const } },
};

const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="flex-1 w-full flex flex-col"
    >
      {children}
    </motion.div>
  );
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (!user.admin && !user.isAdmin) {
        navigate("/dashboard");
      }
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Buses", href: "/admin/buses", icon: Bus },
    { name: "Models", href: "/admin/models", icon: Settings },
    { name: "Boarding Points", href: "/admin/boardingPoints", icon: MapPin },
    { name: "Users", href: "/admin/userDetails", icon: Users },
    { name: "Circulars", href: "/admin/circulars", icon: Bell },
    { name: "Reviews", href: "/admin/grievances", icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-500/30">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 shadow-2xl lg:shadow-none lg:static lg:block transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo / Brand */}
          <div className="flex h-20 items-center justify-between px-8 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Bus className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                Unibus Admin
              </span>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <div className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Overview
            </div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute inset-0 rounded-xl border border-blue-200/50 dark:border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("h-5 w-5 z-10 transition-transform group-hover:scale-110", isActive ? "text-blue-600 dark:text-blue-400" : "")} />
                  <span className="z-10">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto z-10 opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors group"
            >
              <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/50 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 hidden sm:block">
              {navItems.find(item => item.href === location.pathname)?.name || "Dashboard"}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mock User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">System Admin</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">admin@unibus.com</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-sm">
                <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 sm:p-8">
          <div className="max-w-7xl mx-auto w-full h-full">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
                <Route path="/buses" element={<AnimatedPage><AdminBuses /></AnimatedPage>} />
                <Route path="/models" element={<AnimatedPage><AdminModels /></AnimatedPage>} />
                <Route path="/boardingPoints" element={<AnimatedPage><AdminBoardingPoints /></AnimatedPage>} />
                <Route path="/userDetails" element={<AnimatedPage><AdminUserDetails /></AnimatedPage>} />
                <Route path="/circulars" element={<AnimatedPage><AdminCirculars /></AnimatedPage>} />
                <Route path="/grievances" element={<AnimatedPage><AdminGrievances /></AnimatedPage>} />
                <Route path="/bus/:id" element={<AnimatedPage><AdminBusDetails /></AnimatedPage>} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
