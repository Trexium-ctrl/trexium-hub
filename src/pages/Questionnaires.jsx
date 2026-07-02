import React, { useState, useEffect } from 'react';
import { base44 } from '@/lib/supabaseClient';
import { StatusBadge, PageHeader, LoadingState, EmptyState, AuditTrail } from '@/components/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileQuestion, Download, Trash2, Pencil, Upload, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['Blank template', 'Sent to customer', 'Completed', 'Needs clarification', 'Approved for build'];

export default function Questionnaires() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiDialog, setAiDialog] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [q, c, p] = await Promise.all([
        base44.entities.Questionnaire.list('-created_date', 200),
        base44.entities.Customer.list('-created_date', 200),
        base44.entities.Project.list('-created_date', 200),
      ]);
      setItems(q); setCustomers(c); setProjects(p);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Questionnaire Center"
        subtitle={`${items.length} questionnaires`}
        action={<Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-[#00F0FF] hover:bg-[#00C8D6] text-white"><Plus className="w-4 h-4 mr-1.5" />Add</Button>}
      />

      {items.length === 0 ? (
        <EmptyState icon={FileQuestion} title="No questionnaires" subtitle="Upload blank or completed questionnaires" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map(q => (
            <div key={q.id} className="bg-[#0D0D12] border border-[#1E1E26] rounded-xl p-4 hover:border-[#3A3A45] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#161620] flex items-center justify-center flex-shrink-0">
                    <FileQuestion className="w-4 h-4 text-[#A0A0A0]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#FFFFFF] truncate">{q.file_name}</p>
                    <p className="text-xs text-[#A0A0A0] truncate">{q.customer_name || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {q.file_url && <a href={q.file_url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-[#161620] hover:bg-[#1E1E26] flex items-center justify-center"><Download className="w-3 h-3 text-[#A0A0A0]" /></a>}
                  <button onClick={() => setAiDialog(q)} className="w-7 h-7 rounded-lg bg-[#161620] hover:bg-[#00F0FF]/20 flex items-center justify-center" title="AI Build Notes"><Sparkles className="w-3 h-3 text-[#A0A0A0] hover:text-[#00F0FF]" /></button>
                  <button onClick={() => { setEditing(q); setDialogOpen(true); }} className="w-7 h-7 rounded-lg bg-[#161620] hover:bg-[#1E1E26] flex items-center justify-center"><Pencil className="w-3 h-3 text-[#A0A0A0]" /></button>
                  <button onClick={async () => { await base44.entities.Questionnaire.delete(q.id); load(); }} className="w-7 h-7 rounded-lg bg-[#161620] hover:bg-red-500/20 flex items-center justify-center"><Trash2 className="w-3 h-3 text-[#A0A0A0] hover:text-red-400" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={q.status} />
                {q.ai_build_notes && <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" />AI notes</span>}
              </div>
              {q.notes && <p className="text-xs text-[#A0A0A0] mt-2 line-clamp-2">{q.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <QuestionnaireDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} customers={customers} projects={projects} onSaved={() => { setDialogOpen(false); load(); }} />
      <AIBuildDialog item={aiDialog} onClose={() => setAiDialog(null)} onSaved={load} />
    </div>
  );
}

function QuestionnaireDialog({ open, onClose, editing, customers, projects, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ status: 'Blank template' });
    setFile(null);
  }, [editing, open]);

  function set(field, val) { setForm(prev => ({ ...prev, [field]: val })); }

  function onCustomerChange(id) {
    const c = customers.find(c => c.id === id);
    set('customer_id', id);
    set('customer_name', c?.business_name || '');
  }

  async function handleSave() {
    setSaving(true);
    try {
      let file_url = form.file_url;
      if (file) {
        const res = await base44.integrations.Core.UploadFile({ file });
        file_url = res.file_url;
      }
      const payload = { ...form, file_url };
      if (editing) await base44.entities.Questionnaire.update(editing.id, payload);
      else await base44.entities.Questionnaire.create(payload);
      onSaved();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0D0D12] border-[#1E1E26] text-[#FFFFFF] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-[#FFFFFF]">{editing ? 'Edit Questionnaire' : 'Add Questionnaire'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-[#A0A0A0] text-xs">File Name *</Label><Input value={form.file_name || ''} onChange={e => set('file_name', e.target.value)} className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]" /></div>
          <div><Label className="text-[#A0A0A0] text-xs">Upload File</Label>
            <label className="mt-1 flex items-center gap-2 px-3 py-2.5 border border-dashed border-[#1E1E26] rounded-lg cursor-pointer hover:border-[#00F0FF] transition-colors">
              <Upload className="w-4 h-4 text-[#A0A0A0]" />
              <span className="text-xs text-[#A0A0A0] truncate">{file ? file.name : (form.file_url ? 'File already uploaded — click to replace' : 'Click to upload')}</span>
              <input type="file" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); set('file_name', f.name); } }} />
            </label>
          </div>
          <div><Label className="text-[#A0A0A0] text-xs">Customer</Label>
            <Select value={form.customer_id || ''} onValueChange={onCustomerChange}>
              <SelectTrigger className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]"><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent className="bg-[#0D0D12] border-[#1E1E26]">{customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[#FFFFFF] focus:bg-[#161620]">{c.business_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#A0A0A0] text-xs">Project</Label>
            <Select value={form.project_id || ''} onValueChange={v => set('project_id', v)}>
              <SelectTrigger className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent className="bg-[#0D0D12] border-[#1E1E26]">{projects.map(p => <SelectItem key={p.id} value={p.id} className="text-[#FFFFFF] focus:bg-[#161620]">{p.project_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#A0A0A0] text-xs">Status</Label>
            <Select value={form.status || 'Blank template'} onValueChange={v => set('status', v)}>
              <SelectTrigger className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#0D0D12] border-[#1E1E26]">{STATUSES.map(s => <SelectItem key={s} value={s} className="text-[#FFFFFF] focus:bg-[#161620]">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#A0A0A0] text-xs">Notes</Label><Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF] resize-none" /></div>
        </div>
        {editing && <AuditTrail record={editing} />}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#A0A0A0]">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.file_name} className="bg-[#00F0FF] hover:bg-[#00C8D6] text-white">{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AIBuildDialog({ item, onClose, onSaved }) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setNotes(item?.ai_build_notes || ''); }, [item]);

  async function handleSave() {
    setSaving(true);
    try {
      await base44.entities.Questionnaire.update(item.id, { ai_build_notes: notes });
      onSaved();
      onClose();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="bg-[#0D0D12] border-[#1E1E26] text-[#FFFFFF] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-[#FFFFFF] flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#00F0FF]" />AI Website Build Notes</DialogTitle></DialogHeader>
        <div>
          <Label className="text-[#A0A0A0] text-xs">Paste the final AI-generated plan here</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={14} className="mt-1.5 bg-[#050508] border-[#1E1E26] text-[#FFFFFF] resize-none font-mono text-xs" placeholder="Paste AI-generated website build plan..." />
        </div>
        {item && <AuditTrail record={item} />}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#A0A0A0]">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#00F0FF] hover:bg-[#00C8D6] text-white">{saving ? 'Saving...' : 'Save Notes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}