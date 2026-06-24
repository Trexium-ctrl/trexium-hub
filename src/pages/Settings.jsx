import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Users, Database, UserPlus } from 'lucide-react';

export default function SettingsPage() {
  const [users, setUsers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await base44.entities.User.list();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleInvite() {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteMsg({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      loadUsers();
    } catch (err) {
      setInviteMsg({ type: 'error', text: err.message || 'Failed to send invitation' });
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="Settings" subtitle="App configuration & team" />

      <div className="space-y-4">
        {/* Team */}
        <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-semibold text-[#FFFFFF]">Team Members</h3>
          </div>
          <div className="space-y-2 mb-4">
            {users.length === 0 ? (
              <p className="text-sm text-[#A0A0A0] py-2">No team members found.</p>
            ) : (
              users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-[#050508] border border-[#1E1E26]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-gradient-to-br from-[#00F0FF] to-[#00C8D6]' : 'bg-[#161620]'}`}>
                      <span className={`text-xs font-bold ${u.role === 'admin' ? 'text-white' : 'text-[#A0A0A0]'}`}>
                        {(u.full_name || u.email || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#FFFFFF]">{u.full_name || u.email}</p>
                      {u.full_name && u.email && <p className="text-xs text-[#A0A0A0]">{u.email}</p>}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded capitalize ${u.role === 'admin' ? 'text-[#00F0FF] bg-[#00F0FF]/10' : 'text-[#A0A0A0] bg-[#161620]'}`}>
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
          {/* Invite form */}
          <div className="border-t border-[#1E1E26] pt-4">
            <p className="text-xs text-[#A0A0A0] mb-2 font-medium">Invite a new team member</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                type="email"
                className="bg-[#050508] border-[#1E1E26] text-[#FFFFFF] placeholder:text-[#3A3A45]"
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-full sm:w-32 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0D0D12] border-[#1E1E26]">
                  <SelectItem value="user" className="text-[#FFFFFF] focus:bg-[#161620]">User</SelectItem>
                  <SelectItem value="admin" className="text-[#FFFFFF] focus:bg-[#161620]">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail} className="bg-[#00F0FF] hover:bg-[#00C8D6] text-white">
                <UserPlus className="w-4 h-4 mr-1.5" />
                {inviting ? 'Sending...' : 'Invite'}
              </Button>
            </div>
            {inviteMsg && (
              <p className={`text-xs mt-2 ${inviteMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{inviteMsg.text}</p>
            )}
          </div>
        </div>

        {/* Database */}
        <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-semibold text-[#FFFFFF]">Data Overview</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {['Leads', 'Customers', 'Projects', 'Payments', 'Tasks', 'Events', 'Files', 'Questionnaires'].map(item => (
              <div key={item} className="p-3 rounded-lg bg-[#050508] border border-[#1E1E26]">
                <p className="text-xs text-[#A0A0A0]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <SettingsIcon className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-semibold text-[#FFFFFF]">About</h3>
          </div>
          <p className="text-sm text-[#A0A0A0]">
            Trexium Hub — your private internal business dashboard for managing leads, customers, projects, payments, and team tasks.
          </p>
        </div>
      </div>
    </div>
  );
}