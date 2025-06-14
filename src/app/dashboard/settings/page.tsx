'use client';

import { useState, useEffect } from 'react';
// FIX 1: The unused 'getSession' import is removed.
import { User, UserSession } from '@/lib/types';
import UserListItem from '@/components/dashboard/settings/UserListItem';
import CreateUserModal from '@/components/dashboard/settings/CreateUserModal';
import { PlusCircle, Users, Loader2, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);

  useEffect(() => {
    // A simple function to get session data on the client if needed
    const fetchClientSession = async () => {
        try {
            const res = await fetch('/api/auth/session'); // Assuming you have such an endpoint
            if (res.ok) {
                const data = await res.json();
                setCurrentSession(data);
            }
        } catch (err) {
            console.error("Failed to fetch client session:", err);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        // FIX 2: Change 'any' to 'unknown' and perform a type check.
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
    
    // Using Promise.all to run both fetches concurrently
    Promise.all([fetchClientSession(), fetchUsers()]);

  }, []);


  const handleUserCreated = (newUser: User) => {
    setUsers(prevUsers => [newUser, ...prevUsers]);
    setIsModalOpen(false);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
    // FIX 3: Change 'any' to 'unknown' and perform a type check.
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
          <Users className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 mr-2 sm:mr-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">User Management</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center transition-colors self-start sm:self-center"
        >
          <PlusCircle size={20} className="mr-1 sm:mr-2" />
           <span className="hidden sm:inline">Add New User</span>
           <span className="sm:hidden text-sm">Add User</span>
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
          {users.length > 0 ? (
            users.map((user) => (
              <UserListItem
                key={user._id}
                user={user}
                currentUserId={currentSession?.userId}
                onDelete={handleDeleteUser}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <Users size={64} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No users found.</h2>
            </div>
          )}
        </div>
      )}

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </>
  );
}