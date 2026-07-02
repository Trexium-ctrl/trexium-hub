import React, { useState, useEffect } from 'react';
import { base44 } from '@/lib/supabaseClient';
import { PageHeader, LoadingState } from '@/components/shared';
import { format } from 'date-fns';

const entityConfigs = [
  { label: 'Lead', titleField: 'company_name', entity: base44.entities.Lead },
  { label: 'Customer', titleField: 'business_name', entity: base44.entities.Customer },
  { label: 'Project', titleField: 'project_name', entity: base44.entities.Project },
  { label: 'Payment', titleField: 'customer_name', entity: base44.entities.Payment },
  { label: 'Task', titleField: 'title', entity: base44.entities.Task },
  { label: 'Event', titleField: 'title', entity: base44.entities.CalendarEvent },
  { label: 'Questionnaire', titleField: 'file_name', entity: base44.entities.Questionnaire },
  { label: 'File', titleField: 'file_name', entity: base44.entities.ClientFile },
];

export default function ActivityLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, []);

  async function loadActivity() {
    setLoading(true);
    try {
      const results = await Promise.all(
        entityConfigs.map(async (cfg) => {
          try {
            const items = await cfg.entity.list('-updated_date', 20);
            return items.map(item => ({
              type: cfg.label,
              title: item[cfg.titleField] || 'Untitled',
              created_date: item.created_date,
              updated_date: item.updated_date,
              id: item.id,
            }));
          } catch {
            return [];
          }
        })
      );
      const all = results.flat().sort((a, b) =>
        new Date(b.updated_date || b.created_date || 0) - new Date(a.updated_date || a.created_date || 0)
      );
      setEntries(all.slice(0, 60));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="Activity Log" subtitle="Recent additions and edits across all modules" />

      {loading ? (
        <LoadingState />
      ) : entries.length === 0 ? (
        <p className="text-sm text-[#A0A0A0]">No activity yet.</p>
      ) : (
        <div className="space-y-1">
          {entries.map((entry, idx) => {
            const wasEdited = entry.updated_date && entry.created_date &&
              new Date(entry.updated_date).getTime() !== new Date(entry.created_date).getTime();
            const dateStr = entry.updated_date || entry.created_date;
            return (
              <div key={`${entry.type}-${entry.id}-${idx}`} className="flex items-start gap-3 p-3 rounded-lg bg-[#0D0D12] border border-[#1E1E26] hover:border-[#3A3A45] transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#00F0FF] mt-1.5 shrink-0 shadow-[0_0_6px_#00F0FF]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161620] text-[#A0A0A0] font-medium shrink-0">{entry.type}</span>
                    <p className="text-sm font-medium text-white truncate">{entry.title}</p>
                  </div>
                  <p className="text-[10px] text-[#A0A0A0] mt-0.5">
                    {wasEdited ? 'Edited' : 'Added'} {dateStr ? `on ${format(new Date(dateStr), 'MMM d, yyyy · h:mm a')}` : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}