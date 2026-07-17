import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Download, Share2, CheckCircle, XCircle, AlertTriangle,
  Lightbulb, Target,
} from 'lucide-react';
import { getAnalysis, exportReport } from '../api/analysis';
import { useToast } from '../components/Toast';
import ScoreGauge from '../components/charts/ScoreGauge';
import RadarChart from '../components/charts/RadarChart';
import BarChart from '../components/charts/BarChart';
import { ChartSkeleton } from '../components/Skeleton';
import { formatScore, getScoreBg } from '../utils/format';

export default function AnalysisDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAnalysis(id);
        setAnalysis(res.data?.analysis || res.data);
      } catch {
        toast.error('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleExport = async () => {
    try {
      const res = await exportReport(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-report-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="skeleton h-6 w-32 mb-8" />
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <ChartSkeleton />
          <div className="lg:col-span-2"><ChartSkeleton /></div>
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (!analysis) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-center text-dark-500">Analysis not found</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/analysis-history" className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Analysis Details</h1>
            <p className="text-sm text-dark-500">{analysis.resumeName || 'Resume'} vs {analysis.jobTitle || 'Job'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button onClick={handleExport} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <ScoreGauge score={analysis.atsScore} size={220} label="ATS Score" />
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { key: 'keywordScore', label: 'Keyword Match' },
            { key: 'skillScore', label: 'Skills' },
            { key: 'experienceScore', label: 'Experience' },
            { key: 'educationScore', label: 'Education' },
            { key: 'projectScore', label: 'Projects' },
            { key: 'certScore', label: 'Certifications' },
          ].map((cat) => (
            <div key={cat.key} className="glass-card p-4 text-center">
              <p className="text-lg font-bold text-dark-900 dark:text-dark-100">{formatScore(analysis[cat.key])}</p>
              <p className="text-xs text-dark-500">{cat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {analysis.radarData && <RadarChart data={analysis.radarData} title="Multi-Dimensional Comparison" />}
        {analysis.scoreBreakdown && <BarChart data={analysis.scoreBreakdown} title="Score Breakdown" />}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {analysis.missingSkills?.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-3 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" /> Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((s, i) => (
                <span key={i} className="badge-error">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {analysis.strengths?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.weakAreas?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" /> Areas to Improve
              </h3>
              <ul className="space-y-2">
                {analysis.weakAreas.map((w, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {analysis.suggestions?.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" /> Improvement Suggestions
          </h3>
          <div className="space-y-3">
            {analysis.suggestions.map((s, i) => (
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
  );
}
