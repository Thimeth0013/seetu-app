'use client';

import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const configs = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-600/80',
      borderColor: 'border-emerald-700',
      iconColor: 'text-emerald-100'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-600/80',
      borderColor: 'border-red-700',
      iconColor: 'text-red-100'
    },
    info: {
      icon: Info,
      bgColor: 'bg-amber-500/80',
      borderColor: 'border-amber-700',
      iconColor: 'text-white'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-300 animate-in slide-in-from-top duration-300">
      <div className={`${config.bgColor} ${config.borderColor} border backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md`}>
        <Icon size={24} className={config.iconColor} strokeWidth={2.5} />
        <p className="text-white font-bold text-sm flex-1">{message}</p>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}