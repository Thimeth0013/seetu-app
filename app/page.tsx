'use client';

import { useAuth } from './context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from './components/LogoutButton';
import ProfileModal from './components/ProfileDrawer';
import { 
  ChevronDown, 
  ShieldCheck, 
  ArrowRight,
  UserRoundPen,
  User as UserIcon
} from 'lucide-react';

interface Seetu {
  id: string;
  title: string;
  openingDate: string;
  closingDate: string;
  minAmount?: number;
  maxAmount?: number;
  createdBy: string;
  placements?: Placement[];
}

interface Placement {
  id: string;
  userId: string;
  username: string;
  amount?: number;
  createdAt: string;
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [seetus, setSeetus] = useState<Seetu[]>([]);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch all seetus
  const fetchSeetus = async () => {
    try {
      const res = await fetch('/api/seetu', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        // Sort by creation date (newest first) - assuming seetus have an id that increments
        const sortedSeetus = (data.seetus || []).reverse();
        setSeetus(sortedSeetus);
      }
    } catch {
      setError('Failed to fetch seetus');
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchSeetus();
    }
  }, [loading]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Seetu</h1>
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-[0.2em]">Premium Savings</p>
          </div>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-full transition-all active:scale-95"
              >
                <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white">
                  <UserIcon size={20} strokeWidth={1.5} />
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Sophisticated Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="px-5 py-4 bg-slate-900 text-white">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Member</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold truncate">{user.username}</p>
                      {user.isAdmin && <ShieldCheck size={16} className="text-amber-400" />}
                    </div>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setShowProfile(true);
                        setIsMenuOpen(false);
                      }} 
                      className="w-full flex items-center gap-3 px-4 py-4 text-lg text-slate-700 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <UserRoundPen size={24} className="text-slate-500" />
                      <span>Profile</span>
                    </button>
                    <div className="border-t border-slate-50 my-1"></div>
                    <LogoutButton isMenuItem={true} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => router.push('/login')} className="text-slate-900 font-bold text-md underline decoration-amber-500 underline-offset-4">Login</button>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-8 pb-20">
        {/* Admin Dashboard Entry */}
        {user?.isAdmin && (
          <button
            onClick={() => router.push('/admin/seetu')}
            className="w-full mb-10 bg-slate-900 group flex items-center justify-between p-6 rounded-3xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-white/10 rounded-2xl">
                <ShieldCheck size={24} className="text-amber-400" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Admin Control</p>
                <p className="text-slate-400 text-xs">Manage groups and members</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
          </button>
        )}

        {/* Section Title */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-slate-900">Current Groups</h2>
          <div className="h-px flex-1 mx-4 bg-slate-100"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{seetus.length} Groups</span>
        </div>

        {/* Seetu Cards */}
        <div className="space-y-6">
          {seetus.map((s) => {
            const now = new Date();
            const isOpen = now >= new Date(s.openingDate) && now < new Date(s.closingDate);

            return (
              <div 
                key={s.id} 
                onClick={() => router.push(`/seetu/${s.id}`)}
                className="group relative bg-slate-50 border border-slate-300 rounded-4xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-300/50 transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{s.title}</h3>
                  </div>
                    {isOpen ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-500 text-[10px] font-black uppercase tracking-wider border border-slate-100">
                        Closed
                      </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Start Date</span>
                    <span className="text-sm font-bold text-slate-700">{new Date(s.openingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">End Date</span>
                    <span className={`text-sm font-bold ${isOpen ? 'text-rose-600' : 'text-slate-700'}`}>
                      {new Date(s.closingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Min Amount</span>
                    <span className="text-sm font-bold text-slate-700">
                      {s.minAmount ? `${s.minAmount.toLocaleString()} LKR` : 'No Limit'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Max Amount</span>
                    <span className="text-sm font-bold text-slate-700">
                      {s.maxAmount ? `${s.maxAmount.toLocaleString()} LKR` : 'No Limit'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Profile Modal Component */}
      {user && (
        <ProfileModal 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)} 
          username={user.username} 
        />
      )}
    </div>
  );
}