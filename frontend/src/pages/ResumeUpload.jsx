import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Trash2, Eye, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import DragDropUpload from '../components/DragDropUpload';
import { useToast } from '../components/Toast';
import { uploadResume, getResumes, deleteResume } from '../api/resume';
import { formatDate, formatFileSize } from '../utils/format';

export default function ResumeUpload() {
  const toast = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchResumes = async () => {
    try {
      const res = await getResumes();
      setResumes(res.data?.resumes || res.data || []);
    } catch (err) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResumes(); }, []);

  const handleUpload = async (formData) => {
    try {
      await uploadResume(formData);
      toast.success('Resume uploaded successfully!');
      fetchResumes();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteResume(id);
      toast.success('Resume deleted');
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error('Failed to delete resume');
    } finally {
      setDeleting(null);
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'parsed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'parsing': return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-dark-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100">Upload Resume</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Upload your resume in PDF or DOCX format</p>
      </div>

      <DragDropUpload onUpload={handleUpload} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10"
      >
        <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
          Your Resumes ({resumes.length})
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="h-12 w-12 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
            <p className="text-dark-500 dark:text-dark-400">No resumes uploaded yet</p>
            <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">Upload your first resume above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume, i) => (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 flex items-center gap-4 group hover:border-brand-200/50 dark:hover:border-brand-800/30"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-900 dark:text-dark-100 truncate">
                    {resume.originalName || resume.filename || 'Resume'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-dark-500 dark:text-dark-400">
                    {resume.fileSize && <span>{formatFileSize(resume.fileSize)}</span>}
                    <span>{formatDate(resume.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      {statusIcon(resume.status)}
                      {resume.status || 'pending'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {resume.status === 'parsed' && (
                    <Link
                      to={`/resume/${resume._id}`}
                      className="p-2.5 rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(resume._id)}
                    disabled={deleting === resume._id}
                    className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    {deleting === resume._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
