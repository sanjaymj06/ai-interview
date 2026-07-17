import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '../components/Toast';
import { resetPassword } from '../api/auth';
import { getPasswordStrength } from '../utils/validators';

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');
  const strength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const token = searchParams.get('token');
      await resetPassword({ token, password: data.password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
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
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Set new password</h1>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Must contain uppercase, lowercase, and number',
                    },
                  })}
                  className="input-field pr-12"
                  placeholder="New password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${strength.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">Strength: {strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Confirm password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
                className="input-field"
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
              {isLoading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mt-6">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
