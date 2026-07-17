import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '../components/Toast';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-brand-950" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 items-center justify-center mb-4 shadow-xl">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Reset password</h1>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
              {sent ? 'Check your email for the reset link' : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                  })}
                  className="input-field"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
                If an account with that email exists, you'll receive a password reset link shortly.
              </p>
            </div>
          )}

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mt-6">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
