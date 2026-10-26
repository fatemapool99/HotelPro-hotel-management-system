import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import { formatDateDDMMYYYY } from '../utils/formatters';
import {
  User,
  Lock,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateCurrentUser } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateCurrentUser(res.data.user);
      toast.success('Your profile has been updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setSavingPassword(true);
    try {
      await authAPI.updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Change password error:', err);
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Banner / VIP Card */}
      <div className="bg-gradient-to-r from-hotel-navy via-hotel-navyLight to-hotel-navy text-hotel-cream p-8 rounded-3xl border border-hotel-gold/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-hotel-gold text-hotel-navy font-serif font-extrabold text-3xl flex items-center justify-center shadow-gold-glow shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {user?.name}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-hotel-gold/20 text-hotel-goldLight border border-hotel-gold/40">
                {user?.role === 'admin' ? 'Hotel Director (Admin)' : 'VIP Gold Member'}
              </span>
            </div>
            <p className="text-xs text-gray-300 font-medium">{user?.email}</p>
            <p className="text-xs text-gray-400">
              HotelPro Member since {user?.createdAt ? formatDateDDMMYYYY(user.createdAt) : '2026'}
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center sm:text-right shrink-0">
            <span className="text-[10px] text-hotel-gold uppercase tracking-wider block font-bold">
              Privileges Tier
            </span>
            <span className="font-serif text-lg font-bold text-white">Bespoke Concierge</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-hotel-sand shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-hotel-sand">
            <User className="w-5 h-5 text-hotel-goldDark" />
            <h3 className="font-serif font-bold text-lg text-hotel-navy">
              Personal Information
            </h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-hotel-sand bg-gray-100 text-xs text-gray-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Email cannot be modified directly.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 rounded-xl bg-hotel-navy text-hotel-gold font-bold text-xs uppercase tracking-wider hover:bg-hotel-navyLight transition-colors disabled:opacity-50"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-hotel-sand shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-hotel-sand">
            <Lock className="w-5 h-5 text-hotel-goldDark" />
            <h3 className="font-serif font-bold text-lg text-hotel-navy">
              Security & Credentials
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm transition-all disabled:opacity-50"
            >
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
