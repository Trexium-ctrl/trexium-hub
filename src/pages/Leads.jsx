import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { StatusBadge, PriorityBadge, PageHeader, LoadingState, EmptyState } from '@/components/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Phone, Mail, Building2, Check, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { format, isToday } from 'date-fns';

const STATUSES = ['Not contacted', 'Contacted', 'Follow-up needed', 'Meeting booked', 'Questionnaire sent', 'Proposal sent', 'Won', 'Lost', 'Not interested'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const QUALITIES = ['None', 'Poor', 'Average', 'Good'];

export default function Leads() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [sortField, setSortField] = useState('next_follow_up_date');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [convertLead, setConvertLead] = useState(null);

  useEffect(() => { loadLeads(); }, []);

  async function loadLeads() {
    try {
      const data = await base44.entities.Lead.list('-created_date', 200);
      setLeads(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.company_name?.toLowerCase().includes(search.toLowerCase()) || l.contact_name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchPartner = partnerFilter === 'all' || l.assigned_partner === partnerFilter;
    return matchSearch && matchStatus && matchPartner;
  }).sort((a, b) => {
    if (sortField === 'next_follow_up_date') {
      const da = a.next_follow_up_date ? new Date(a.next_follow_up_date) : new Date(9999);
      const db = b.next_follow_up_date ? new Date(b.next_follow_up_date) : new Date(9999);
      return da - db;
    }
    if (sortField === 'priority') {
      const order = { High: 0, Medium: 1, Low: 2 };
      return (order[a.priority] || 1) - (order[b.priority] || 1);
    }
    if (sortField === 'estimated_value') {
      return (b.estimated_value || 0) - (a.estimated_value || 0);
    }
    return 0;
  });

  async function markContacted(lead) {
    await base44.entities.Lead.update(lead.id, {
      last_contacted_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Contacted'
    });
    loadLeads();
  }

  async function handleConvert() {
    if (!convertLead) return;
    try {
      await base44.entities.Customer.create({
        business_name: convertLead.company_name,
        contact_name: convertLead.contact_name || '',
        phone: convertLead.phone || '',
        email: convertLead.email || '',
        website_url: convertLead.website_url || '',
        status: 'Website in progress',
        assigned_partner: convertLead.assigned_partner || 'Owner',
        notes: `Converted from lead. Services: ${convertLead.services_needed || ''}. ${convertLead.notes || ''}`
      });
      await base44.entities.Lead.update(convertLead.id, { status: 'Won' });
      setConvertLead(null);
      loadLeads();
    } catch (err) { console.error(err); }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Leads"
        subtitle={`${filtered.length} companies to contact`}
        action={<Button onClick={() => { setEditingLead(null); setDialogOpen(true); }} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white"><Plus className="w-4 h-4 mr-1.5" />Add Lead</Button>}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company, contact, email..." className="pl-9 bg-[#161B22] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58]" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-[#161B22] border-[#30363D] text-[#E6EDF3]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-[#161B22] border-[#30363D]">
            <SelectItem value="all" className="text-[#E6EDF3] focus:bg-[#21262D]">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-[#161B22] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#161B22] border-[#30363D]">
            <SelectItem value="all" className="text-[#E6EDF3] focus:bg-[#21262D]">All partners</SelectItem>
            <SelectItem value="Owner" className="text-[#E6EDF3] focus:bg-[#21262D]">Owner</SelectItem>
            <SelectItem value="Partner" className="text-[#E6EDF3] focus:bg-[#21262D]">Partner</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortField} onValueChange={setSortField}>
          <SelectTrigger className="w-full sm:w-48 bg-[#161B22] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#161B22] border-[#30363D]">
            <SelectItem value="next_follow_up_date" className="text-[#E6EDF3] focus:bg-[#21262D]">Next follow-up</SelectItem>
            <SelectItem value="priority" className="text-[#E6EDF3] focus:bg-[#21262D]">Priority</SelectItem>
            <SelectItem value="estimated_value" className="text-[#E6EDF3] focus:bg-[#21262D]">Est. value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No leads found" subtitle="Add your first lead to get started" />
      ) : (
        <div className="space-y-2">
          {filtered.map(lead => {
            const isFollowUpToday = lead.next_follow_up_date && isToday(new Date(lead.next_follow_up_date));
            return (
              <div key={lead.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 hover:border-[#484F58] transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#21262D] flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-[#8B949E]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#E6EDF3]">{lead.company_name}</p>
                        <StatusBadge status={lead.status} />
                        <PriorityBadge priority={lead.priority} />
                        {isFollowUpToday && <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">FOLLOW UP TODAY</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-[#8B949E] flex-wrap">
                        {lead.contact_name && <span>{lead.contact_name}</span>}
                        {lead.industry && <span>• {lead.industry}</span>}
                        {lead.estimated_value && <span>• ${lead.estimated_value.toLocaleString()}</span>}
                        {lead.assigned_partner && <span>• {lead.assigned_partner}</span>}
                        {lead.next_follow_up_date && <span>• Next: {format(new Date(lead.next_follow_up_date), 'MMM d')}</span>}
                      </div>
                      {lead.notes && <p className="text-xs text-[#8B949E] mt-1 line-clamp-1">{lead.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="w-8 h-8 rounded-lg bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center" title="Call">
                        <Phone className="w-3.5 h-3.5 text-[#8B949E]" />
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="w-8 h-8 rounded-lg bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center" title="Email">
                        <Mail className="w-3.5 h-3.5 text-[#8B949E]" />
                      </a>
                    )}
                    {lead.status !== 'Won' && lead.status !== 'Lost' && lead.status !== 'Not interested' && (
                      <button onClick={() => markContacted(lead)} className="h-8 px-2.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1" title="Mark as contacted">
                        <Check className="w-3.5 h-3.5" /> Contacted
                      </button>
                    )}
                    {lead.status !== 'Won' && (
                      <button onClick={() => setConvertLead(lead)} className="h-8 px-2.5 rounded-lg bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] text-xs font-medium flex items-center gap-1" title="Convert to customer">
                        <ArrowRight className="w-3.5 h-3.5" /> Convert
                      </button>
                    )}
                    <button onClick={() => { setEditingLead(lead); setDialogOpen(true); }} className="w-8 h-8 rounded-lg bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center" title="Edit">
                      <Pencil className="w-3.5 h-3.5 text-[#8B949E]" />
                    </button>
                    <button onClick={async () => { await base44.entities.Lead.delete(lead.id); loadLeads(); }} className="w-8 h-8 rounded-lg bg-[#21262D] hover:bg-red-500/20 flex items-center justify-center" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-[#8B949E] hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LeadDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editingLead} onSaved={() => { setDialogOpen(false); loadLeads(); }} />

      {/* Convert confirmation */}
      <Dialog open={!!convertLead} onOpenChange={() => setConvertLead(null)}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E6EDF3]">Convert to Customer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#8B949E]">This will create a new customer from <span className="text-[#E6EDF3] font-medium">{convertLead?.company_name}</span> and mark the lead as Won.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConvertLead(null)} className="text-[#8B949E]">Cancel</Button>
            <Button onClick={handleConvert} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white">Convert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadDialog({ open, onClose, editing, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ status: 'Not contacted', priority: 'Medium', assigned_partner: 'Owner', current_website_quality: 'None' });
  }, [editing, open]);

  function set(field, val) { setForm(prev => ({ ...prev, [field]: val })); }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) await base44.entities.Lead.update(editing.id, form);
      else await base44.entities.Lead.create(form);
      onSaved();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-[#E6EDF3]">{editing ? 'Edit Lead' : 'Add Lead'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label className="text-[#8B949E] text-xs">Company Name *</Label><Input value={form.company_name || ''} onChange={e => set('company_name', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Industry</Label><Input value={form.industry || ''} onChange={e => set('industry', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Website URL</Label><Input value={form.website_url || ''} onChange={e => set('website_url', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Current Website Quality</Label>
            <Select value={form.current_website_quality || 'None'} onValueChange={v => set('current_website_quality', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">{QUALITIES.map(q => <SelectItem key={q} value={q} className="text-[#E6EDF3] focus:bg-[#21262D]">{q}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Contact Name</Label><Input value={form.contact_name || ''} onChange={e => set('contact_name', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Phone</Label><Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Email</Label><Input value={form.email || ''} onChange={e => set('email', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Location</Label><Input value={form.location || ''} onChange={e => set('location', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Source</Label><Input value={form.source || ''} onChange={e => set('source', e.target.value)} placeholder="Referral, Cold, etc." className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Estimated Value</Label><Input type="number" value={form.estimated_value || ''} onChange={e => set('estimated_value', parseFloat(e.target.value) || 0)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Status</Label>
            <Select value={form.status || 'Not contacted'} onValueChange={v => set('status', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">{STATUSES.map(s => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Priority</Label>
            <Select value={form.priority || 'Medium'} onValueChange={v => set('priority', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">{PRIORITIES.map(p => <SelectItem key={p} value={p} className="text-[#E6EDF3] focus:bg-[#21262D]">{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Assigned Partner</Label>
            <Select value={form.assigned_partner || 'Owner'} onValueChange={v => set('assigned_partner', v)}>
              <SelectTrigger className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]"><SelectItem value="Owner" className="text-[#E6EDF3] focus:bg-[#21262D]">Owner</SelectItem><SelectItem value="Partner" className="text-[#E6EDF3] focus:bg-[#21262D]">Partner</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className="text-[#8B949E] text-xs">Last Contacted</Label><Input type="date" value={form.last_contacted_date || ''} onChange={e => set('last_contacted_date', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Next Follow-Up</Label><Input type="date" value={form.next_follow_up_date || ''} onChange={e => set('next_follow_up_date', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div className="sm:col-span-2"><Label className="text-[#8B949E] text-xs">Services Needed</Label><Input value={form.services_needed || ''} onChange={e => set('services_needed', e.target.value)} placeholder="New website, SEO, maintenance..." className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div className="sm:col-span-2"><Label className="text-[#8B949E] text-xs">Notes</Label><Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={3} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] resize-none" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#8B949E]">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.company_name} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white">{saving ? 'Saving...' : 'Save Lead'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}