import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  User, Mail, Phone, Camera, Save, Lock, Eye, EyeOff,
  Bell, Trash2, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { updateProfile, changePassword } from '../api/auth';
import { ProfileSkeleton } from '../components/Skeleton';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    watch,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm();

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      const res = await updateProfile(data);
      updateUser(res.data?.user || data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    setChangingPwd(true);
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed');
      resetPwd();
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPwd(false);
    }
  };

  if (!user) return <div className="max-w-2xl mx-auto px-4 py-8"><ProfileSkeleton /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100 mb-8">Profile Settings</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-white dark:bg-dark-800 shadow-lg border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
              <Camera className="h-4 w-4 text-dark-500" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100">{user.name}</h2>
            <p className="text-sm text-dark-500">{user.email}</p>
            <span className="badge-info mt-2 inline-block">
              {user.role || 'user'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              <User className="h-3.5 w-3.5 inline mr-1" /> Full Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="input-field"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              <Mail className="h-3.5 w-3.5 inline mr-1" /> Email
            </label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="input-field"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              <Phone className="h-3.5 w-3.5 inline mr-1" /> Phone
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="input-field"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-brand-500" /> Change Password
        </h2>

        <form onSubmit={handleSubmitPwd(onChangePassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                {...registerPwd('currentPassword', { required: 'Required' })}
                className="input-field pr-12"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwdErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNewPwd ? 'text' : 'password'}
                {...registerPwd('newPassword', {
                  required: 'Required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                })}
                className="input-field pr-12"
              />
              <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwdErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.newPassword.message}</p>}
          </div>

          <button type="submit" disabled={changingPwd} className="btn-primary flex items-center gap-2">
            {changingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {changingPwd ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-500" /> Notification Preferences
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Email notifications for analysis results', default: true },
            { label: 'Weekly resume optimization tips', default: false },
            { label: 'New feature announcements', default: true },
          ].map((item, i) => (
            <label key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800/50">
              <span className="text-sm text-dark-700 dark:text-dark-200">{item.label}</span>
              <input
                type="checkbox"
                defaultChecked={item.default}
                className="rounded border-dark-300 dark:border-dark-600 text-brand-600 focus:ring-brand-500"
              />
            </label>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
