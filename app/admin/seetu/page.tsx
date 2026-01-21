'use client';

import { useState, useEffect } from 'react';
import SeetuCard from './components/SeetuCard';
import FilterBar from './components/FilterBar';
import CreateSeetuForm from './components/CreateSeetuForm';
import ConfirmModal from '../../components/ConfirmModal';
import { useRouter } from 'next/navigation';
import { Plus, X, ListFilter, LayoutDashboard, ArrowLeft } from 'lucide-react';

interface Seetu {
  id: string;
  title: string;
  openingDate: string;
  closingDate: string;
  minAmount?: number;
  maxAmount?: number;
  createdBy: string;
  status: 'upcoming' | 'open' | 'closed' | 'archived';
}

export default function AdminSeetuPage() {
  const [seetus, setSeetus] = useState<Seetu[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'open' | 'closed' | 'archived'>('all');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const router = useRouter();

  const fetchSeetus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seetu?status=${filter === 'all' ? '' : filter}`);
      const data = await res.json();
      if (data.success) setSeetus(data.seetus);
    } catch (err) {
      console.error('Fetch seetus failed:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSeetus();
  }, [filter]);

  const handleToggleForm = () => {
    if (showCreateForm) {
      // Instead of just closing, we ask for confirmation if they are in the middle of it
      setShowCancelConfirm(true);
    } else {
      setShowCreateForm(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-xl text-slate-900 shadow-xl rounded-b-4xl">
        <div className="max-w-xl mx-auto px-6 py-4">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 active:text-amber-400"
          >
            <ArrowLeft size={16} /> Exit Admin
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">Management</h1>
              <p className="text-amber-600 text-xs font-black uppercase tracking-[0.2em]">System Controller</p>
            </div>
            <button 
              onClick={handleToggleForm}
              className={`p-4 rounded-2xl transition-all shadow-lg flex items-center gap-2 font-bold ${
                showCreateForm ? 'bg-red-700 text-white' : 'bg-slate-800 text-white'
              }`}
            >
              {showCreateForm ? <X size={20} /> : <Plus size={20} />}
              <span>{showCreateForm ? 'Cancel' : 'Create'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-8">
        {showCreateForm && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <CreateSeetuForm onCreated={() => { setShowCreateForm(false); fetchSeetus(); }} />
          </div>
        )}

        {/* Filter Selection */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 ml-1">
            <ListFilter size={18} className="text-slate-400" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Filter by Status</h3>
          </div>
          <FilterBar currentFilter={filter} onChange={setFilter} />
        </div>

        {/* Content List */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-serif italic text-xl animate-pulse">
              Retrieving Seetu records...
            </div>
          ) : seetus.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <LayoutDashboard size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-900 font-bold text-lg">No groups found</p>
              <p className="text-slate-500 text-sm italic">Try changing your filter above</p>
            </div>
          ) : (
            seetus.map((s) => (
              <SeetuCard key={s.id} seetu={s} onUpdate={fetchSeetus} />
            ))
          )}
        </div>
      </main>

      {/* REUSABLE MODAL REPLACING BROWSER CONFIRM */}
      <ConfirmModal 
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false);
          setShowCreateForm(false);
        }}
        title="Discard Seetu?"
        message="If you close this form now, any information you entered for the new Seetu will be lost."
        confirmText="Yes, Discard"
        type="danger"
      />
    </div>
  );
}
