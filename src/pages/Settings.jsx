import React from 'react';
import { PageHeader } from '@/components/shared';
import { Settings, Users, Database, Rocket } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="Settings" subtitle="App configuration & team" />

      <div className="space-y-4">
        {/* Team */}
        <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-semibold text-[#FFFFFF]">Team</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#050508] border border-[#1E1E26]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#00C8D6] flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#FFFFFF]">Owner</p>
                  <p className="text-xs text-[#A0A0A0]">Full access</p>
                </div>
              </div>
              <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-1 rounded">Owner</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#050508] border border-[#1E1E26]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#161620] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#A0A0A0]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#FFFFFF]">Partner</p>
                  <p className="text-xs text-[#A0A0A0]">Full access</p>
                </div>
              </div>
              <span className="text-[10px] text-[#A0A0A0] bg-[#161620] px-2 py-1 rounded">Partner</span>
            </div>
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
            <Settings className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-semibold text-[#FFFFFF]">About</h3>
          </div>
          <p className="text-sm text-[#A0A0A0]">Trexium Command Center — your private internal business dashboard for managing leads, customers, projects, payments, and team tasks.</p>
        </div>
      </div>
    </div>
  );
}