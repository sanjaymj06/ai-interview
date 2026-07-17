import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, BarChart3, TrendingUp, Upload, Sparkles,
  Target, Briefcase, Clock, ArrowRight, Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStats, getCharts, getRecent } from '../api/dashboard';
import { useToast } from '../components/Toast';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '../components/Skeleton';
import { formatDate, formatScore, getScoreBg } from '../utils/format';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const statCards = [
  { key: 'totalResumes', label: 'Total Resumes', icon: FileText, gradient: 'from-brand-500 to-purple-600' },
  { key: 'avgScore', label: 'Avg ATS Score', icon: Target, gradient: 'from-emerald-500 to-teal-600' },
  { key: 'bestScore', label: 'Best Score', icon: TrendingUp, gradient: 'from-orange-500 to-pink-600' },
  { key: 'totalAnalyses', label: 'Total Analyses', icon: BarChart3, gradient: 'from-cyan-500 to-blue-600' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes, recentRes] = await Promise.all([
          getStats(),
          getCharts(),
          getRecent(),
        ]);
        setStats(statsRes.data);
        setCharts(chartsRes.data);
        setRecent(recentRes.data || []);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Here's your resume analysis overview</p>
        </div>
        <Link to="/analysis" className="btn-primary hidden sm:flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          New Analysis
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const value = stats?.[card.key];
          const displayValue = card.key === 'avgScore' || card.key === 'bestScore'
            ? (value !== null && value !== undefined ? `${Math.round(value)}%` : 'N/A')
            : (value ?? 0);
          return (
            <motion.div
              key={card.key}
              whileHover={{ y: -4 }}
              className="glass-card p-6 relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 h-24 w-24 rounded-bl-3xl bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="flex items-start justify-between mb-4">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-1">{displayValue}</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">{card.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6 mb-8">
        {charts?.skillDistribution && (
          <PieChart
            data={charts.skillDistribution}
            title="Skill Distribution"
          />
        )}
        {charts?.scoreBreakdown && (
          <BarChart
            data={charts.scoreBreakdown}
            title="Score Breakdown"
          />
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8">
        {charts?.trends && (
          <LineChart
            data={charts.trends}
            title="Analysis Trends"
          />
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Recent Analyses</h3>
          <Link to="/analysis-history" className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-dark-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-dark-500 dark:text-dark-400 mb-4">No analyses yet</p>
            <Link to="/analysis" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Run your first analysis
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Resume</th>
                  <th className="pb-3 pr-4">Job Title</th>
                  <th className="pb-3 pr-4">ATS Score</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                {recent.map((item, i) => (
                  <motion.tr
                    key={item._id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-sm"
                  >
                    <td className="py-3 pr-4 text-dark-600 dark:text-dark-400 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-dark-900 dark:text-dark-100">{item.resumeName || 'Resume'}</td>
                    <td className="py-3 pr-4 text-dark-600 dark:text-dark-400">{item.jobTitle || 'N/A'}</td>
                    <td className="py-3 pr-4">
                      <span className={getScoreBg(item.atsScore)}>
                        {formatScore(item.atsScore)}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/analysis/${item._id}`}
                        className="text-brand-600 dark:text-brand-400 hover:text-brand-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
