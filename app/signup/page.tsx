'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [suggestedUsername, setSuggestedUsername] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/signup', {
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
      setError(data.message || 'Signup failed');
      if (data.suggestedUsername) setSuggestedUsername(data.suggestedUsername);
    }
  };

  const useSuggested = () => {
    if (suggestedUsername) {
      setUsername(suggestedUsername);
      setSuggestedUsername(null);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans px-6 py-12 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        
        {/* Simple Back Button for Seniors */}
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest active:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Create Account</h1>
          <div className="h-1 w-12 bg-amber-500 rounded-full mb-4"></div>
          <p className="text-slate-500 text-lg leading-relaxed">
            Join the Seetu community.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-8">
          {/* Username Input */}
          <div className="relative">
            <label className="block text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-5 bg-white text-slate-900 text-lg border border-slate-200 rounded-3xl shadow-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="e.g. Elizabeth"
              required
            />
          </div>

          {/* Suggested Username Helper - Premium Card style */}
          {suggestedUsername && (
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex justify-between items-center animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-amber-600" size={24} />
                <div>
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Available Alternative</p>
                  <p className="font-bold text-slate-900 text-lg">{suggestedUsername}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={useSuggested}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                Pick
              </button>
            </div>
          )}

          {/* Password Input with Modern Toggle */}
          <div className="relative">
            <label className="block text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2 ml-1">
              Secure Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-5 pr-14 bg-white text-slate-900 text-lg border border-slate-200 rounded-3xl shadow-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:outline-none transition-all placeholder:text-slate-400"
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
            <p className="mt-3 text-xs text-slate-600 font-medium italic ml-1 flex items-center gap-1.5">
              Choose something meaningful to you.
            </p>
          </div>

          {/* Error Message - High Visibility */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-5 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
              <AlertCircle size={20} />
              <p className="font-bold text-sm leading-tight">{error}</p>
            </div>
          )}

          {/* Primary Action Button */}
          <button 
            type="submit"
            className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold text-xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all group"
          >
            <span>Create My Account</span>
            <UserPlus size={20} strokeWidth={2.5} className="text-amber-400" />
          </button>
        </form>

        {/* Premium Navigation Footer */}
        <div className="pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-600 font-medium mb-6">Already a member?</p>
          <Link 
            href="/login" 
            className="inline-block w-full py-5 border border-slate-300 text-slate-900 rounded-3xl font-bold text-lg active:bg-slate-50 transition-colors shadow-sm"
          >
            Sign In to Your Account
          </Link>
        </div>
      </div>
    </div>
  );
}