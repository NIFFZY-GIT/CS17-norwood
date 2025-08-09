'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { SessionData } from '@/lib/session';
import UserListItem from '@/components/dashboard/settings/UserListItem';
import CreateUserModal from '@/components/dashboard/settings/CreateUserModal';
import { PlusCircle, Loader2, ShieldAlert, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const fetchClientSession = async () => {
        try {
            const res = await fetch('/api/auth/session');
            if (res.ok) {
                const data = await res.json();
                setCurrentSession(data);
            }
        } catch (err) {
            console.error("Failed to fetch client session:", err);
        }
    };

    const fetchAdmins = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const allUsers: User[] = await res.json();
            // Filter for admin users using both role and isAdmin for backward compatibility
            const adminUsers = allUsers.filter(user => 
                user.role === 'admin' || user.isAdmin === true
            );
            setAdmins(adminUsers);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred while fetching users.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    Promise.all([fetchClientSession(), fetchAdmins()]);
  }, []);

  const handleAdminCreated = (newAdmin: User) => {
    // Check if new user is admin using both fields for compatibility
    if (newAdmin.role === 'admin' || newAdmin.isAdmin === true) {
      setAdmins(prevAdmins => [newAdmin, ...prevAdmins]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteAdmin = async (adminId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/users/${adminId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete admin');
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin._id !== adminId));
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred while deleting the user.");
        }
    }
  };
  
  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div className="flex items-center">
          <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 mr-2 sm:mr-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Admin Management</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center transition-colors self-start sm:self-center"
        >
          <PlusCircle size={20} className="mr-1 sm:mr-2" />
           <span className="hidden sm:inline">Add New Admin</span>
           <span className="sm:hidden text-sm">Add Admin</span>
        </button>
      </header>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-sky-500" size={48} />
        </div>
      )}

      {error && (
           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600 rounded-md mb-6" role="alert">
              <div className="flex">
                  <div className="py-1"><ShieldAlert className="h-6 w-6 text-red-500 dark:text-red-400 mr-3" /></div>
                  <div>
                      <p className="font-bold">An Error Occurred</p>
                      <p className="text-sm">{error}</p>
                  </div>
              </div>
          </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-3">
          {admins.length > 0 ? (
            admins.map((admin) => (
              <UserListItem
                key={admin._id}
                user={admin}
                currentUserId={currentSession?.userId}
                onDelete={handleDeleteAdmin}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <Shield size={64} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No admins found.</h2>
              {/* FIX 1: Escaped the double quotes to resolve the ESLint error. */}
              <p className="text-slate-500 dark:text-slate-400">Click &quot;Add New Admin&quot; to create one.</p>
            </div>
          )}
        </div>
      )}

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={handleAdminCreated}
      />
    </>
  );
}