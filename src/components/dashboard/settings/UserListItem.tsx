// src/components/dashboard/settings/UserListItem.tsx
'use client';
import { User } from '@/lib/types';
import { Trash2, Shield, User as UserIcon, CalendarDays, Mail } from 'lucide-react';

interface UserListItemProps {
  user: User; // This user object itself can contain 'isAdmin'
  currentUserId?: string; // ID of the currently logged-in user
  onDelete: (userId: string, username: string) => void;
  // isCurrentUserAdmin prop is removed
}

export default function UserListItem({ user, currentUserId, onDelete }: UserListItemProps) {
  // Logic to determine if the delete button should be shown.
  // Any logged-in user can delete other users.
  // Optionally, prevent a user from deleting their own account via this UI.
  const canDeleteThisUser = user._id !== currentUserId;

  return (
    <li className="py-4 px-2 sm:px-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-700 p-2 rounded-full">
          {/* Display admin shield if the *listed user* has isAdmin true */}
          {user.isAdmin ? <Shield className="h-5 w-5 text-sky-600 dark:text-sky-400" /> : <UserIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {user.username} {user._id === currentUserId && "(You)"}
          </p>
          {user.email && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center">
              <Mail size={12} className="mr-1 flex-shrink-0" /> {user.email}
            </p>
          )}
           <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center mt-0.5">
              <CalendarDays size={12} className="mr-1 flex-shrink-0" /> Joined: {new Date(user.createdAt).toLocaleDateString()}
            </p>
        </div>
        {/* Delete button shown based on canDeleteThisUser logic */}
        {canDeleteThisUser && (
          <button
            onClick={() => onDelete(user._id, user.username)}
            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            title={`Delete user ${user.username}`}
          >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
         {!canDeleteThisUser && user._id === currentUserId && (
            <span className="text-xs text-slate-400 dark:text-slate-500 p-2">(Your Account)</span>
        )}
      </div>
    </li>
  );
}