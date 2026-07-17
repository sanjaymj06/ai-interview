import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Sparkles, Upload, BarChart3, CheckCircle, XCircle, AlertTriangle,
  Lightbulb, TrendingUp, Download, ChevronDown, FileText, Target,
} from 'lucide-react';
import { getResumes } from '../api/resume';
import { getJobDescriptions } from '../api/jobDescription';
import { runAnalysis } from '../api/analysis';
import { useToast } from '../components/Toast';
import ScoreGauge from '../components/charts/ScoreGauge';
import RadarChart from '../components/charts/RadarChart';
import { formatScore, getScoreBg } from '../utils/format';

const scoreCategories = [
  { key: 'keywordScore', label: 'Keyword Match', icon: Target, desc: 'How well keywords match the job' },
  { key: 'skillScore', label: 'Skills', icon: Code, desc: 'Relevant skills present' },
  { key: 'experienceScore', label: 'Experience', icon: Briefcase, desc: 'Experience level match' },
  { key: 'educationScore', label: 'Education', icon: GraduationCap, desc: 'Education requirements' },
  { key: 'projectScore', label: 'Projects', icon: Award, desc: 'Project relevance' },
  { key: 'certScore', label: 'Certifications', icon: Award, desc: 'Certification match' },
];

export default function Analysis() {
  const toast = useToast();
  const [resumes, setResumes] = useState([]);
  const [jobDescs, setJobDescs] = useState([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: { resumeId: '', jobDescription: '', savedJobDesc: '' },
  });

  const selectedSavedJob = watch('savedJobDesc');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [resumesRes, jdRes] = await Promise.all([getResumes(), getJobDescriptions()]);
        setResumes(resumesRes.data?.resumes || resumesRes.data || []);
        setJobDescs(jdRes.data?.jobDescriptions || jdRes.data || []);
      } catch { /* ignore */ }
    };
    fetch();
  }, []);

  const onSubmit = async (data) => {
    if (!data.resumeId) { toast.error('Please select a resume'); return; }
    const jd = data.savedJobDesc || data.jobDescription;
    if (!jd) { toast.error('Please provide a job description'); return; }
    setRunning(true);
    setResult(null);
    try {
      const res = await runAnalysis({ resumeId: data.resumeId, jobDescription: jd });
      setResult(res.data?.analysis || res.data);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setRunning(false);
    }
  };

  const handleExport = async () => {
    if (!result?._id) return;
    try {
      const { exportReport } = await import('../api/analysis');
      const res = await exportReport(result._id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-report-${result._id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">Resume Analysis</h1>
        <p className="text-dark-500 dark:text-dark-400 mb-8">Analyze your resume against any job description</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Select Resume</label>
              <select {...register('resumeId', { required: true })} className="input-field">
                <option value="">Choose a resume...</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>{r.originalName || r.filename}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Saved Job Descriptions</label>
              <select {...register('savedJobDesc')} className="input-field">
                <option value="">Paste custom description below</option>
                {jobDescs.map((j) => (
                  <option key={j._id} value={j.content || j.text}>{j.title || j.jobTitle}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Job Description {selectedSavedJob ? '(overridden by selection above)' : ''}
            </label>
            <textarea
              {...register('jobDescription')}
              rows={6}
              className="input-field resize-none font-mono text-sm"
              placeholder="Paste the job description here..."
              disabled={!!selectedSavedJob}
            />
          </div>

          <button
            type="submit"
            disabled={running}
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3"
          >
            {running ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {running ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </form>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100">Results</h2>
              <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
                <Download className="h-4 w-4" /> Export PDF
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <ScoreGauge score={result.atsScore} size={220} label="ATS Score" className="lg:col-span-1" />
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {scoreCategories.map((cat) => {
                  const val = result[cat.key];
                  return (
                    <div key={cat.key} className="glass-card p-4 text-center">
                      <cat.icon className="h-5 w-5 mx-auto mb-2 text-brand-500" />
                      <p className="text-lg font-bold text-dark-900 dark:text-dark-100">{formatScore(val)}</p>
                      <p className="text-xs text-dark-500">{cat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {result.radarData && <RadarChart data={result.radarData} title="Multi-Dimensional Comparison" />}

              <div className="space-y-4">
                {result.missingSkills?.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" /> Missing Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((s, i) => (
                        <span key={i} className="badge-error">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.strengths?.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Strengths
                    </h3>
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-dark-700 dark:text-dark-200 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.weakAreas?.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" /> Areas to Improve
                    </h3>
                    <ul className="space-y-2">
                      {result.weakAreas.map((w, i) => (
                        <li key={i} className="text-sm text-dark-700 dark:text-dark-200 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {result.suggestions?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" /> Improvement Suggestions
                </h3>
                <div className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-brand-50/50 dark:bg-brand-900/10">
                      <span className="h-6 w-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center shrink-0 font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-dark-700 dark:text-dark-200">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Code({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg> }
function Briefcase({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> }
function GraduationCap({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> }
function Award({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg> }
