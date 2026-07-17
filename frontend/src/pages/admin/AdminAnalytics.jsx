import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, FileText, Download } from 'lucide-react';
import { getAnalytics, exportReports } from '../../api/admin';
import { useToast } from '../../components/Toast';
import { ChartSkeleton } from '../../components/Skeleton';

export default function AdminAnalytics() {
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then((res) => {
      setAnalytics(res.data);
    }).catch(() => {
      toast.error('Failed to load analytics');
    }).finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const res = await exportReports('csv');
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics-report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-brand-500" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100">Analytics</h1>
            <p className="text-sm text-dark-500">Detailed system metrics and usage data</p>
          </div>
        </div>
        <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartSkeleton /><ChartSkeleton />
          <ChartSkeleton /><ChartSkeleton />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-500" /> User Statistics
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Total Users', value: analytics?.totalUsers || 0 },
                { label: 'Active Users', value: analytics?.activeUsers || 0 },
                { label: 'New This Week', value: analytics?.newUsersThisWeek || 0 },
                { label: 'Avg Sessions/User', value: analytics?.avgSessionsPerUser || 0 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                  <span className="text-sm text-dark-600 dark:text-dark-400">{item.label}</span>
                  <span className="text-sm font-bold text-dark-900 dark:text-dark-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-500" /> Usage Metrics
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Total Resumes', value: analytics?.totalResumes || 0 },
                { label: 'Total Analyses', value: analytics?.totalAnalyses || 0 },
                { label: 'Avg Score', value: analytics?.avgScore ? `${Math.round(analytics.avgScore)}%` : 'N/A' },
                { label: 'Analyses Today', value: analytics?.analysesToday || 0 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                  <span className="text-sm text-dark-600 dark:text-dark-400">{item.label}</span>
                  <span className="text-sm font-bold text-dark-900 dark:text-dark-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-500" /> Performance Metrics
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Avg Response Time', value: '230ms' },
                { label: 'Uptime', value: '99.9%' },
                { label: 'API Requests (24h)', value: analytics?.apiRequests24h?.toLocaleString() || '0' },
                { label: 'Error Rate', value: '0.02%' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                  <span className="text-sm text-dark-600 dark:text-dark-400">{item.label}</span>
                  <span className="text-sm font-bold text-dark-900 dark:text-dark-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4">Growth Overview</h3>
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-dark-400">Growth chart visualization would render here with user growth data over time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
