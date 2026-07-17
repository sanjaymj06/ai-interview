import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Mail, Phone, Globe, MapPin, Calendar, Briefcase,
  GraduationCap, Award, Code, Languages, ExternalLink, ArrowLeft,
  Trash2, Edit,
} from 'lucide-react';
import { getResume, deleteResume } from '../api/resume';
import { useToast } from '../components/Toast';
import { ProfileSkeleton } from '../components/Skeleton';
import { formatDate } from '../utils/format';

export default function ResumeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getResume(id);
        setResume(res.data?.resume || res.data);
      } catch {
        toast.error('Failed to load resume');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this resume?')) return;
    try {
      await deleteResume(id);
      toast.success('Resume deleted');
      navigate('/resume-upload');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><ProfileSkeleton /></div>;
  if (!resume) return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-dark-500">Resume not found</div>;

  const parsed = resume.parsedData || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/resume-upload" className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">{parsed.name || 'Resume Details'}</h1>
            <p className="text-sm text-dark-500">{resume.originalName || resume.filename}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="btn-danger text-sm py-2 px-4 flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {parsed.name && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">Personal Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsed.name && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-brand-500" />
                <div>
                  <p className="text-xs text-dark-400">Name</p>
                  <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{parsed.name}</p>
                </div>
              </div>
            )}
            {parsed.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-500" />
                <div>
                  <p className="text-xs text-dark-400">Email</p>
                  <p className="text-sm text-dark-900 dark:text-dark-100">{parsed.email}</p>
                </div>
              </div>
            )}
            {parsed.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-500" />
                <div>
                  <p className="text-xs text-dark-400">Phone</p>
                  <p className="text-sm text-dark-900 dark:text-dark-100">{parsed.phone}</p>
                </div>
              </div>
            )}
            {parsed.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-brand-500" />
                <div>
                  <p className="text-xs text-dark-400">Location</p>
                  <p className="text-sm text-dark-900 dark:text-dark-100">{parsed.location}</p>
                </div>
              </div>
            )}
            {parsed.linkedin && (
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 text-brand-500" />
                <div>
                  <p className="text-xs text-dark-400">LinkedIn</p>
                  <p className="text-sm text-brand-600">{parsed.linkedin}</p>
                </div>
              </div>
            )}
            {parsed.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-brand-500" />
                <div>
                  <p className="text-xs text-dark-400">Website</p>
                  <p className="text-sm text-brand-600">{parsed.website}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {parsed.skills?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-brand-500" /> Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {parsed.skills.map((skill, i) => (
              <span key={i} className="badge-info">{skill}</span>
            ))}
          </div>
        </motion.div>
      )}

      {parsed.experience?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-500" /> Experience
          </h2>
          <div className="space-y-6">
            {parsed.experience.map((exp, i) => (
              <div key={i} className="relative pl-6 border-l-2 border-brand-200 dark:border-brand-800">
                <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
                <h3 className="font-semibold text-dark-900 dark:text-dark-100">{exp.title || exp.position}</h3>
                <p className="text-sm text-brand-600 dark:text-brand-400">{exp.company}</p>
                {exp.dates && <p className="text-xs text-dark-400 mt-1">{exp.dates}</p>}
                {exp.description && <p className="text-sm text-dark-600 dark:text-dark-400 mt-2">{exp.description}</p>}
                {exp.highlights?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-sm text-dark-600 dark:text-dark-400 flex items-start gap-2">
                        <span className="text-brand-500 mt-1">•</span> {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {parsed.education?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-brand-500" /> Education
          </h2>
          <div className="space-y-4">
            {parsed.education.map((edu, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-brand-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900 dark:text-dark-100">{edu.degree || edu.field}</h3>
                  <p className="text-sm text-dark-500">{edu.institution}</p>
                  {edu.dates && <p className="text-xs text-dark-400">{edu.dates}</p>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {parsed.projects?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-500" /> Projects
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {parsed.projects.map((proj, i) => (
              <div key={i} className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                <h3 className="font-semibold text-dark-900 dark:text-dark-100">{proj.name}</h3>
                {proj.description && <p className="text-sm text-dark-500 mt-1">{proj.description}</p>}
                {proj.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {proj.technologies.map((t, j) => (
                      <span key={j} className="badge-neutral text-xs">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {parsed.certifications?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-500" /> Certifications
          </h2>
          <div className="space-y-3">
            {parsed.certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-brand-500" />
                <span className="text-sm text-dark-900 dark:text-dark-100">{cert.name || cert}</span>
                {cert.issuer && <span className="text-xs text-dark-400">— {cert.issuer}</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {parsed.languages?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
            <Languages className="h-5 w-5 text-brand-500" /> Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {parsed.languages.map((lang, i) => (
              <span key={i} className="badge-neutral">
                {typeof lang === 'string' ? lang : `${lang.name}${lang.level ? ` — ${lang.level}` : ''}`}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
