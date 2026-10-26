import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Lock, Mail, User, Phone, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const { authModal, closeAuthModal, login, register } = useAuth();
  const toast = useToast();

  const [isLogin, setIsLogin] = useState(authModal.mode !== 'register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!authModal.isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        // SkillWallet Rule: Ordinary users → UserHome, Administrators → AdminHome
        const loggedInUser = await login(formData.email, formData.password);
        toast.success(`Welcome back, ${loggedInUser.name}!`);
        closeAuthModal();
        if (onLoginSuccess) {
          onLoginSuccess(loggedInUser);
        }
      } else {
        // SkillWallet Rule: Registration must include full name, email, phone, password, confirm password
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
          throw new Error('All fields are required.');
        }

        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(formData.email.trim())) {
          throw new Error('Please enter a valid email address.');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match. Please verify your password.');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });

        // SkillWallet Rule: After successful registration, redirect to Login
        toast.success('Registration successful! Please sign in with your new credentials.');
        setSuccessMessage('Registration successful! Please sign in with your credentials.');
        setIsLogin(true);
        setFormData((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
      }
    } catch (err) {
      console.error('Auth error:', err);
      const msg =
        err.response?.data?.message || err.message || 'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      setFormData({
        name: 'HotelPro Admin',
        email: 'admin@hotelpro.com',
        phone: '+1 (800) 555-0199',
        password: 'Admin@123456',
        confirmPassword: 'Admin@123456',
      });
      setIsLogin(true);
    } else {
      setFormData({
        name: 'Alexander Wright',
        email: 'guest@hotelpro.com',
        phone: '+1 (555) 724-8831',
        password: 'Guest@123456',
        confirmPassword: 'Guest@123456',
      });
      setIsLogin(true);
    }
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-hotel-navy border border-hotel-gold/30 rounded-2xl shadow-2xl overflow-hidden text-hotel-cream">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-hotel-navyLight to-hotel-navy p-6 border-b border-hotel-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-hotel-gold/20 border border-hotel-gold/40 flex items-center justify-center text-hotel-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-hotel-cream">
                {isLogin ? 'Sign In to HotelPro' : 'Create Guest Account'}
              </h3>
              <p className="text-xs text-hotel-goldLight">
                {isLogin ? 'Access your luxury reservations' : 'Sign up to book and manage stays'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-hotel-gold/20">
          <button
            onClick={() => {
              setIsLogin(true);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 ${
              isLogin
                ? 'text-hotel-gold border-b-2 border-hotel-gold bg-hotel-gold/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 ${
              !isLogin
                ? 'text-hotel-gold border-b-2 border-hotel-gold bg-hotel-gold/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick Demo Fill Pill Buttons */}
          <div className="p-3 rounded-xl bg-hotel-navyLight/70 border border-hotel-gold/20 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-hotel-goldLight block">
              Quick One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('guest')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-hotel-navy border border-hotel-gold/40 hover:border-hotel-gold text-hotel-cream hover:text-hotel-gold transition-colors text-center"
              >
                👤 Demo Guest
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-hotel-navy border border-hotel-gold/40 hover:border-hotel-gold text-hotel-cream hover:text-hotel-gold transition-colors text-center"
              >
                🛡️ Demo Admin
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-hotel-gold absolute left-3 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full pl-9 pr-3 py-2 bg-hotel-navyLight border border-hotel-gold/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-hotel-gold transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-hotel-gold absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-hotel-navyLight border border-hotel-gold/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-hotel-gold transition-colors"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-hotel-gold absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 bg-hotel-navyLight border border-hotel-gold/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-hotel-gold transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-hotel-gold absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 bg-hotel-navyLight border border-hotel-gold/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-hotel-gold transition-colors"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Must be at least 6 characters</p>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-hotel-gold absolute left-3 top-3" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 bg-hotel-navyLight border border-hotel-gold/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-hotel-gold transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 shadow-gold-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-hotel-navy border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{isLogin ? 'Sign In Now' : 'Register Account'}</span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 pt-2">
            {isLogin ? "Don't have an account yet? " : 'Already registered? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-hotel-gold font-semibold underline hover:text-hotel-goldLight transition-colors"
            >
              {isLogin ? 'Register here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
