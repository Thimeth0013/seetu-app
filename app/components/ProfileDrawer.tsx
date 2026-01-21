'use client';

import { useState, useEffect } from 'react';
import { X, History } from 'lucide-react';

interface Placement {
  id: string;
  userId: string;
  username: string;
  amount?: number;
  createdAt: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function ProfileModal({ isOpen, onClose, username }: ProfileModalProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [history, setHistory] = useState<{ seetuTitle: string; amount: number; createdAt: string }[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user's placement history (only closed seetus)
  const fetchPlacementHistory = async () => {
    setProfileLoading(true);
    try {
      const res = await fetch('/api/seetu/user-data?status=closed', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) return;

      const userHistory = data.seetus
        .map((s: any) => {
          const p = s.placements?.find((pl: Placement) => pl.username === username);
          if (!p) return null;
          return {
            seetuTitle: s.title,
            amount: p.amount || 0,
            createdAt: p.createdAt,
          };
        })
        .filter(Boolean);

      setHistory(userHistory);
    } catch (err) {
      console.error('Failed to fetch placement history', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Initialize username and fetch history when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsernameInput(username);
      fetchPlacementHistory();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, username]);

  // Update username
  const updateUsername = async () => {
    if (!usernameInput.trim()) return;
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: usernameInput.trim() }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        alert('Username updated');
        window.location.reload();
      } else {
        alert(data.message || 'Failed to update username');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update username');
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account?')) return;
    try {
      const res = await fetch('/api/auth/me', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Account deleted');
        window.location.href = '/';
      } else {
        alert(data.message || 'Failed to delete account');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete account');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto backdrop-blur-lg">
      <div 
        className="flex min-h-full items-end justify-center"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-xl bg-white/60 rounded-3xl border border-slate-300 shadow-2xl mt-10 mb-20 animate-in slide-in-from-bottom duration-500"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header Section */}
          <div className="px-8 pt-8 pb-6 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 leading-tight">Your Account</h2>
              <p className="text-slate-600 font-bold text-sm mt-1 uppercase tracking-tight">Personal Settings & History</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 bg-slate-100 rounded-full text-slate-900 border-2 border-slate-300 active:bg-slate-200"
            >
              <X size={28} strokeWidth={3} />
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="px-8 pb-16 space-y-12">
            
            {/* Section 1: Name Update */}
            <section className="bg-slate-50 p-6 rounded-4xl border border-slate-300 shadow-sm">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">
                Username
              </label>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-2xl px-5 py-4 font-bold text-xl text-slate-900 focus:border-slate-600 focus:outline-none"
                  placeholder="Name"
                />
                <button 
                  onClick={updateUsername} 
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-lg active:scale-[0.98] transition-all"
                >
                  Update Username
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-600 font-bold">
                * This is your username, make sure to remember it.
              </p>
            </section>

            {/* Section 2: History */}
            <section>
              <div className="flex items-center gap-2 mb-6 ml-1 text-amber-600">
                <History size={26} strokeWidth={3} />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your History</h3>
              </div>
              
              <div className="space-y-4">
                {profileLoading ? (
                  <div className="py-12 text-center text-slate-900 font-bold text-xl animate-pulse">
                    Fetching your records...
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-12 px-6 text-center bg-white border-2 border-dashed border-slate-300 rounded-4xl">
                    <p className="text-slate-900 font-black text-xl mb-1">No Groups Found</p>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-tighter">Your closed seetus will show up here</p>
                  </div>
                ) : (
                  history.map((h, idx) => (
                    <div key={idx} className="flex justify-between items-center p-6 bg-white border border-slate-300 rounded-3xl shadow-md transition-transform active:scale-[0.99]">
                      <div className="flex-1 pr-4">
                        <p className="font-black text-slate-900 text-lg leading-tight mb-2 uppercase">{h.seetuTitle}</p>
                        <p className="text-xs text-slate-600 font-bold tracking-widest">{new Date(h.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-900 leading-none">{h.amount}</p>
                        <p className="text-xs font-black text-amber-600 uppercase mt-2">LKR</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Section 3: Safe Exit Buttons */}
            <div className="pt-10 border-t-4 border-slate-100 space-y-4">
              <button 
                onClick={onClose} 
                className="w-full py-6 bg-slate-100 text-slate-900 rounded-4xl font-black text-xl border-2 border-slate-400 active:bg-slate-200 shadow-sm"
              >
                Close and Go Back
              </button>
              
              <div className="pt-6">
                <p className="text-center text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Account Danger Zone</p>
                <button 
                  onClick={deleteAccount} 
                  className="w-full py-4 text-white font-black text-sm uppercase tracking-[0.2em] border-2 border-red-700 rounded-2xl bg-red-600"
                >
                  Delete My Account Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}