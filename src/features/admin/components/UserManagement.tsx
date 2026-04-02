import React from 'react';
import { 
  Shield, 
  ShieldOff, 
  UserPlus, 
  UserMinus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  MoreVertical 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types/admin';

interface UserManagementProps {
  profiles: Profile[];
  searchQuery: string;
  toggleUserStatus: (id: string, isBlocked: boolean) => void;
  changeUserRole: (id: string, newRole: string) => void;
  deleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ 
  profiles, 
  searchQuery, 
  toggleUserStatus, 
  changeUserRole, 
  deleteUser 
}) => {
  const filteredProfiles = profiles.filter(p => 
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.wedding_name && p.wedding_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card className="rounded-none border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden dark:bg-zinc-900 transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-zinc-800/50 border-b border-stone-200 dark:border-zinc-800">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-zinc-400">User</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-zinc-400">Role</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-zinc-400">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-zinc-400">Joined</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
            {filteredProfiles.map((profile) => (
              <tr key={profile.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-zinc-800 flex items-center justify-center text-stone-500 dark:text-zinc-400 font-bold text-xs">
                      {profile.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold dark:text-white">{profile.wedding_name || 'Anonymous User'}</div>
                      <div className="text-[10px] text-stone-400 dark:text-zinc-500 font-mono">{profile.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={profile.role === 'super_admin' ? 'default' : 'secondary'} className="rounded-none uppercase text-[9px] tracking-widest">
                    {profile.role === 'super_admin' ? 'Admin' : 'Couple'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {!profile.is_blocked ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${!profile.is_blocked ? 'text-green-600' : 'text-red-600'}`}>
                      {!profile.is_blocked ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[10px] font-mono text-stone-500 dark:text-zinc-500">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="dark:text-zinc-400 dark:hover:text-white" />}>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none w-48 dark:bg-zinc-900 dark:border-zinc-800">
                      <DropdownMenuItem onClick={() => toggleUserStatus(profile.id, profile.is_blocked)}>
                        {!profile.is_blocked ? <ShieldOff className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                        {!profile.is_blocked ? 'Block Access' : 'Unblock Access'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => changeUserRole(profile.id, profile.role === 'super_admin' ? 'couple' : 'super_admin')}>
                        {profile.role === 'super_admin' ? <UserMinus className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {profile.role === 'super_admin' ? 'Make Couple' : 'Make Admin'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteUser(profile.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
