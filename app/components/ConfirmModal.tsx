import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'info';
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", type = 'danger' }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center px-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-white/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-slate-400 animate-in zoom-in duration-300">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${type === 'danger' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-600'}`}>
          <AlertTriangle size={32} strokeWidth={2.5} />
        </div>
        
        <h3 className="text-2xl font-serif font-bold text-slate-900 text-center mb-2">{title}</h3>
        <p className="text-slate-600 text-center text-sm font-medium mb-8 leading-relaxed">{message}</p>

        <div className="space-y-3">
          <button onClick={onConfirm} className={`w-full py-5 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all ${type === 'danger' ? 'bg-red-700 text-white' : 'bg-slate-900 text-white'}`}>
            {confirmText}
          </button>
          <button onClick={onClose} className="w-full py-4 bg-slate-200 text-slate-900 rounded-2xl font-bold text-lg border-2 border-slate-300 active:bg-slate-200">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}