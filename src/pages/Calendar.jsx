import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, LoadingState, EmptyState } from '@/components/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalIcon, ChevronLeft, ChevronRight, Clock, Trash2, Pencil } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, startOfWeek as sow, endOfWeek as eow, addDays, isToday as isTodayFn } from 'date-fns';

const EVENT_TYPES = ['Sales call', 'Follow-up call', 'Customer meeting', 'Website planning', 'Build day', 'Revision deadline', 'Launch date', 'Payment due', 'Monthly maintenance', 'Internal meeting'];
const TYPE_COLORS = {
  'Sales call': 'text-blue-400 bg-blue-500/10',
  'Follow-up call': 'text-amber-400 bg-amber-500/10',
  'Customer meeting': 'text-violet-400 bg-violet-500/10',
  'Website planning': 'text-cyan-400 bg-cyan-500/10',
  'Build day': 'text-indigo-400 bg-indigo-500/10',
  'Revision deadline': 'text-orange-400 bg-orange-500/10',
  'Launch date': 'text-green-400 bg-green-500/10',
  'Payment due': 'text-red-400 bg-red-500/10',
  'Monthly maintenance': 'text-slate-300 bg-slate-500/10',
  'Internal meeting': 'text-cyan-400 bg-cyan-500/10',
};

export default function Calendar() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [ev, l, c, p] = await Promise.all([
        base44.entities.CalendarEvent.list('-created_date', 200),
        base44.entities.Lead.list('-created_date', 200),
        base44.entities.Customer.list('-created_date', 200),
        base44.entities.Project.list('-created_date', 200),
      ]);
      setEvents(ev); setLeads(l); setCustomers(c); setProjects(p);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  if (loading) return <LoadingState />;

  const eventsByDate = {};
  events.forEach(ev => {
    const d = format(new Date(ev.start_datetime), 'yyyy-MM-dd');
    if (!eventsByDate[d]) eventsByDate[d] = [];
    eventsByDate[d].push(ev);
  });

  const sortedEvents = [...events].sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

  const today = new Date();
  const todayEvents = sortedEvents.filter(e => isSameDay(new Date(e.start_datetime), today));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = sow(monthStart, { weekStartsOn: 0 });
  const calEnd = eow(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Calendar"
        subtitle={`${events.length} events`}
        action={<Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white"><Plus className="w-4 h-4 mr-1.5" />Add Event</Button>}
      />

      {/* View toggle + navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-medium text-[#E6EDF3] bg-[#21262D] hover:bg-[#30363D] rounded-lg">Today</button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, -1))} className="w-8 h-8 rounded-lg bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center"><ChevronLeft className="w-4 h-4 text-[#8B949E]" /></button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="w-8 h-8 rounded-lg bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center"><ChevronRight className="w-4 h-4 text-[#8B949E]" /></button>
          <span className="text-sm font-semibold text-[#E6EDF3] ml-1">{view === 'list' ? 'All Events' : format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}</span>
        </div>
        <div className="flex gap-1 bg-[#161B22] border border-[#30363D] rounded-lg p-1">
          {['month', 'week', 'today', 'list'].map(v => (
            <button key={v} onClick={() => { setView(v); if (v === 'today') setCurrentDate(new Date()); }} className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${view === v ? 'bg-[#7C3AED] text-white' : 'text-[#8B949E] hover:text-[#E6EDF3]'}`}>{v}</button>
          ))}
        </div>
      </div>

      {view === 'month' && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#30363D]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="px-2 py-2 text-center text-[10px] font-semibold text-[#8B949E] uppercase">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[key] || [];
              const inMonth = isSameMonth(day, currentDate);
              const isToday = isTodayFn(day);
              return (
                <div key={key} className={`min-h-[80px] sm:min-h-[100px] border-b border-r border-[#30363D] p-1.5 ${!inMonth ? 'bg-[#0D1117]/50' : ''}`}>
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center' : inMonth ? 'text-[#E6EDF3]' : 'text-[#484F58]'}`}>{format(day, 'd')}</div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => (
                      <div key={ev.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${TYPE_COLORS[ev.event_type] || 'text-slate-300 bg-slate-500/10'}`}>{ev.title}</div>
                    ))}
                    {dayEvents.length > 3 && <div className="text-[10px] text-[#8B949E] px-1">+{dayEvents.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {weekDays.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[key] || [];
            const isToday = isTodayFn(day);
            return (
              <div key={key} className={`bg-[#161B22] border rounded-xl p-3 min-h-[120px] ${isToday ? 'border-[#7C3AED]' : 'border-[#30363D]'}`}>
                <p className={`text-xs font-semibold mb-2 ${isToday ? 'text-[#7C3AED]' : 'text-[#E6EDF3]'}`}>{format(day, 'EEE d')}</p>
                <div className="space-y-1">
                  {dayEvents.map(ev => (
                    <div key={ev.id} className={`text-[10px] px-1.5 py-1 rounded ${TYPE_COLORS[ev.event_type] || 'text-slate-300 bg-slate-500/10'}`}>
                      <p className="font-medium truncate">{ev.title}</p>
                      <p className="text-[#8B949E]">{format(new Date(ev.start_datetime), 'h:mm a')}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'today' && (
        <div className="space-y-2">
          {todayEvents.length === 0 ? <EmptyState icon={CalIcon} title="No events today" /> : todayEvents.map(ev => <EventRow key={ev.id} event={ev} onEdit={() => { setEditing(ev); setDialogOpen(true); }} onDelete={async () => { await base44.entities.CalendarEvent.delete(ev.id); load(); }} />)}
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-2">
          {sortedEvents.length === 0 ? <EmptyState icon={CalIcon} title="No events" /> : sortedEvents.map(ev => <EventRow key={ev.id} event={ev} onEdit={() => { setEditing(ev); setDialogOpen(true); }} onDelete={async () => { await base44.entities.CalendarEvent.delete(ev.id); load(); }} />)}
        </div>
      )}

      <EventDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} leads={leads} customers={customers} projects={projects} onSaved={() => { setDialogOpen(false); load(); }} />
    </div>
  );
}

function EventRow({ event, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#161B22] border border-[#30363D] rounded-xl hover:border-[#484F58] transition-colors">
      <div className={`px-2 py-1 rounded text-[10px] font-medium ${TYPE_COLORS[event.event_type] || 'text-slate-300 bg-slate-500/10'}`}>{event.event_type}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#E6EDF3] truncate">{event.title}</p>
        <p className="text-xs text-[#8B949E] flex items-center gap-1.5"><Clock className="w-3 h-3" />{format(new Date(event.start_datetime), 'MMM d, h:mm a')}{event.end_datetime && ` → ${format(new Date(event.end_datetime), 'h:mm a')}`}</p>
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="w-7 h-7 rounded-lg bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center"><Pencil className="w-3 h-3 text-[#8B949E]" /></button>
        <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-[#21262D] hover:bg-red-500/20 flex items-center justify-center"><Trash2 className="w-3 h-3 text-[#8B949E] hover:text-red-400" /></button>
      </div>
    </div>
  );
}

function EventDialog({ open, onClose, editing, leads, customers, projects, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ event_type: 'Customer meeting', assigned_partner: 'Owner', reminder_enabled: false, start_datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm"), end_datetime: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm") });
  }, [editing, open]);

  function set(field, val) { setForm(prev => ({ ...prev, [field]: val })); }

  async function handleSave() {
    setSaving(true);
    try {
      const leadObj = leads.find(l => l.id === form.related_lead_id);
      if (editing) await base44.entities.CalendarEvent.update(editing.id, form);
      else await base44.entities.CalendarEvent.create(form);
      onSaved();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-[#E6EDF3]">{editing ? 'Edit Event' : 'Add Event'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-[#8B949E] text-xs">Event Title *</Label><Input value={form.title || ''} onChange={e => set('title', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Event Type</Label>
            <Select value={form.event_type || 'Customer meeting'} onValueChange={v => set('event_type', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">{EVENT_TYPES.map(t => <SelectItem key={t} value={t} className="text-[#E6EDF3] focus:bg-[#21262D]">{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[#8B949E] text-xs">Start</Label><Input type="datetime-local" value={form.start_datetime ? format(new Date(form.start_datetime), "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => set('start_datetime', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
            <div><Label className="text-[#8B949E] text-xs">End</Label><Input type="datetime-local" value={form.end_datetime ? format(new Date(form.end_datetime), "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => set('end_datetime', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Related Lead</Label>
            <Select value={form.related_lead_id || ''} onValueChange={v => set('related_lead_id', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">{leads.map(l => <SelectItem key={l.id} value={l.id} className="text-[#E6EDF3] focus:bg-[#21262D]">{l.company_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Related Customer</Label>
            <Select value={form.related_customer_id || ''} onValueChange={v => set('related_customer_id', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">{customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[#E6EDF3] focus:bg-[#21262D]">{c.business_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Related Project</Label>
            <Select value={form.related_project_id || ''} onValueChange={v => set('related_project_id', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">{projects.map(p => <SelectItem key={p.id} value={p.id} className="text-[#E6EDF3] focus:bg-[#21262D]">{p.project_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Assigned Partner</Label>
            <Select value={form.assigned_partner || 'Owner'} onValueChange={v => set('assigned_partner', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]"><SelectItem value="Owner" className="text-[#E6EDF3] focus:bg-[#21262D]">Owner</SelectItem><SelectItem value="Partner" className="text-[#E6EDF3] focus:bg-[#21262D]">Partner</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="reminder" checked={!!form.reminder_enabled} onChange={e => set('reminder_enabled', e.target.checked)} className="w-4 h-4 rounded border-[#30363D] accent-[#7C3AED]" />
            <Label htmlFor="reminder" className="text-xs text-[#8B949E]">Enable reminder</Label>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Notes</Label><Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] resize-none" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#8B949E]">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white">{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}