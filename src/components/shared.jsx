import React from 'react';
import { useUsers } from '@/hooks/useUsers';
import { format } from 'date-fns';

export function StatusBadge({ status }) {
  const colorMap = {
    'Not contacted': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'Contacted': 'bg-slate-500/15 text-slate-300 border-slate-500/20',
    'Follow-up needed': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Meeting booked': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    'Questionnaire sent': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    'Proposal sent': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    'Won': 'bg-green-500/15 text-green-400 border-green-500/20',
    'Lost': 'bg-red-500/15 text-red-400 border-red-500/20',
    'Not interested': 'bg-red-500/15 text-red-400 border-red-500/20',
    'Active': 'bg-green-500/15 text-green-400 border-green-500/20',
    'Website in progress': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'Waiting on customer': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Launched': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    'Past due': 'bg-red-500/15 text-red-400 border-red-500/20',
    'Paused': 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    'Canceled': 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    'Paid': 'bg-green-500/15 text-green-400 border-green-500/20',
    'Due soon': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Overdue': 'bg-red-500/15 text-red-400 border-red-500/20',
    'To do': 'bg-slate-500/15 text-slate-300 border-slate-500/20',
    'In progress': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'Done': 'bg-green-500/15 text-green-400 border-green-500/20',
    'Not started': 'bg-slate-500/15 text-slate-300 border-slate-500/20',
    'Waiting on questionnaire': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Planning': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    'Design started': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    'Development started': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'Waiting on content': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Waiting on customer review': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Revisions': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'Ready to launch': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    'Maintenance': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    'Blank template': 'bg-slate-500/15 text-slate-300 border-slate-500/20',
    'Sent to customer': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    'Completed': 'bg-green-500/15 text-green-400 border-green-500/20',
    'Needs clarification': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Approved for build': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  };

  const cls = colorMap[status] || 'bg-slate-500/15 text-slate-300 border-slate-500/20';

  return (
    <span className={`inline-flex items-center !px-2 !py-0.5 rounded-md text-[11px] font-medium border ${cls}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const colorMap = {
    'Low': 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    'Medium': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'High': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Urgent': 'bg-red-500/15 text-red-400 border-red-500/20',
  };
  const cls = colorMap[priority] || colorMap['Medium'];
  return (
    <span className={`inline-flex items-center !px-2 !py-0.5 rounded-md text-[11px] font-medium border ${cls}`}>
      {priority}
    </span>
  );
}

export function MetricCard({ icon: Icon, label, value, accent }) {
  const accentMap = {
    'indigo': 'text-indigo-400',
    'green': 'text-green-400',
    'amber': 'text-amber-400',
    'red': 'text-red-400',
    'blue': 'text-blue-400',
    'violet': 'text-violet-400',
    'cyan': 'text-cyan-400',
  };
  return (
    <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-xl !p-4 hover:border-[#3A3A45] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[#A0A0A0] font-medium uppercase tracking-wide">{label}</span>
        <Icon className={`w-4 h-4 ${accentMap[accent] || 'text-[#A0A0A0]'}`} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export function SectionCard({ title, children, action }) {
  return (
    <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between !px-5 !py-3.5 border-b border-[#1E1E26]">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {action}
      </div>
      <div className="!p-4">{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-[#A0A0A0] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center !py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#161620] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-[#3A3A45]" />
      </div>
      <p className="text-sm font-medium text-[#A0A0A0]">{title}</p>
      {subtitle && <p className="text-xs text-[#3A3A45] mt-1">{subtitle}</p>}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center !py-16">
      <div className="w-6 h-6 border-2 border-[#1E1E26] border-t-[#00F0FF] rounded-full animate-spin" />
    </div>
  );
}

export function AuditTrail({ record }) {
  const { users } = useUsers();

  if (!record || !record.id) return null;

  const creator = users.find(u => u.id === record.created_by_id);
  const createdName = creator?.full_name || creator?.email || 'Unknown user';
  const createdDate = record.created_date ? format(new Date(record.created_date), 'MMM d, yyyy · h:mm a') : null;
  const updatedDate = record.updated_date ? format(new Date(record.updated_date), 'MMM d, yyyy · h:mm a') : null;
  const wasEdited =
    record.updated_date &&
    record.created_date &&
    new Date(record.updated_date).getTime() !== new Date(record.created_date).getTime();

  if (!createdDate) return null;

  return (
    <div className="text-[10px] text-[#A0A0A0] border-t border-[#1E1E26] pt-3 mt-3 space-y-0.5">
      <p>
        Added by <span className="text-[#00F0FF] font-medium">{createdName}</span> on {createdDate}
      </p>
      {wasEdited && updatedDate && <p>Last edited on {updatedDate}</p>}
    </div>
  );
}