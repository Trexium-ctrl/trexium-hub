import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { StatusBadge, PageHeader, LoadingState, EmptyState } from '@/components/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, FolderKanban, Pencil, Trash2, Check, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['Not started', 'Waiting on questionnaire', 'Planning', 'Design started', 'Development started', 'Waiting on content', 'Waiting on customer review', 'Revisions', 'Ready to launch', 'Launched', 'Maintenance'];
const TYPES = ['New website', 'Redesign', 'Landing page', 'E-commerce', 'Maintenance'];
const CHECKLIST = [
  { key: 'customer_added', label: 'Customer added' },
  { key: 'questionnaire_sent', label: 'Questionnaire sent' },
  { key: 'questionnaire_completed', label: 'Questionnaire completed' },
  { key: 'domain_info_received', label: 'Domain info received' },
  { key: 'logo_received', label: 'Logo received' },
  { key: 'photos_received', label: 'Photos received' },
  { key: 'copy_written', label: 'Website copy written' },
  { key: 'homepage_built', label: 'Homepage built' },
  { key: 'inner_pages_built', label: 'Inner pages built' },
  { key: 'mobile_checked', label: 'Mobile version checked' },
  { key: 'contact_form_tested', label: 'Contact form tested' },
  { key: 'seo_added', label: 'SEO basics added' },
  { key: 'analytics_added', label: 'Analytics added' },
  { key: 'customer_approved', label: 'Customer approved' },
  { key: 'website_launched', label: 'Website launched' },
  { key: 'payment_confirmed', label: 'Invoice/payment confirmed' },
];

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailProject, setDetailProject] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [p, c] = await Promise.all([
        base44.entities.Project.list('-created_date', 200),
        base44.entities.Customer.list('-created_date', 200),
      ]);
      setProjects(p);
      setCustomers(c);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const filtered = projects.filter(p => statusFilter === 'all' || p.status === statusFilter);

  async function toggleChecklist(project, key) {
    await base44.entities.Project.update(project.id, { [key]: !project[key] });
    load();
    if (detailProject?.id === project.id) {
      setDetailProject({ ...project, [key]: !project[key] });
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Projects"
        subtitle={`${filtered.length} projects`}
        action={<Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white"><Plus className="w-4 h-4 mr-1.5" />Add Project</Button>}
      />

      <div className="mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-56 bg-[#161B22] border-[#30363D] text-[#E6EDF3]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent className="bg-[#161B22] border-[#30363D]">
            <SelectItem value="all" className="text-[#E6EDF3] focus:bg-[#21262D]">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects found" subtitle="Add your first project" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(p => {
            const completed = CHECKLIST.filter(c => p[c.key]).length;
            const pct = Math.round((completed / CHECKLIST.length) * 100);
            return (
              <div key={p.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 hover:border-[#484F58] transition-colors cursor-pointer" onClick={() => setDetailProject(p)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#E6EDF3] truncate">{p.project_name}</p>
                    <p className="text-xs text-[#8B949E] truncate">{p.customer_name || 'No customer'}</p>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditing(p); setDialogOpen(true); }} className="w-7 h-7 rounded-lg bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center"><Pencil className="w-3 h-3 text-[#8B949E]" /></button>
                    <button onClick={async () => { await base44.entities.Project.delete(p.id); load(); }} className="w-7 h-7 rounded-lg bg-[#21262D] hover:bg-red-500/20 flex items-center justify-center"><Trash2 className="w-3 h-3 text-[#8B949E] hover:text-red-400" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <StatusBadge status={p.status} />
                  <span className="text-[10px] text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">{p.project_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#6E56CF] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-[#8B949E] font-medium tabular-nums">{completed}/{CHECKLIST.length}</span>
                </div>
                {p.target_launch_date && <p className="text-[10px] text-[#8B949E] mt-2">Target launch: {format(new Date(p.target_launch_date), 'MMM d, yyyy')}</p>}
              </div>
            );
          })}
        </div>
      )}

      <ProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} customers={customers} onSaved={() => { setDialogOpen(false); load(); }} />

      {/* Detail dialog with checklist */}
      <Dialog open={!!detailProject} onOpenChange={() => setDetailProject(null)}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#E6EDF3]">{detailProject.project_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={detailProject.status} />
                  <span className="text-xs text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded">{detailProject.project_type}</span>
                  <span className="text-xs text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded">{detailProject.assigned_partner}</span>
                </div>
                <div>
                  <p className="text-xs text-[#8B949E] mb-2 uppercase tracking-wide font-medium">Project Checklist</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {CHECKLIST.map(item => (
                      <label key={item.key} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#21262D] cursor-pointer">
                        <Checkbox checked={!!detailProject[item.key]} onCheckedChange={() => toggleChecklist(detailProject, item.key)} className="border-[#30363D] data-[state=checked]:bg-[#7C3AED] data-[state=checked]:border-[#7C3AED]" />
                        <span className={`text-xs ${detailProject[item.key] ? 'text-[#8B949E] line-through' : 'text-[#E6EDF3]'}`}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {detailProject.notes && (
                  <div>
                    <p className="text-xs text-[#8B949E] mb-1 uppercase tracking-wide font-medium">Notes</p>
                    <p className="text-sm text-[#E6EDF3] bg-[#0D1117] border border-[#30363D] rounded-lg p-3">{detailProject.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectDialog({ open, onClose, editing, customers, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ status: 'Not started', project_type: 'New website', assigned_partner: 'Owner' });
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
      if (editing) await base44.entities.Project.update(editing.id, form);
      else await base44.entities.Project.create(form);
      onSaved();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-[#E6EDF3]">{editing ? 'Edit Project' : 'Add Project'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><Label className="text-[#8B949E] text-xs">Project Name *</Label><Input value={form.project_name || ''} onChange={e => set('project_name', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Customer</Label>
            <Select value={form.customer_id || ''} onValueChange={onCustomerChange}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">{customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[#E6EDF3] focus:bg-[#21262D]">{c.business_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Project Type</Label>
            <Select value={form.project_type || 'New website'} onValueChange={v => set('project_type', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">{TYPES.map(t => <SelectItem key={t} value={t} className="text-[#E6EDF3] focus:bg-[#21262D]">{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Status</Label>
            <Select value={form.status || 'Not started'} onValueChange={v => set('status', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">{STATUSES.map(s => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Assigned Partner</Label>
            <Select value={form.assigned_partner || 'Owner'} onValueChange={v => set('assigned_partner', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]"><SelectItem value="Owner" className="text-[#E6EDF3] focus:bg-[#21262D]">Owner</SelectItem><SelectItem value="Partner" className="text-[#E6EDF3] focus:bg-[#21262D]">Partner</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Website Package</Label><Input value={form.website_package || ''} onChange={e => set('website_package', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Start Date</Label><Input type="date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Target Launch Date</Label><Input type="date" value={form.target_launch_date || ''} onChange={e => set('target_launch_date', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Actual Launch Date</Label><Input type="date" value={form.actual_launch_date || ''} onChange={e => set('actual_launch_date', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div className="sm:col-span-2"><Label className="text-[#8B949E] text-xs">Notes</Label><Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={3} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] resize-none" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#8B949E]">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.project_name} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white">{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}