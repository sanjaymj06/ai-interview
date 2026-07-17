import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, ChevronLeft, ChevronRight, ScrollText, Filter } from 'lucide-react';
import { getLogs, exportReports } from '../../api/admin';
import { useToast } from '../../components/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDateTime } from '../../utils/format';

const levels = ['all', 'info', 'warning', 'error', 'debug'];

export default function AdminLogs() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    getLogs({ page, limit: 20, search: debouncedSearch, level: level === 'all' ? undefined : level })
      .then((res) => {
        const data = res.data;
        setLogs(data?.logs || data || []);
        setTotalPages(data?.totalPages || 1);
      })
      .catch(() => toast.error('Failed to load logs'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, level]);

  const handleExport = async () => {
    try {
      const res = await exportReports('csv');
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'system-logs.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Logs exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const levelColors = {
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    debug: 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ScrollText className="h-7 w-7 text-brand-500" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100">System Logs</h1>
            <p className="text-sm text-dark-500">Monitor system events and errors</p>
          </div>
        </div>
        <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search logs..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-dark-400" />
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => { setLevel(l); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  level === l
                    ? 'bg-brand-500 text-white'
                    : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton h-10 rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <ScrollText className="h-12 w-12 text-dark-300 mx-auto mb-3" />
            <p className="text-dark-500">No logs found</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {logs.map((log, i) => (
                <motion.div
                  key={log._id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors"
                >
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium capitalize whitespace-nowrap ${levelColors[log.level] || levelColors.info}`}>
                    {log.level}
                  </span>
                  <p className="flex-1 text-sm text-dark-700 dark:text-dark-200 font-mono">
                    {log.message}
                  </p>
                  <span className="text-xs text-dark-400 whitespace-nowrap">
                    {formatDateTime(log.timestamp || log.createdAt)}
                  </span>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-100 dark:border-dark-700">
                <p className="text-sm text-dark-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-3">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary text-sm py-2 px-3">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
