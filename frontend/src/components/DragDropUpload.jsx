import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import { formatFileSize } from '../utils/format';

export default function DragDropUpload({ onUpload, accept = '.pdf,.docx', maxSize = 10 * 1024 * 1024 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const validateFile = useCallback(
    (file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const allowed = accept.split(',').map((a) => a.trim().toLowerCase());
      if (!allowed.includes(ext)) {
        setError(`Invalid file type. Accepted: ${accept}`);
        return false;
      }
      if (file.size > maxSize) {
        setError(`File too large. Max size: ${formatFileSize(maxSize)}`);
        return false;
      }
      return true;
    },
    [accept, maxSize]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    },
    [validateFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSelect = useCallback(
    (e) => {
      setError(null);
      const selectedFile = e.target.files[0];
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    },
    [validateFile]
  );

  const handleUpload = async () => {
    if (!file || !onUpload) return;
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);
      await onUpload(formData);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        setUploading(false);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
          isDragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-[1.02]'
            : file
            ? 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10'
            : 'border-dark-300 dark:border-dark-600 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10'
        }`}
        whileHover={{ scale: file ? 1 : 1.01 }}
        whileTap={{ scale: file ? 1 : 0.99 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleSelect}
          className="hidden"
          disabled={uploading}
        />
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 mb-4 shadow-lg shadow-brand-500/25">
                <Upload className="h-7 w-7 text-white" />
              </div>
              <p className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-1">
                {isDragging ? 'Drop your file here' : 'Drop your resume here'}
              </p>
              <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
                or click to browse
              </p>
              <p className="text-xs text-dark-400 dark:text-dark-500">
                Supports PDF, DOCX &middot; Max {formatFileSize(maxSize)}
              </p>
            </motion.div>
          ) : uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <Loader2 className="h-10 w-10 text-brand-500 mx-auto animate-spin" />
              <p className="font-medium text-dark-900 dark:text-dark-100">Uploading...</p>
              <div className="h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden max-w-xs mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-dark-500">{progress}%</p>
            </motion.div>
          ) : (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-green-100 dark:bg-green-900/30 mb-2">
                <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-5 w-5 text-brand-500" />
                <span className="font-medium text-dark-900 dark:text-dark-100">{file.name}</span>
                <span className="text-sm text-dark-500">({formatFileSize(file.size)})</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  className="btn-primary text-sm px-5 py-2"
                >
                  Upload Resume
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="btn-secondary text-sm px-5 py-2"
                >
                  <X className="h-4 w-4 mr-1 inline" />
                  Remove
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-red-500 flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
