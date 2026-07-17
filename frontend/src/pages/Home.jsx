import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Zap, Shield, BarChart3, Sparkles, Target, ArrowRight,
  CheckCircle, Star, Quote, Users, Upload, Brain, TrendingUp,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'Advanced AI analyzes your resume against job descriptions with 98% accuracy.' },
  { icon: Target, title: 'ATS Score Check', desc: 'See exactly how your resume performs with Applicant Tracking Systems.' },
  { icon: Zap, title: 'Smart Suggestions', desc: 'Get actionable recommendations to improve each section of your resume.' },
  { icon: Shield, title: 'Skill Gap Analysis', desc: 'Identify missing keywords and skills recruiters are looking for.' },
  { icon: BarChart3, title: 'Detailed Reports', desc: 'Comprehensive breakdowns of keyword match, experience, and education scores.' },
  { icon: Sparkles, title: 'Resume Optimizer', desc: 'Optimize your resume section by section with AI-powered suggestions.' },
];

const steps = [
  { icon: Upload, step: '01', title: 'Upload Resume', desc: 'Upload your resume in PDF or DOCX format. We support all standard formats.' },
  { icon: FileText, step: '02', title: 'Add Job Description', desc: 'Paste the job description you want to target for maximum relevance.' },
  { icon: Brain, step: '03', title: 'Run Analysis', desc: 'Our AI analyzes your resume against the job requirements instantly.' },
  { icon: TrendingUp, step: '04', title: 'Get Results', desc: 'Receive detailed scores, suggestions, and an optimized resume version.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Software Engineer', company: 'Google', quote: 'ResumeAI helped me land interviews at top tech companies. My ATS score went from 45% to 92%.', rating: 5, initials: 'SC' },
  { name: 'Marcus Johnson', role: 'Product Manager', company: 'Microsoft', quote: 'The skill gap analysis was a game-changer. I knew exactly what to add to get noticed.', rating: 5, initials: 'MJ' },
  { name: 'Emily Rodriguez', role: 'Marketing Director', company: 'Spotify', quote: 'Within a week of using ResumeAI, I had three interview invitations. Incredible tool!', rating: 5, initials: 'ER' },
];

function AnimatedCounter({ end, duration = 2, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}{suffix}</span>;
}

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-brand-950" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand-500/5 to-purple-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200/50 dark:border-brand-800/30 mb-8">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                AI-Powered Resume Optimization
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-dark-900 dark:text-dark-100 mb-6 leading-tight"
          >
            Land More Interviews
            <br />
            with{' '}
            <span className="gradient-text">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto mb-10"
          >
            Upload your resume, paste a job description, and let our AI analyze, score, and optimize your resume to get you more interviews.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2 inline" />
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4">
              Watch Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex items-center justify-center gap-8 flex-wrap text-sm text-dark-500 dark:text-dark-400"
          >
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> No credit card</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Free analysis</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Instant results</div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { num: 50000, label: 'Resumes Analyzed', suffix: '+' },
              { num: 95, label: 'Accuracy Rate', suffix: '%' },
              { num: 10000, label: 'Happy Users', suffix: '+' },
              { num: 85, label: 'Avg Score Increase', suffix: '%' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                  <AnimatedCounter end={stat.num} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 bg-dark-50/50 dark:bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-dark-100 mb-4">
              Everything you need to{' '}
              <span className="gradient-text">succeed</span>
            </h2>
            <p className="text-lg text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              Powerful features to help you create the perfect resume and land your dream job.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="glass-card p-8 group hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/30 transition-shadow">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-dark-100 mb-4">
              How it{' '}
              <span className="gradient-text">works</span>
            </h2>
            <p className="text-lg text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              Four simple steps to a better resume.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center relative"
              >
                <div className="relative z-10 h-24 w-24 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/20">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <span className="text-sm font-bold text-brand-500 mb-2 block">{step.step}</span>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-2">{step.title}</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-50/50 dark:bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-dark-100 mb-4">
              Loved by{' '}
              <span className="gradient-text">thousands</span>
            </h2>
            <p className="text-lg text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              Hear from professionals who landed their dream jobs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8"
              >
                <Quote className="h-8 w-8 text-brand-500/30 mb-4" />
                <p className="text-dark-700 dark:text-dark-300 mb-6 leading-relaxed">{t.quote}</p>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-dark-900 dark:text-dark-100">{t.name}</p>
                    <p className="text-xs text-dark-400">{t.role} at {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 sm:p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 -left-20 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-dark-100 mb-4">
                Ready to{' '}
                <span className="gradient-text">optimize</span> your resume?
              </h2>
              <p className="text-lg text-dark-500 dark:text-dark-400 mb-8 max-w-xl mx-auto">
                Join thousands of professionals who have improved their resumes and landed more interviews.
              </p>
              <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
