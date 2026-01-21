'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import InputModal from '../../components/InputModal';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

import { 
  ArrowLeft, 
  Wallet, 
  CheckCircle2, 
  Lock, 
  PencilLine, 
  Trash2, 
  UserCircle2,
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface Seetu {
  id: string;
  title: string;
  openingDate: string;
  closingDate: string;
  minAmount?: number;
  maxAmount?: number;
  createdBy: string;
}

interface Placement {
  id: string;
  user: string;
  amount?: number;
  createdAt: string;
}

export default function SeetuPage() {
  const { id } = useParams();
  const router = useRouter();
  const [seetu, setSeetu] = useState<Seetu | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [amount, setAmount] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState('');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.success) setUser(data.user);
  };

  const fetchSeetu = async () => {
    const res = await fetch(`/api/seetu/${id}`);
    const data = await res.json();
    if (data.success) setSeetu(data.seetu);
  };

  const fetchPlacements = async () => {
    const res = await fetch(`/api/seetu/${id}/placements`);
    const data = await res.json();
    if (data.success) setPlacements(data.placements);
  };

  // Countdown Logic
  useEffect(() => {
    if (!seetu) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const deadline = new Date(seetu.closingDate).getTime();
      const difference = deadline - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [seetu]);

  useEffect(() => {
    fetchUser();
    fetchSeetu();
    fetchPlacements();
  }, [id]);

  const handlePlace = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setLoading(true);
    setMessage('');
    const res = await fetch(`/api/seetu/${id}/placements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) }),
      credentials: 'include',
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      showToast('Placement saved successfully!', 'success');
      setAmount('');
      fetchPlacements();
    } else {
      showToast(data.message || 'Failed to save placement', 'error');
    }
  };

  const openUpdateModal = (placementId: string, currentAmt: number | undefined) => {
    setSelectedPlacementId(placementId);
    setCurrentAmount(currentAmt?.toString() || '');
    setShowUpdateModal(true);
  };

  const handleUpdate = async (newAmount: string) => {
    if (!newAmount || isNaN(Number(newAmount)) || Number(newAmount) <= 0) {
      showToast('Please enter a valid amount', 'info');
      setShowUpdateModal(false);
      return;
    }
    
    const res = await fetch(`/api/seetu/${id}/placements`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(newAmount) }),
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) {
      showToast('Amount updated successfully', 'success');
      fetchPlacements();
    } else {
      showToast(data.message || 'Failed to update', 'error');
    }
    setShowUpdateModal(false);
  };

  const openDeleteModal = (placementId: string) => {
    setSelectedPlacementId(placementId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/seetu/${id}/placements`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) {
      showToast('Placement removed successfully', 'success');
      fetchPlacements();
    } else {
      showToast(data.message || 'Failed to delete', 'error');
    }
    setShowDeleteModal(false);
  };

  if (!seetu) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-6 text-center">
      <p className="text-xl font-bold text-gray-500 italic">Loading Seetu details...</p>
    </div>
  );

  const now = new Date();
  const isSeetuOpen = now >= new Date(seetu.openingDate) && now < new Date(seetu.closingDate);
  const isSeetuClosed = now >= new Date(seetu.closingDate);
  
  // Check if user has already placed an amount
  const userPlacement = placements.find(p => p.user === user?.username);
  const hasPlaced = !!userPlacement;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-6 py-4">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => router.push('/')} 
            className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-[0.2em] active:opacity-60 transition-all"
          >
            <ArrowLeft size={20} strokeWidth={3} /> Back
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 mt-6">
        {/* Main Info Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-300 mb-6">
          <div className='flex justify-between items-center mb-4'>
            <h1 className="text-2xl font-serif font-bold text-slate-900 leading-tight">{seetu.title}</h1>
            <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${isSeetuOpen ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
              {isSeetuOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          {/* LUXURY COUNTDOWN */}
          {isSeetuOpen && timeLeft && (
            <div className="bg-slate-100 rounded-3xl border border-slate-200 p-5 mb-6 shadow-lg text-white">
              <p className="text-slate-900 text-center font-black text-[9px] uppercase mb-4 tracking-[0.2em]">Remaining Time</p>
              <div className="flex justify-between items-center">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hrs', value: timeLeft.hours },
                  { label: 'Min', value: timeLeft.minutes },
                  { label: 'Sec', value: timeLeft.seconds, animate: true }
                ].map((unit, index, arr) => (
                  <div key={unit.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`text-3xl font-black text-amber-600 tabular-nums ${unit.animate ? 'animate-none' : ''}`}>
                        {String(unit.value).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] font-black text-slate-600 uppercase">
                        {unit.label}
                      </div>
                    </div>
                    {index < arr.length - 1 && (
                      <div className="text-slate-700 font-bold mb-4">:</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date & Amount Details */}
          <div className="space-y-4 border-t border-slate-50">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Opening Date</span>
              <span className="text-slate-900 font-bold text-lg">{new Date(seetu.openingDate).toLocaleDateString()}</span>
            </div>            
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Closing Date</span>
              <span className="text-slate-900 font-bold text-lg">{new Date(seetu.closingDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Entry Limit</span>
              <span className="text-slate-900 font-bold text-lg">
                {seetu.minAmount || 0} - {seetu.maxAmount || 'Any'} <small className="text-xs text-slate-600 font-black">LKR</small>
              </span>
            </div>
          </div>
        </div>

        {/* Placement Input: Only if hasn't placed */}
        {user && isSeetuOpen && !hasPlaced && (
          <div className="bg-slate-100 border border-slate-300 rounded-3xl p-6 shadow-lg text-slate-900 mb-8 animate-in slide-in-from-bottom duration-500">
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
              <Wallet className="text-amber-600" /> Join Group
            </h2>
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-300 focus-within:border-slate-500 transition-all">
                <label className="block text-slate-600 text-xs font-black uppercase tracking-widest mb-2 ml-1">Your Amount (LKR)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-3xl font-black text-black outline-none placeholder:text-slate-900"
                />
              </div>
              <button 
                onClick={handlePlace} 
                disabled={loading}
                className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Finalizing...' : 'Confirm Entry'} <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Participation Status Card: If has placed */}
        {user && isSeetuOpen && hasPlaced && userPlacement && (
          <div className="bg-linear-to-b from-emerald-500/30 to-white border border-slate-300 rounded-3xl p-8 text-slate-900 shadow-xl mb-8 animate-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-100 p-2 rounded-full">
                <CheckCircle2 size={24} strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-serif font-bold">Your Entry</h2>
            </div>
            <div className="bg-slate-100 p-6 rounded-3xl border border-slate-300">
              <p className="text-emerald-900 text-[10px] font-black uppercase tracking-widest mb-1">Your Staked Amount</p>
              <p className="text-4xl font-black">{userPlacement?.amount} <small className="text-sm font-bold opacity-60">LKR</small></p>
            </div>
            <p className="mt-4 text-center text-emerald-800 text-sm font-bold italic">Modify your Entry.</p>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-2 pt-4 border-t border-slate-200">
              <button 
                onClick={() => openUpdateModal(userPlacement.id, userPlacement.amount)}
                className="bg-slate-500/90 text-white border border-slate-600 font-black text-xs uppercase tracking-widest py-3 rounded-2xl active:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <PencilLine size={14} /> Update
              </button>
              <button 
                onClick={() => openDeleteModal(userPlacement.id)}
                className="bg-red-600/90 text-white border border-red-700 font-black text-xs uppercase tracking-widest py-3 rounded-2xl active:bg-rose-50 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        )}

        {/* Placement List Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 ml-2">
            <UserCircle2 size={20} className="text-amber-600" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Current Members</h2>
          </div>

          <div className="space-y-4">
            {placements.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-600 font-bold italic">No entries recorded yet.</p>
              </div>
            ) : (
              placements.map((p) => {
                const isOwn = user?.username === p.user;
                return (
                  <div 
                    key={p.id} 
                    className={`p-4 rounded-3xl flex flex-col gap-5 transition-all shadow-sm border ${
                      isOwn ? 'bg-white border-emerald-500' : 'bg-white border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${isOwn ? 'bg-emerald-700 text-white' : 'bg-slate-400 text-white'}`}>
                          {p.user.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className={`text-lg font-black block leading-none mt-1 ${isOwn ? 'text-slate-900' : 'text-slate-800'}`}>
                            {p.user} {isOwn && <span className="text-emerald-700 text-[10px] ml-1 uppercase">★ You</span>}
                          </span>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Member</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {(isSeetuClosed || isOwn) && p.amount !== undefined ? (
                          <span className="text-2xl font-black text-slate-900 tabular-nums">
                            {p.amount} <small className="text-[10px] font-black text-slate-400 uppercase">LKR</small>
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Lock size={16} />
                            <span className="text-xs font-bold uppercase tracking-tighter">Hidden</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Update Modal */}
      <InputModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSave={handleUpdate}
        title="Update Amount"
        defaultValue={currentAmount}
        label="New Amount (LKR)"
        type="number"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Remove Placement?"
        message="Are you sure you want to remove your placement? You can add a new one later if the seetu is still open."
        confirmText="Yes, Remove It"
        type="danger"
      />
    </div>
  );
}