import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { StatusBadge, PageHeader, LoadingState, EmptyState } from '@/components/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Building2, Pencil, Trash2, Phone, Mail, Globe, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['Active', 'Website in progress', 'Waiting on customer', 'Launched', 'Past due', 'Paused', 'Canceled'];

export default function Customers() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try { setCustomers(await base44.entities.Customer.list('-created_date', 200)); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.business_name?.toLowerCase().includes(search.toLowerCase()) || c.contact_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const mrr = customers.filter(c => c.status === 'Active' || c.status === 'Launched').reduce((s, c) => s + (c.monthly_payment_amount || 0), 0);

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Customers"
        subtitle={`${filtered.length} customers • $${mrr.toLocaleString()}/mo MRR`}
        action={<Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white"><Plus className="w-4 h-4 mr-1.5" />Add Customer</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search business, contact..." className="pl-9 bg-[#161B22] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58]" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-[#161B22] border-[#30363D] text-[#E6EDF3]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-[#161B22] border-[#30363D]">
            <SelectItem value="all" className="text-[#E6EDF3] focus:bg-[#21262D]">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No customers found" subtitle="Add your first customer or convert a lead" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(c => (
            <div key={c.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 hover:border-[#484F58] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#21262D] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-[#8B949E]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#E6EDF3] truncate">{c.business_name}</p>
                    <p className="text-xs text-[#8B949E] truncate">{c.contact_name || 'No contact'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(c); setDialogOpen(true); }} className="w-7 h-7 rounded-lg bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center"><Pencil className="w-3 h-3 text-[#8B949E]" /></button>
                  <button onClick={async () => { await base44.entities.Customer.delete(c.id); load(); }} className="w-7 h-7 rounded-lg bg-[#21262D] hover:bg-red-500/20 flex items-center justify-center"><Trash2 className="w-3 h-3 text-[#8B949E] hover:text-red-400" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <StatusBadge status={c.status} />
                {c.assigned_partner && <span className="text-[10px] text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">{c.assigned_partner}</span>}
              </div>
              <div className="space-y-1 text-xs text-[#8B949E]">
                {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {c.phone}</div>}
                {c.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {c.email}</div>}
                {c.website_url && <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {c.website_url}</div>}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#30363D]">
                <div className="flex items-center gap-1 text-xs">
                  <DollarSign className="w-3 h-3 text-green-400" />
                  <span className="text-[#E6EDF3] font-semibold">{c.monthly_payment_amount ? `$${c.monthly_payment_amount.toLocaleString()}/mo` : '—'}</span>
                </div>
                {c.payment_due_day && <span className="text-[10px] text-[#8B949E]">Due day {c.payment_due_day}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <CustomerDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} onSaved={() => { setDialogOpen(false); load(); }} />
    </div>
  );
}

function CustomerDialog({ open, onClose, editing, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ status: 'Active', assigned_partner: 'Owner' });
  }, [editing, open]);

  function set(field, val) { setForm(prev => ({ ...prev, [field]: val })); }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) await base44.entities.Customer.update(editing.id, form);
      else await base44.entities.Customer.create(form);
      onSaved();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-[#E6EDF3]">{editing ? 'Edit Customer' : 'Add Customer'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label className="text-[#8B949E] text-xs">Business Name *</Label><Input value={form.business_name || ''} onChange={e => set('business_name', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Contact Name</Label><Input value={form.contact_name || ''} onChange={e => set('contact_name', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Phone</Label><Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Email</Label><Input value={form.email || ''} onChange={e => set('email', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Website URL</Label><Input value={form.website_url || ''} onChange={e => set('website_url', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Domain Provider</Label><Input value={form.domain_provider || ''} onChange={e => set('domain_provider', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Hosting Status</Label><Input value={form.hosting_status || ''} onChange={e => set('hosting_status', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Service Package</Label><Input value={form.service_package || ''} onChange={e => set('service_package', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Monthly Payment Amount</Label><Input type="number" value={form.monthly_payment_amount || ''} onChange={e => set('monthly_payment_amount', parseFloat(e.target.value) || 0)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Setup Fee</Label><Input type="number" value={form.setup_fee || ''} onChange={e => set('setup_fee', parseFloat(e.target.value) || 0)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Hosting Fee</Label><Input type="number" value={form.hosting_fee || ''} onChange={e => set('hosting_fee', parseFloat(e.target.value) || 0)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Maintenance Fee</Label><Input type="number" value={form.maintenance_fee || ''} onChange={e => set('maintenance_fee', parseFloat(e.target.value) || 0)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Payment Due Day (1-31)</Label><Input type="number" min="1" max="31" value={form.payment_due_day || ''} onChange={e => set('payment_due_day', parseInt(e.target.value) || 0)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Payment Method</Label><Input value={form.payment_method || ''} onChange={e => set('payment_method', e.target.value)} placeholder="Stripe, Bank transfer..." className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Status</Label>
            <Select value={form.status || 'Active'} onValueChange={v => set('status', v)}>
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
          <div><Label className="text-[#8B949E] text-xs">Start Date</Label><Input type="date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div><Label className="text-[#8B949E] text-xs">Renewal Date</Label><Input type="date" value={form.renewal_date || ''} onChange={e => set('renewal_date', e.target.value)} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" /></div>
          <div className="sm:col-span-2"><Label className="text-[#8B949E] text-xs">Notes</Label><Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={3} className="mt-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] resize-none" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#8B949E]">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.business_name} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white">{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}