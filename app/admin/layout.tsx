'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Groups', href: '/admin/seetu', icon: LayoutDashboard },
    { name: 'Members', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24">

      <main className="max-w-xl mx-auto">{children}</main>

      {/* Persistent Bottom Admin Nav - Essential for Mobile 50+ Users */}
      <nav className="fixed bottom-0 rounded-t-3xl left-0 right-0 bg-slate-900 border-t border-slate-400 px-6 py-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
        <div className="max-w-xl mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}