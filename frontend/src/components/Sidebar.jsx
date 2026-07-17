import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, Sparkles, History, User, Settings,
  ChevronLeft, ChevronRight, Shield, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume-upload', label: 'Resumes', icon: Upload },
  { to: '/analysis', label: 'Analyze', icon: Sparkles },
  { to: '/analysis-history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Admin', icon: Shield },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  const allLinks = isAdmin ? [...sidebarLinks, ...adminLinks] : sidebarLinks;

  const NavItems = ({ mobile = false }) => (
    <div className="space-y-1">
      {allLinks.map((link) => {
        const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => mobile && setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
            }`}
            title={collapsed ? link.label : undefined}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {(!collapsed || mobile) && <span>{link.label}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 bottom-4 z-30 md:hidden p-3 glass rounded-2xl shadow-xl"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside
        className={`hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-30 glass border-r border-white/10 dark:border-dark-700/30 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          <NavItems />
        </div>
        <div className="p-3 border-t border-dark-100 dark:border-dark-700">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full p-2 rounded-xl text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4 mx-auto" /> : <ChevronLeft className="h-4 w-4 mx-auto" />}
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 glass z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-100 dark:border-dark-700">
                <span className="font-bold text-lg">Navigation</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <NavItems mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
