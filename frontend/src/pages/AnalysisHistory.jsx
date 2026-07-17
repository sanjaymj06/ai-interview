import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, Trash2, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAnalysisHistory, deleteAnalysis } from '../api/analysis';
import { useToast } from '../components/Toast';
import { useDebounce } from '../hooks/useDebounce';
import { TableSkeleton } from '../components/Skeleton';
import { formatDateTime, formatScore, getScoreBg } from '../utils/format';

export default function AnalysisHistory() {
  const toast = useToast();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const debouncedSearch = useDebounce(search);

  const fetchAnalyses = async () => {
    try {
      const res = await getAnalysisHistory({ page, limit: 10, search: debouncedSearch });
      const data = res.data;
      setAnalyses(data?.analyses || data || []);
      setTotalPages(data?.totalPages || 1);
    } catch {
      toast.error('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalyses(); }, [page, debouncedSearch]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
      toast.success('Analysis deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">Analysis History</h1>
        <p className="text-dark-500 dark:text-dark-400 mb-6">View all your past resume analyses</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search analyses..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : analyses.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-dark-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-dark-500 dark:text-dark-400 mb-4">No analyses found</p>
            <Link to="/analysis" className="btn-primary inline-flex items-center gap-2">
              Run your first analysis
            </Link>
          </div>
        ) : (
          <>
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
                  {analyses.map((item, i) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="text-sm hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors"
                    >
                      <td className="py-3 pr-4 text-dark-600 dark:text-dark-400 whitespace-nowrap">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="py-3 pr-4 font-medium text-dark-900 dark:text-dark-100">
                        {item.resumeName || 'Resume'}
                      </td>
                      <td className="py-3 pr-4 text-dark-600 dark:text-dark-400">
                        {item.jobTitle || 'N/A'}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={getScoreBg(item.atsScore)}>
                          {formatScore(item.atsScore)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/analysis/${item._id}`}
                            className="p-2 rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deleting === item._id}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-100 dark:border-dark-700">
                <p className="text-sm text-dark-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="btn-secondary text-sm py-2 px-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary text-sm py-2 px-3"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
