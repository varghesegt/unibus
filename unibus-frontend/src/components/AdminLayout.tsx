import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bus, Settings, MapPin, Grid, LogOut } from 'lucide-react';

export default function AdminLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: <Settings className="w-5 h-5" /> },
    { name: 'Bus Models', path: '/admin/models', icon: <Grid className="w-5 h-5" /> },
    { name: 'Boarding Points', path: '/admin/boardingPoints', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Buses', path: '/admin/buses', icon: <Bus className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            <Bus className="text-blue-400" />
            Unibus
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider">Admin Portal</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-medium' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Bus className="text-blue-400" />
            Unibus
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400">
            <LogOut className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">{title}</h1>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
