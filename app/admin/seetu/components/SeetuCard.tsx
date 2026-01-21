'use client';

import { useState } from 'react';
import { Edit3, Archive, X, Save } from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

interface Seetu {
  id: string;
  title: string;
  openingDate: string;
  closingDate: string;
  minAmount?: number;
  maxAmount?: number;
  status: 'upcoming' | 'open' | 'closed' | 'archived';
}

interface Props {
  seetu: Seetu;
  onUpdate: () => void;
}

export default function SeetuCard({ seetu, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(seetu.title);
  const [openingDate, setOpeningDate] = useState(seetu.openingDate.split('T')[0]);
  const [closingDate, setClosingDate] = useState(seetu.closingDate.split('T')[0]);
  const [minAmount, setMinAmount] = useState(seetu.minAmount || 0);
  const [maxAmount, setMaxAmount] = useState(seetu.maxAmount || 0);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/admin/seetu/${seetu.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, minAmount, maxAmount }),
      });
      const data = await res.json();
      if (data.success) onUpdate();
      setShowEditDrawer(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async () => {
    try {
      const res = await fetch(`/api/admin/seetu/${seetu.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      });
      const data = await res.json();
      if (data.success) onUpdate();
      setShowArchiveConfirm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
    open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-500 border-slate-200',
    archived: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white border border-slate-300 rounded-4xl p-4 shadow-sm mb-4">
      {/* Header Area */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 leading-tight ml-1">{seetu.title}</h3>

        </div>
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColors[seetu.status]}`}>
            {seetu.status}
          </span>
      </div>

      {/* Data Section */}
      <div className="grid grid-cols-2 gap-4 py-5 mb-2 ml-1">
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Schedule</p>
          <p className="text-sm font-bold text-slate-700">
            {new Date(seetu.openingDate).toLocaleDateString()} - {new Date(seetu.closingDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Limits (LKR)</p>
          <p className="text-sm font-bold text-slate-700">
            {seetu.minAmount || 0} - {seetu.maxAmount || '∞'}
          </p>
        </div>
      </div>

      {/* Admin Actions */}
      {seetu.status === 'upcoming' && (
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setShowEditDrawer(true)}
            className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm active:bg-slate-200 border border-slate-300"
          >
            <Edit3 size={18} /> Edit
          </button>
          <button 
            onClick={() => setShowArchiveConfirm(true)}
            className="flex items-center justify-center gap-2 py-4 border border-red-300 text-red-600 rounded-2xl font-bold text-sm active:bg-red-50"
          >
            <Archive size={18} /> Delete
          </button>
        </div>
      )}

      {/* FULL EDIT DRAWER */}
      {showEditDrawer && (
        <div className="fixed inset-0 z-100 flex items-end justify-center overflow-hidden">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-xs" onClick={() => setShowEditDrawer(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-t-[3rem] shadow-2xl flex flex-col max-h-[95vh] border-t-4 border-amber-300 animate-in slide-in-from-bottom duration-500">
            
            <div className="px-8 pt-8 pb-4 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-slate-900">Edit Seetu Details</h2>
              <button onClick={() => setShowEditDrawer(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-6">
              {/* Title Input */}
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Group Name</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent text-xl font-bold text-slate-900 outline-none" />
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Starts</label>
                  <input type="date" value={openingDate} onChange={(e) => setOpeningDate(e.target.value)} className="w-full bg-transparent font-bold text-slate-900 outline-none" />
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Ends</label>
                  <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className="w-full bg-transparent font-bold text-slate-900 outline-none" />
                </div>
              </div>

              {/* Amount Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Min Amount</label>
                  <input type="number" value={minAmount} onChange={(e) => setMinAmount(Number(e.target.value))} className="w-full bg-transparent font-bold text-slate-900 outline-none" />
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Max Amount</label>
                  <input type="number" value={maxAmount} onChange={(e) => setMaxAmount(Number(e.target.value))} className="w-full bg-transparent font-bold text-slate-900 outline-none" />
                </div>
              </div>

              <button onClick={handleUpdate} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]">
                <Save size={20} className="text-amber-400" /> Save All Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UI Modals replacing browser popups */}
      <ConfirmModal 
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        onConfirm={handleArchive}
        title="Archive Group?"
        message="This will hide the group from members. It can be restored later from the archive."
        confirmText="Yes, Archive"
      />
    </div>
  );
}
