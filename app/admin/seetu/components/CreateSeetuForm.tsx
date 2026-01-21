'use client';

import { useState } from 'react';
import { 
  PlusCircle, 
  AlertCircle, 
  ArrowRight,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal'; // Ensure path is correct

interface Props {
  onCreated: () => void;
}

export default function CreateSeetuForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [openingDate, setOpeningDate] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxAmount, setMaxAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New state to trigger the Confirmation UI
  const [showConfirm, setShowConfirm] = useState(false);

  // 1. Initial validation before showing modal
  const handlePreCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !openingDate || !closingDate) {
      setError('Please provide a title and both dates.');
      return;
    }
    setError('');
    setShowConfirm(true); // Open the Luxury Modal instead of browser popup
  };

  // 2. The actual API call after user confirms
  const handleFinalCreate = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/seetu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, openingDate, closingDate,
          minAmount: minAmount || undefined,
          maxAmount: maxAmount || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onCreated();
      } else {
        setError(data.message || 'The system could not create this group.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-300 rounded-[2.5rem] p-8 shadow-2xl relative">
      
      <div className="flex items-center gap-3 mb-8 mt-2">
        <PlusCircle className="text-slate-900" size={28} />
        <h3 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
          New Seetu
        </h3>
      </div>

      <form onSubmit={handlePreCreate} className="space-y-6">
        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in shake">
            <AlertCircle className="text-rose-600" size={24} />
            <p className="text-rose-800 font-bold text-sm leading-tight">{error}</p>
          </div>
        )}

        {/* --- Inputs (Title, Dates, Amounts) --- */}
        <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Group Title</label>
          <input 
            placeholder="e.g. Savings Group A" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full bg-transparent text-xl font-bold text-slate-900 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
            <label className="block text-[11px] font-black text-emerald-600 uppercase mb-2 ml-1">Opening Date</label>
            <input type="date" value={openingDate} onChange={(e) => setOpeningDate(e.target.value)} className="w-full bg-transparent font-bold text-slate-900 outline-none" />
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
            <label className="block text-[11px] font-black text-rose-600 uppercase mb-2 ml-1">Closing Date</label>
            <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className="w-full bg-transparent font-bold text-slate-900 outline-none" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50/50 p-5 rounded-2xl border-2 border-blue-100 flex items-center gap-3">

              <div className="flex-1">
                <span className="block text-[11px] font-black text-slate-800 uppercase mb-2 ml-1">Minimum</span>
                <input 
                  type="number" 
                  value={minAmount} 
                  onChange={(e) => setMinAmount(Number(e.target.value) || '')} 
                  placeholder="0"
                  className="bg-transparent text-xl font-black text-slate-900 w-full outline-none"
                />
              </div>
              <div className=" text-blue-600">
                <ArrowDownWideNarrow size={20} />
              </div>
            </div>
            <div className="bg-blue-50/50 p-5 rounded-2xl border-2 border-blue-100 flex items-center gap-3">
              <div className="flex-1">
                <span className="block text-[11px] font-black text-slate-800 uppercase mb-2 ml-1">Maximum</span>
                <input 
                  type="number" 
                  value={maxAmount} 
                  onChange={(e) => setMaxAmount(Number(e.target.value) || '')} 
                  placeholder="Any"
                  className="bg-transparent text-xl font-black text-slate-900 w-full outline-none"
                />
              </div>
              <div className="text-blue-600">
                <ArrowUpWideNarrow size={20} />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-6 rounded-4xl font-black text-xl shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          {loading ? 'Creating...' : 'Create Seetu'}
          <ArrowRight size={22} className="text-amber-400" strokeWidth={3} />
        </button>
      </form>

      {/* LUXURY CONFIRMATION MODAL */}
      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalCreate}
        title="Create New Seetu?"
        message={`Are you sure you want to create "${title}"? Please double check the opening and closing dates before confirming.`}
        confirmText="Yes, Create Now"
        type="info" // Blue/Slate theme instead of Red danger theme
      />
    </div>
  );
}