import React, { useState, useContext } from 'react';
import { User, Mail, Lock, X, ArrowLeft, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { toast } from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose }) => {
  const { login } = useContext(AuthContext);

  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot', 'otp'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;
  const switchView = (v) => {
    setView(v);
    if (v === 'login') setFormData({ name: '', email: '', password: '', otp: '' });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.includes('@')) return setError('Invalid email address');
    if (formData.password.length < 6) return setError('Password must be 6+ chars');

    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      setIsLoading(false);
      setSuccessMsg(`OTP sent to ${formData.email}`);
      setView('otp');
      toast.success(`OTP sent to ${formData.email}`);
    } catch (err) {
      setIsLoading(false);
      const msg = err.response?.data?.msg || 'Registration failed'
      setError(msg);
      toast.error(msg);
    }
  };
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: otp
      });

      setIsLoading(false);
      setSuccessMsg('Account verified! Please login.');
      toast.success("Account verified! Please login.")
      setTimeout(() => switchView('login'), 1500);
    } catch (err) {
      setIsLoading(false);
      const msg = err.response?.data?.msg || 'Invalid OTP'
      setError(msg);
      toast.error(msg);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {

      await login(formData.email, formData.password);

      setIsLoading(false);
      onClose();
      toast.success("Welcome back!")
    } catch (err) {
      setIsLoading(false);
      const msg = err.response?.data?.msg || 'Invalid credentials';
      setError();
      toast.error(msg)
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email.includes('@')) return toast.error('Enter a valid email');

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: formData.email });
      setIsLoading(false);
      toast.success("Reset code sent!");
      setView('reset');
    } catch (err) {
      setIsLoading(false);
      toast.error(err.response?.data?.msg || 'Request failed');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) return toast.error('Password too short');

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.password
      });
      setIsLoading(false);
      toast.success("Password Reset Successful!");
      setView('login');
    } catch (err) {
      setIsLoading(false);
      toast.error(err.response?.data?.msg || 'Reset failed. Check OTP.');
    }
  };

  const InputField = ({ icon: Icon, type, placeholder, value, name, showToggle }) => (
    <div className="relative">
      <Icon className="absolute left-4 top-3.5 text-gray-500" size={18} />
      <input
        type={showToggle && showPassword ? "text" : type}
        placeholder={placeholder}
        className="w-full bg-[#1e1e2d] border border-gray-700 rounded-xl py-3 pl-12 pr-10 text-white focus:border-[#E50914] outline-none"
        value={value}
        onChange={e => setFormData({ ...formData, [name]: e.target.value })}
        required
      />
      {showToggle && (
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500 hover:text-white">
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">

      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />


      <div className="relative bg-[#181825] w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/10 animate-scale-in">


        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>


        {view !== 'login' && view !== 'signup' && (
          <button onClick={() => switchView('login')} className="absolute top-4 left-4 text-gray-500 hover:text-white"><ArrowLeft size={24} /></button>
        )}

        <h2 className="text-3xl font-black text-white mb-2">
          {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : view === 'otp' ? 'Verify Email' : 'Reset Password'}
        </h2>


        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm mb-4 mt-2">{error}</div>}
        {successMsg && <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-2 rounded-lg text-sm mb-4 mt-2 flex items-center gap-2"><CheckCircle size={16} /> {successMsg}</div>}


        {view === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input type="email" placeholder="Email Address" className="w-full bg-[#1e1e2d] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#E50914] outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input type="password" placeholder="Password" className="w-full bg-[#1e1e2d] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#E50914] outline-none" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            <div className="text-right">
              <button type="button" onClick={() => switchView('forgot')} className="text-xs text-gray-400 hover:text-[#E50914]">Forgot Password?</button>
            </div>
            <button disabled={isLoading} className="bg-[#E50914] hover:bg-[#ff1c32] text-white py-3.5 rounded-xl font-bold text-lg mt-2 shadow-lg transition-all disabled:opacity-50">
              {isLoading ? 'Logging In...' : 'Login'}
            </button>
            <p className="text-center text-gray-500 text-sm mt-4">
              New here? <button type="button" onClick={() => switchView('signup')} className="text-[#E50914] font-bold hover:underline">Create Account</button>
            </p>
          </form>
        )}

        {view === 'signup' && (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-4 mt-6">
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input type="text" placeholder="Full Name" className="w-full bg-[#1e1e2d] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#E50914] outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input type="email" placeholder="Email Address" className="w-full bg-[#1e1e2d] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#E50914] outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input type="password" placeholder="Password" className="w-full bg-[#1e1e2d] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#E50914] outline-none" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            <button disabled={isLoading} className="bg-[#E50914] hover:bg-[#ff1c32] text-white py-3.5 rounded-xl font-bold text-lg mt-2 shadow-lg transition-all disabled:opacity-50">
              {isLoading ? 'Creating Account...' : 'Verify & Create'}
            </button>
            <p className="text-center text-gray-500 text-sm mt-4">
              Already have an account? <button type="button" onClick={() => switchView('login')} className="text-[#E50914] font-bold hover:underline">Login</button>
            </p>
          </form>
        )}

        {view === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4 mt-6">
            <p className="text-gray-400 text-sm mb-2">Enter the 6-digit code sent to <b>{formData.email}</b></p>
            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input type="text" placeholder="e.g. 123456" maxLength="6" className="w-full bg-[#1e1e2d] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#E50914] outline-none tracking-widest font-mono text-lg" value={otp} onChange={e => setOtp(e.target.value)} required />
            </div>
            <button disabled={isLoading} className="bg-[#E50914] hover:bg-[#ff1c32] text-white py-3.5 rounded-xl font-bold text-lg mt-2 shadow-lg transition-all disabled:opacity-50">
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" onClick={() => switchView('signup')} className="text-sm text-gray-500 hover:text-white mt-2">Change Email</button>
          </form>
        )}


        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 mt-6">
            <p className="text-gray-400 text-sm mb-2">Enter your email to receive password reset OTP.</p>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-[#1e1e2d] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#E50914] outline-none"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <button disabled={isLoading} className="bg-[#E50914] hover:bg-[#ff1c32] text-white py-3.5 rounded-xl font-bold text-lg mt-2 shadow-lg transition-all disabled:opacity-50">
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => switchView('login')} className="text-sm text-gray-500 hover:text-white mt-2">Back to Login</button>
          </form>
        )}

        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4 mt-6">
            <p className="text-gray-400 text-sm mb-2">Enter the code sent to <b>{formData.email}</b> and your new password.</p>

            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="6-digit Code"
                maxLength="6"
                className="w-full bg-[#1e1e2d] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#E50914] outline-none tracking-widest font-mono text-lg"
                value={formData.otp}
                onChange={e => setFormData({ ...formData, otp: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="password"
                placeholder="New Password"
                className="w-full bg-[#1e1e2d] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#E50914] outline-none"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button disabled={isLoading} className="bg-[#E50914] hover:bg-[#ff1c32] text-white py-3.5 rounded-xl font-bold text-lg mt-2 shadow-lg transition-all disabled:opacity-50">
              {isLoading ? 'Reseting...' : 'Change Password'}
            </button>
            <button type="button" onClick={() => switchView('login')} className="text-sm text-gray-500 hover:text-white mt-2">Cancel</button>
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginModal;