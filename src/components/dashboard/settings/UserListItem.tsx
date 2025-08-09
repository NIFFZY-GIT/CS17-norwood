// src/components/dashboard/settings/UserListItem.tsx
'use client';
import { User } from '@/lib/types';
import { Trash2, Shield, User as UserIcon, CalendarDays, Mail, ShieldCheck, UserCheck } from 'lucide-react';

interface UserListItemProps {
  user: User;
  currentUserId?: string;
  onDelete: (userId: string, username: string) => void;
  onRoleUpdate?: (userId: string, newRole: 'admin' | 'user') => void;
}

export default function UserListItem({ user, currentUserId, onDelete, onRoleUpdate }: UserListItemProps) {
  const canDeleteThisUser = user._id !== currentUserId;
  const isCurrentUser = user._id === currentUserId;
  const isAdmin = user.role === 'admin' || user.isAdmin === true;

  const handleRoleToggle = () => {
    if (onRoleUpdate && !isCurrentUser) {
      const newRole = isAdmin ? 'user' : 'admin';
      onRoleUpdate(user._id, newRole);
    }
  };

  return (
    <li className="py-4 px-2 sm:px-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-700 p-2 rounded-full">
          {isAdmin ? (
            <Shield className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          ) : (
            <UserIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user.username || user.email} {isCurrentUser && "(You)"}
            </p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isAdmin 
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {isAdmin ? 'Admin' : 'User'}
            </span>
          </div>
          {user.email && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center">
              <Mail size={12} className="mr-1 flex-shrink-0" /> {user.email}
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center mt-0.5">
            <CalendarDays size={12} className="mr-1 flex-shrink-0" /> Joined: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Role toggle button */}
          {onRoleUpdate && !isCurrentUser && (
            <button
              onClick={handleRoleToggle}
              className={`inline-flex items-center p-2 border border-transparent rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isAdmin
                  ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-700/50 focus:ring-amber-500'
                  : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-700/50 focus:ring-green-500'
              }`}
              title={isAdmin ? 'Demote to User' : 'Promote to Admin'}
            >
              {isAdmin ? (
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          )}

          {/* Delete button */}
          {canDeleteThisUser && (
            <button
              onClick={() => onDelete(user._id, user.username || user.email)}
              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              title={`Delete user ${user.username || user.email}`}
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
          
          {isCurrentUser && (
            <span className="text-xs text-slate-400 dark:text-slate-500 p-2">(Your Account)</span>
          )}
        </div>
      </div>
    </li>
  );
}