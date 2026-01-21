'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ isMenuItem = false }) {
  const { setUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    router.push('/login');
  };

  if (isMenuItem) {
    return (
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-4 px-4 py-4 text-red-500 font-bold hover:bg-red-50 rounded-xl active:bg-red-100 transition-colors"
      >
        <LogOut className="w-6 h-6" />
        <span className="text-lg">Logout</span>
      </button>
    );
  }

  return (
    <button onClick={handleLogout} className="...">Logout</button>
  );
}