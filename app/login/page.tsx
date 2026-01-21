'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { LogIn, Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound, Info, X } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success && data.user) {
      setUser(data.user);
      router.push('/');
    } else {
      setError(data.message || 'Login failed. Please check your details.');
    }
  };

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000); // Disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans px-6 py-12 flex flex-col justify-center">
      
      {/* PREMIUM TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed top-6 left-6 right-6 z-50 animate-in slide-in-from-top duration-500">
          <div className="max-w-md mx-auto bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-4">
            <div className="bg-amber-500/20 p-2 rounded-xl">
              <Info className="text-amber-500" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-1 text-amber-500">Account Help</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Please contact your Seetu Admin to reset your password.
              </p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-slate-500 active:text-white">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-md mx-auto w-full">  
        {/* Simple Back Button for Seniors */}
        <button 
          onClick={() => router.push('/')}
          className="mb-8 flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest active:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Sign In</h1>
          <div className="h-1 w-12 bg-amber-500 rounded-full mb-4"></div>
          <p className="text-slate-500 text-lg leading-relaxed">
            Enter your credentials to access your account.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          {/* Username Field */}
          <div className="relative">
            <label className="block text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-5 bg-white text-slate-900 text-lg border border-slate-300 rounded-3xl shadow-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="Your username"
              required
            />
          </div>

          {/* Password Field with Modern Toggle */}
          <div className="relative">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 pr-14 bg-white text-slate-900 text-lg border border-slate-300 rounded-3xl shadow-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:outline-none transition-all placeholder:text-slate-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 active:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff size={22} strokeWidth={1.5} /> : <Eye size={22} strokeWidth={1.5} />}
              </button>
            </div>
            <button 
              type="button"
              onClick={() => setShowToast(true)}
              className="flex gap-2 ml-auto mr-2 mt-6 text-slate-500 font-bold text-xs uppercase tracking-widest active:text-amber-600 transition-colors"
            >
              <KeyRound size={14} />
              Forgot Password?
            </button>
          </div>

          {/* Error Message - High Visibility */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-5 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
              <AlertCircle size={20} />
              <p className="font-bold text-sm leading-tight">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold text-xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            <span>Sign In</span>
            <LogIn size={20} strokeWidth={2.5} className="text-amber-400" />
          </button>
        </form>

        {/* Navigation Footer */}
        <div className="pt-8 border-t border-slate-100 text-center space-y-6">
          <div>
            <p className="text-slate-600 font-medium mb-6">New to Seetu?</p>
            <Link
              href="/signup"
              className="inline-block w-full py-5 border border-slate-300 text-slate-900 rounded-3xl font-bold text-lg active:bg-slate-50 transition-colors shadow-sm"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}