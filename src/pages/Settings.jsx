import React from 'react';
import { PageHeader } from '@/components/shared';
import { Settings as SettingsIcon, Database, KeyRound, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="Settings" subtitle="App configuration & account" />

      <div className="space-y-4">
        {/* Account */}
        <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-semibold text-[#FFFFFF]">Your Account</h3>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#050508] border border-[#1E1E26]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#00C8D6] flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {(user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#FFFFFF]">{user?.email || 'Unknown'}</p>
              <p className="text-xs text-[#A0A0A0]">Signed in</p>
            </div>
          </div>
        </div>

        {/* Managing Users */}
        <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-semibold text-[#FFFFFF]">Managing Users</h3>
          </div>
          <p className="text-sm text-[#A0A0A0] mb-3">
            Users are managed in your Supabase dashboard under Authentication → Users. Only users created there can sign in to Trexium Hub.
          </p>
          <a
            href="https://supabase.com/dashboard/project/mlmnqkgolophpgnogeeb/auth/users"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#00F0FF] hover:underline"
          >
            Open Supabase Auth <ExternalLink className="w-3 h-3" />
          </a>
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
            Trexium Hub — your private internal business dashboard for managing leads, customers, projects, payments, and team tasks. Powered by Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}