import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, BarChart3, Activity, Shield, TrendingUp, Cpu } from 'lucide-react';
import { getAnalytics } from '../../api/admin';
import { useToast } from '../../components/Toast';
import { CardSkeleton } from '../../components/Skeleton';

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, gradient: 'from-brand-500 to-purple-600' },
  { key: 'totalResumes', label: 'Total Resumes', icon: FileText, gradient: 'from-emerald-500 to-teal-600' },
  { key: 'totalAnalyses', label: 'Total Analyses', icon: BarChart3, gradient: 'from-orange-500 to-pink-600' },
  { key: 'activeToday', label: 'Active Today', icon: Activity, gradient: 'from-cyan-500 to-blue-600' },
];

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then((res) => {
      setStats(res.data);
    }).catch(() => {
      toast.error('Failed to load analytics');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-7 w-7 text-brand-500" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100">Admin Dashboard</h1>
          <p className="text-sm text-dark-500">System overview and statistics</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 h-24 w-24 rounded-bl-3xl bg-gradient-to-br ${card.gradient} opacity-5`} />
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-1">
                  {stats?.[card.key] ?? 0}
                </p>
                <p className="text-sm text-dark-500">{card.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-500" /> System Health
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'API Status', value: 'Operational', status: 'success' },
                  { label: 'Database', value: 'Connected', status: 'success' },
                  { label: 'AI Service', value: 'Running', status: 'success' },
                  { label: 'Storage', value: '67% Used', status: 'warning' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                    <span className="text-sm text-dark-600 dark:text-dark-400">{item.label}</span>
                    <span className={`text-sm font-medium badge-${item.status}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-brand-500" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Manage Users', href: '/admin/users' },
                  { label: 'View Analytics', href: '/admin/analytics' },
                  { label: 'System Logs', href: '/admin/logs' },
                  { label: 'Export Reports', href: '#', action: true },
                ].map((action, i) => (
                  <a
                    key={i}
                    href={action.href || '#'}
                    className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 hover:bg-dark-100 dark:hover:bg-dark-700/50 transition-colors text-center"
                  >
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-200">{action.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
