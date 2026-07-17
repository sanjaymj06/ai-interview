import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, LayoutDashboard, History, Upload, Menu, X, LogOut, Settings, User,
  Sun, Moon, ChevronDown, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume-upload', label: 'Resumes', icon: Upload },
  { to: '/analysis', label: 'Analyze', icon: Sparkles },
  { to: '/analysis-history', label: 'History', icon: History },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10 dark:border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-dark-900 dark:text-dark-100">
                Resume<span className="gradient-text">AI</span>
              </span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                          : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-dark-500 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className="h-4 w-4 text-dark-400 hidden sm:block" />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-xl border border-white/10 dark:border-dark-700/30 p-2 z-20"
                        >
                          <div className="px-3 py-2 mb-1 border-b border-dark-100 dark:border-dark-700">
                            <p className="text-sm font-medium text-dark-900 dark:text-dark-100 truncate">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-dark-500 truncate">{user?.email}</p>
                          </div>
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                          <hr className="my-1 border-dark-100 dark:border-dark-700" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">
                    Sign Up
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden p-2.5 rounded-xl text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 glass z-50 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-100 dark:border-dark-700">
                <span className="font-bold text-lg">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                          : 'text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800'
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
