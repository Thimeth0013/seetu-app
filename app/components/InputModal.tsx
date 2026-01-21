import { useState } from 'react';
import { Edit3, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  defaultValue: string;
  label: string;
  type?: 'text' | 'number';
}

export default function InputModal({ isOpen, onClose, onSave, title, defaultValue, label, type = 'text' }: Props) {
  const [val, setVal] = useState(defaultValue); // Local state for the input

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center px-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-slate-100 rounded-3xl p-6 shadow-2xl border border-slate-500 animate-in zoom-in duration-300">
        <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Edit3 size={24} className="text-amber-600" /> {title}
        </h3>
        
        <div className="bg-white p-4 rounded-3xl border border-slate-300 mb-8">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
          <input 
            type={type}
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full bg-transparent text-3xl font-black text-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-bold border-2 border-slate-300">
            Cancel
          </button>
          <button onClick={() => onSave(val)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}