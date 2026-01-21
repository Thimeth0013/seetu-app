'use client';

import { LayoutGrid, CalendarClock, DoorOpen, Lock, Archive } from 'lucide-react';

interface FilterBarProps {
  currentFilter: 'all' | 'upcoming' | 'open' | 'closed' | 'archived';
  onChange: (filter: FilterBarProps['currentFilter']) => void;
}

export default function FilterBar({ currentFilter, onChange }: FilterBarProps) {
  const filters: { id: FilterBarProps['currentFilter']; label: string; icon: any }[] = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarClock },
    { id: 'open', label: 'Open', icon: DoorOpen },
    { id: 'closed', label: 'Closed', icon: Lock },
    { id: 'archived', label: 'Archived', icon: Archive },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-2">
      <div className="flex gap-3 px-1 min-w-max">
        {filters.map((f) => {
          const isActive = currentFilter === f.id;
          const Icon = f.icon;

          return (
            <button
              key={f.id}
              onClick={() => onChange(f.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-3xl font-bold text-sm transition-all duration-300 border-2
                ${isActive 
                  ? 'bg-slate-800 border-slate-900/80 text-white'
                  : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
                }
                active:scale-95
              `}
            >
              <Icon 
                size={18} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={isActive ? 'text-amber-400' : 'text-slate-400'} 
              />
              <span className="tracking-wide uppercase text-[11px] font-black">
                {f.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}