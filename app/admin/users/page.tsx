'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  KeyRound, 
  User as UserIcon, 
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import InputModal from '../../components/InputModal';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  
  // Modal States
  const [confirmAdmin, setConfirmAdmin] = useState<{id: string, name: string} | null>(null);
  const [resetPass, setResetPass] = useState<{id: string, name: string} | null>(null);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      setMessage({ text: 'Could not load users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleMakeAdmin = async () => {
    if (!confirmAdmin) return;
    const { id, name } = confirmAdmin;
    setConfirmAdmin(null);
    
    try {
      const res = await fetch('/api/admin/set-admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, isAdmin: true }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `${name} is now an Admin`, type: 'success' });
        fetchUsers();
      }
    } catch (error) {
      setMessage({ text: 'Error updating role', type: 'error' });
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!resetPass) return;
    const { id, name } = resetPass;
    setResetPass(null);

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `Password changed for ${name}`, type: 'success' });
      }
    } catch (err) {
      setMessage({ text: 'Error resetting password', type: 'error' });
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 ">
       <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-xl text-slate-900 shadow-xl rounded-b-4xl">
        <div className="max-w-xl mx-auto px-6 pb-1 pt-4">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 active:text-amber-400"
          >
            <ArrowLeft size={16} /> Exit Admin
          </button>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Users size={32} className="text-amber-600" /> Member List
          </h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-8">
      
      {/* Search Header */}
      <div className="mb-8">        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900" size={20} />
          <input 
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-400 rounded-3xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:outline-none focus:border-slate-800 shadow-sm"
          />
        </div>
      </div>

      {/* Status Message - Fixed Floating Toast */}
      {message && (
        <div className="fixed bottom-24 left-6 right-6 z-250 animate-in slide-in-from-bottom-4 duration-300">
          <div className={`p-5 rounded-4xl border-2 shadow-2xl flex items-center gap-4 backdrop-blur-md ${
            message.type === 'success' 
              ? 'bg-emerald-800 border-emerald-500 text-white' 
              : 'bg-red-600/95 border-red-500 text-white'
          }`}>
            <div className="bg-white/20 p-2 rounded-full">
              {message.type === 'success' 
                ? <CheckCircle2 size={24} strokeWidth={3} /> 
                : <AlertCircle size={24} strokeWidth={3} />
              }
            </div>
            <div className="flex-1">
              <p className="font-black text-sm uppercase tracking-tight leading-none">
                {message.type === 'success' ? 'Success' : 'Attention'}
              </p>
              <p className="font-bold text-lg leading-tight">
                {message.text}
              </p>
            </div>
            <button 
              onClick={() => setMessage(null)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* User Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold italic animate-pulse">Searching records...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-bold">No members found</p>
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} className="bg-white border-2 border-slate-100 p-5 rounded-4xl shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${u.isAdmin ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-slate-500'}`}>
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900 leading-tight">{u.username}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${u.isAdmin ? 'text-amber-600' : 'text-slate-400'}`}>
                      {u.isAdmin ? 'System Admin' : 'Regular Member'}
                    </p>
                  </div>
                </div>
                {u.isAdmin && <ShieldCheck className="text-amber-500" size={24} />}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {!u.isAdmin && (
                  <button 
                    onClick={() => setConfirmAdmin({id: u.id, name: u.username})}
                    className="py-4 bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest active:bg-slate-200"
                  >
                    Make Admin
                  </button>
                )}
                <button 
                  onClick={() => setResetPass({id: u.id, name: u.username})}
                  className={`py-4 rounded-2xl font-black text-xs uppercase tracking-tighter flex items-center justify-center gap-2 active:scale-95 transition-all ${
                    u.isAdmin ? 'col-span-2 bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-900 border-2 border-slate-600'
                  }`}
                >
                  <KeyRound size={16} /> Reset Password
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </main>

      {/* UI Modals */}
      <ConfirmModal 
        isOpen={!!confirmAdmin}
        onClose={() => setConfirmAdmin(null)}
        onConfirm={handleMakeAdmin}
        title="Promote to Admin?"
        message={`Are you sure you want to give Admin rights to ${confirmAdmin?.name}?`}
        confirmText="Yes, Promote"
        type="info"
      />

      <InputModal 
        isOpen={!!resetPass}
        onClose={() => setResetPass(null)}
        onSave={handleResetPassword}
        title="Reset Password"
        label={`Enter new password for ${resetPass?.name}`}
        defaultValue=""
        type="text"
      />
    </div>
  );
}