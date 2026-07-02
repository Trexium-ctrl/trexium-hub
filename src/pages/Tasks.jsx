import React, { useState, useEffect } from 'react';
import { base44 } from '@/lib/supabaseClient';
import { StatusBadge, PriorityBadge, PageHeader, LoadingState, EmptyState, AuditTrail } from '@/components/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckSquare, Trash2, Pencil, Check } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';

const STATUSES = ['To do', 'In progress', 'Waiting on customer', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function Tasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [t, c, p] = await Promise.all([
        base44.entities.Task.list('-created_date', 200),
        base44.entities.Customer.list('-created_date', 200),
        base44.entities.Project.list('-created_date', 200),
      ]);
      setTasks(t); setCustomers(c); setProjects(p);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)) && t.status !== 'Done';
    return t.status === filter;
  }).sort((a, b) => {
    const statusOrder = { 'To do': 0, 'In progress': 1, 'Waiting on customer': 2, 'Done': 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
  });

  async function toggleDone(task) {
    const newStatus = task.status === 'Done' ? 'To do' : 'Done';
    await base44.entities.Task.update(task.id, { status: newStatus });
    load();
  }

  if (loading) return <LoadingState />;

  const columns = [
    { key: 'To do', title: 'To Do', color: 'border-slate-500/30' },
    { key: 'In progress', title: 'In Progress', color: 'border-blue-500/30' },
    { key: 'Waiting on customer', title: 'Waiting on Customer', color: 'border-amber-500/30' },
    { key: 'Done', title: 'Done', color: 'border-green-500/30' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.filter(t => t.status !== 'Done').length} open tasks`}
        action={<Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white"><Plus className="w-4 h-4 mr-1.5" />Add Task</Button>}
      />

      <div className="flex gap-1 mb-4 bg-[#0D0D12] border border-[#30363D] rounded-lg p-1 w-fit overflow-x-auto">
        {['all', 'To do', 'In progress', 'Waiting on customer', 'Done', 'overdue'].map(v => (
          <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${filter === v ? 'bg-[#7C3AED] text-white' : 'text-[#8B949E] hover:text-[#E6EDF3]'}`}>{v === 'overdue' ? 'Overdue' : v}</button>
        ))}
      </div>

      {filter !== 'all' ? (
        <div className="space-y-2">
          {filtered.length === 0 ? <EmptyState icon={CheckSquare} title="No tasks here" /> : filtered.map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleDone(task)} onEdit={() => { setEditing(task); setDialogOpen(true); }} onDelete={async () => { await base44.entities.Task.delete(task.id); load(); }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {columns.map(col => {
            const colTasks = filtered.filter(t => t.status === col.key);
            return (
              <div key={col.key} className={`bg-[#0D0D12] border-t-2 ${col.color} border-x border-b border-[#30363D] rounded-xl p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-[#E6EDF3]">{col.title}</h3>
                  <span className="text-[10px] text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.length === 0 ? <p className="text-xs text-[#484F58] text-center py-4">No tasks</p> : colTasks.map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleDone(task)} onEdit={() => { setEditing(task); setDialogOpen(true); }} onDelete={async () => { await base44.entities.Task.delete(task.id); load(); }} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} customers={customers} projects={projects} onSaved={() => { setDialogOpen(false); load(); }} />
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && task.status !== 'Done';
  return (
    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 hover:border-[#484F58] transition-colors">
      <div className="flex items-start gap-2">
        <button onClick={onToggle} className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${task.status === 'Done' ? 'bg-green-500 border-green-500' : 'border-[#30363D] hover:border-[#7C3AED]'}`}>
          {task.status === 'Done' && <Check className="w-3 h-3 text-white" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-medium ${task.status === 'Done' ? 'text-[#8B949E] line-through' : 'text-[#E6EDF3]'}`}>{task.title}</p>
          {task.related_customer_name && <p className="text-[10px] text-[#8B949E] mt-0.5 truncate">{task.related_customer_name}</p>}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <PriorityBadge priority={task.priority} />
            {task.assigned_to && <span className="text-[10px] text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">{task.assigned_to}</span>}
            {task.due_date && <span className={`text-[10px] px-1.5 py-0.5 rounded ${isOverdue ? 'text-red-400 bg-red-500/10' : 'text-[#8B949E] bg-[#21262D]'}`}>{format(new Date(task.due_date), 'MMM d')}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={onEdit} className="w-6 h-6 rounded bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center"><Pencil className="w-2.5 h-2.5 text-[#8B949E]" /></button>
          <button onClick={onDelete} className="w-6 h-6 rounded bg-[#21262D] hover:bg-red-500/20 flex items-center justify-center"><Trash2 className="w-2.5 h-2.5 text-[#8B949E] hover:text-red-400" /></button>
        </div>
      </div>
    </div>
  );
}

function TaskDialog({ open, onClose, editing, customers, projects, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ status: 'To do', priority: 'Medium', assigned_to: 'Owner' });
  }, [editing, open]);

  function set(field, val) { setForm(prev => ({ ...prev, [field]: val })); }

  function onCustomerChange(id) {
    const c = customers.find(c => c.id === id);
    set('related_customer_id', id);
    set('related_customer_name', c?.business_name || '');
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) await base44.entities.Task.update(editing.id, form);
      else await base44.entities.Task.create(form);
      onSaved();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0D0D12] border-[#30363D] text-[#E6EDF3] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-[#E6EDF3]">{editing ? 'Edit Task' : 'Add Task'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-[#8B949E] text-xs">Task Title *</Label><Input value={form.title || ''} onChange={e => set('title', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Description</Label><Textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={2} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[#8B949E] text-xs">Related Customer</Label>
              <Select value={form.related_customer_id || ''} onValueChange={onCustomerChange}>
                <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent className="bg-[#0D0D12] border-[#30363D]">{customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[#E6EDF3] focus:bg-[#21262D]">{c.business_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-[#8B949E] text-xs">Related Project</Label>
              <Select value={form.related_project_id || ''} onValueChange={v => set('related_project_id', v)}>
                <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent className="bg-[#0D0D12] border-[#30363D]">{projects.map(p => <SelectItem key={p.id} value={p.id} className="text-[#E6EDF3] focus:bg-[#21262D]">{p.project_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[#8B949E] text-xs">Assigned To</Label>
              <Select value={form.assigned_to || 'Owner'} onValueChange={v => set('assigned_to', v)}>
                <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0D0D12] border-[#30363D]"><SelectItem value="Owner" className="text-[#E6EDF3] focus:bg-[#21262D]">Owner</SelectItem><SelectItem value="Partner" className="text-[#E6EDF3] focus:bg-[#21262D]">Partner</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label className="text-[#8B949E] text-xs">Priority</Label>
              <Select value={form.priority || 'Medium'} onValueChange={v => set('priority', v)}>
                <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0D0D12] border-[#30363D]">{PRIORITIES.map(p => <SelectItem key={p} value={p} className="text-[#E6EDF3] focus:bg-[#21262D]">{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[#8B949E] text-xs">Due Date</Label><Input type="date" value={form.due_date || ''} onChange={e => set('due_date', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
            <div><Label className="text-[#8B949E] text-xs">Status</Label>
              <Select value={form.status || 'To do'} onValueChange={v => set('status', v)}>
                <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0D0D12] border-[#30363D]">{STATUSES.map(s => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Notes</Label><Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] resize-none" /></div>
        </div>
        {editing && <AuditTrail record={editing} />}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#8B949E]">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white">{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}