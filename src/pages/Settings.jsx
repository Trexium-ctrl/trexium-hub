import React from 'react';
import { PageHeader } from '@/components/shared';
import { Settings, Users, Database, Rocket } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="Settings" subtitle="App configuration & team" />

      <div className="space-y-4">
        {/* Team */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="text-sm font-semibold text-[#E6EDF3]">Team</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6E56CF] flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#E6EDF3]">Owner</p>
                  <p className="text-xs text-[#8B949E]">Full access</p>
                </div>
              </div>
              <span className="text-[10px] text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-1 rounded">Owner</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#21262D] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#8B949E]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#E6EDF3]">Partner</p>
                  <p className="text-xs text-[#8B949E]">Full access</p>
                </div>
              </div>
              <span className="text-[10px] text-[#8B949E] bg-[#21262D] px-2 py-1 rounded">Partner</span>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="text-sm font-semibold text-[#E6EDF3]">Data Overview</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {['Leads', 'Customers', 'Projects', 'Payments', 'Tasks', 'Events', 'Files', 'Questionnaires'].map(item => (
              <div key={item} className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                <p className="text-xs text-[#8B949E]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="text-sm font-semibold text-[#E6EDF3]">About</h3>
          </div>
          <p className="text-sm text-[#8B949E]">Trexium Command Center — your private internal business dashboard for managing leads, customers, projects, payments, and team tasks.</p>
        </div>
      </div>
    </div>
  );
}