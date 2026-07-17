import { motion } from 'framer-motion';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12', xl: 'h-16 w-16' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size] || sizes.md} border-2 border-brand-200 dark:border-brand-800 border-t-brand-600 dark:border-t-brand-400 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function Dots({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-brand-500"
          animate={{ y: ['0%', '-60%', '0%'] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function Pulse({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="h-12 w-12 rounded-full bg-brand-500/30"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function LoadingSpinner({ variant = 'spinner', size, className }) {
  switch (variant) {
    case 'dots':
      return <Dots className={className} />;
    case 'pulse':
      return <Pulse className={className} />;
    default:
      return <Spinner size={size} className={className} />;
  }
}
