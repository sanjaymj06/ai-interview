import { motion } from 'framer-motion';

export default function ScoreGauge({ score = 0, size = 180, label = 'ATS Score', className = '' }) {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (normalizedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return { stroke: '#22c55e', text: 'text-green-500', bg: '#22c55e20' };
    if (s >= 60) return { stroke: '#eab308', text: 'text-yellow-500', bg: '#eab30820' };
    return { stroke: '#ef4444', text: 'text-red-500', bg: '#ef444420' };
  };

  const color = getColor(normalizedScore);

  return (
    <div className={`glass-card p-6 flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className="transform -rotate-90"
        >
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-dark-100 dark:text-dark-800"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={color.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-4xl font-bold ${color.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {Math.round(normalizedScore)}%
          </motion.span>
          <span className="text-xs text-dark-500 dark:text-dark-400 mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
}
