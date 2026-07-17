import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getPasswordStrength } from '../utils/validators';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', acceptTerms: false },
  });

  const password = watch('password');
  const strength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-brand-950" />
      <div className="absolute top-10 -left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 items-center justify-center mb-4 shadow-xl shadow-brand-500/25">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Create account</h1>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Start optimizing your resume</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Full name</label>
              <input
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'At least 2 characters' },
                })}
                className="input-field"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Password</label>
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
                  placeholder="Create a strong password"
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
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">Strength: {strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === password || 'Passwords do not match',
                  })}
                  className="input-field pr-12"
                  placeholder="Repeat your password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register('acceptTerms', { required: 'You must accept the terms' })}
                  className="mt-1 rounded border-dark-300 dark:border-dark-600 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-dark-600 dark:text-dark-400">
                  I agree to the{' '}
                  <Link to="/#" className="text-brand-600 dark:text-brand-400 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/#" className="text-brand-600 dark:text-brand-400 hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-500 dark:text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
