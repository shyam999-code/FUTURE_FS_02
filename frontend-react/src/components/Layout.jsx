import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabase';

const Layout = ({ children, title }) => {
  const { user, role } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'ph-squares-four' },
    { name: 'Leads',     path: '/leads',     icon: 'ph-users' },
    { name: 'Analytics', path: '/analytics', icon: 'ph-chart-bar' },
    { name: 'Settings',  path: '/settings',  icon: 'ph-gear', adminOnly: true },
  ];

  const filteredNav = navItems.filter(item => !item.adminOnly || role === 'admin');
  const userInitial = user?.email?.charAt(0).toUpperCase() || '?';

  const openSidebar  = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-screen overflow-hidden flex w-full transition-colors duration-200">

      {/* ── Mobile Overlay ── */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64
        bg-white dark:bg-slate-800
        border-r border-slate-200 dark:border-slate-700
        flex flex-col pt-5 pb-4
        transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <i className="ph ph-chart-line-up text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Nexus CRM</h1>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
          >
            <i className="ph ph-x text-2xl"></i>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <i className={`ph ${item.icon} text-xl`}></i>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: theme toggle + logout */}
        <div className="px-4 mt-4 space-y-1">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors text-sm"
          >
            <i className={`ph ${isDark ? 'ph-sun' : 'ph-moon'} text-xl`}></i>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors text-sm"
          >
            <i className="ph ph-sign-out text-xl"></i>
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={openSidebar}
              className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none p-1"
            >
              <i className="ph ph-list text-2xl"></i>
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 truncate">{title}</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle in header (mobile quick access) */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center h-9 w-9 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={`ph ${isDark ? 'ph-sun' : 'ph-moon'} text-xl`}></i>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[140px]">{user?.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{role}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-700 text-sm flex-shrink-0">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-200 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
