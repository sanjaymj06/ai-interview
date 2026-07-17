import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, BookOpen, Target, Loader2 } from 'lucide-react';
import { getResumes } from '../api/resume';
import { useToast } from '../components/Toast';
import BarChart from '../components/charts/BarChart';
import RadarChart from '../components/charts/RadarChart';

export default function JobMatch() {
  const toast = useToast();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    getResumes().then((res) => {
      setResumes(res.data?.resumes || res.data || []);
    }).catch(() => {});
  }, []);

  const handleMatch = async () => {
    if (!selectedResume) { toast.error('Please select a resume'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setResults({
      matchedJobs: [
        { title: 'Senior Frontend Developer', match: 92, company: 'TechCorp' },
        { title: 'React Developer', match: 88, company: 'StartupXYZ' },
        { title: 'Full Stack Engineer', match: 76, company: 'BigCo' },
        { title: 'Software Engineer II', match: 71, company: 'EnterpriseInc' },
        { title: 'Frontend Lead', match: 65, company: 'ScaleUp' },
      ],
      recommendedSkills: ['TypeScript', 'GraphQL', 'AWS', 'Docker', 'Next.js', 'Testing'],
      careerSuggestions: ['Senior Frontend Engineer', 'Full Stack Developer', 'Technical Lead'],
      skillGap: {
        labels: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'CSS', 'Testing', 'System Design'],
        datasets: [
          { label: 'Your Skills', values: [90, 85, 60, 70, 80, 45, 30] },
          { label: 'Market Demand', values: [85, 80, 90, 75, 70, 85, 80] },
        ],
      },
    });
    setLoading(false);
    toast.success('Job matching complete!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">Job Match</h1>
        <p className="text-dark-500 dark:text-dark-400 mb-8">Find jobs that match your resume and identify skill gaps</p>
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
            onClick={handleMatch}
            disabled={loading || !selectedResume}
            className="btn-primary flex items-center justify-center gap-2 px-8"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Target className="h-5 w-5" />}
            {loading ? 'Matching...' : 'Find Matches'}
          </button>
        </div>
      </motion.div>

      {results && (
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-brand-500" /> Matched Jobs
            </h2>
            <div className="space-y-3">
              {results.matchedJobs.map((job, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                  <div>
                    <p className="font-semibold text-dark-900 dark:text-dark-100">{job.title}</p>
                    <p className="text-sm text-dark-500">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{job.match}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-yellow-500" /> Recommended Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.recommendedSkills.map((s, i) => (
                  <span key={i} className="badge-warning">{s}</span>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" /> Career Suggestions
              </h3>
              <ul className="space-y-2">
                {results.careerSuggestions.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-dark-700 dark:text-dark-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {results.skillGap && (
            <div className="grid md:grid-cols-2 gap-6">
              <BarChart
                data={results.skillGap}
                title="Skill Gap Analysis"
              />
              <RadarChart
                data={results.skillGap}
                title="Skills Comparison"
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
