import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download, FileText, RefreshCw } from 'lucide-react';
import { getResumes } from '../api/resume';
import { useToast } from '../components/Toast';

export default function ResumeOptimizer() {
  const toast = useToast();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(null);
  const [activeSection, setActiveSection] = useState('summary');

  useEffect(() => {
    getResumes().then((res) => {
      setResumes(res.data?.resumes || res.data || []);
    }).catch(() => {});
  }, []);

  const handleOptimize = async () => {
    if (!selectedResume) { toast.error('Please select a resume'); return; }
    setOptimizing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setOptimized({
      summary: {
        original: 'Experienced software engineer with 5 years of experience in web development.',
        optimized: 'Passionate Software Engineer with 5+ years of expertise delivering scalable web applications, specializing in React, Node.js, and cloud architecture.',
      },
      experience: {
        original: 'Worked on frontend development tasks using React.',
        optimized: 'Architected and implemented responsive React-based user interfaces, improving page load times by 40% and increasing user engagement by 25%.',
      },
      skills: {
        original: 'JavaScript, React, CSS, HTML, Python',
        optimized: 'JavaScript (ES6+), React.js, TypeScript, Node.js, Python, AWS, Docker, GraphQL, Tailwind CSS, CI/CD',
      },
    });
    setOptimizing(false);
    toast.success('Resume optimized!');
  };

  const sections = [
    { id: 'summary', label: 'Professional Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">Resume Optimizer</h1>
        <p className="text-dark-500 dark:text-dark-400 mb-8">Optimize each section of your resume with AI</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedResume}
            onChange={(e) => setSelectedResume(e.target.value)}
            className="input-field flex-1"
          >
            <option value="">Select a resume...</option>
            {resumes.map((r) => (
              <option key={r._id} value={r._id}>{r.originalName || r.filename}</option>
            ))}
          </select>
          <button
            onClick={handleOptimize}
            disabled={optimizing || !selectedResume}
            className="btn-primary flex items-center justify-center gap-2 px-8"
          >
            {optimizing ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {optimizing ? 'Optimizing...' : 'Optimize'}
          </button>
        </div>
      </motion.div>

      {optimized && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === s.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'btn-secondary'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {sections.map((section) => (
            activeSection === section.id && (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="glass-card p-6 border-red-200/50 dark:border-red-800/30">
                  <h3 className="text-sm font-semibold text-red-500 mb-3">Before</h3>
                  <p className="text-sm text-dark-700 dark:text-dark-300 leading-relaxed">
                    {optimized[section.id]?.original}
                  </p>
                </div>
                <div className="glass-card p-6 border-green-200/50 dark:border-green-800/30">
                  <h3 className="text-sm font-semibold text-green-500 mb-3">After (Optimized)</h3>
                  <p className="text-sm text-dark-700 dark:text-dark-300 leading-relaxed">
                    {optimized[section.id]?.optimized}
                  </p>
                </div>
              </motion.div>
            )
          ))}

          <div className="flex items-center justify-center gap-4 pt-4">
            <button className="btn-primary flex items-center gap-2">
              <Download className="h-4 w-4" /> Download Optimized Resume
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
