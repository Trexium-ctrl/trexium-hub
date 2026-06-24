import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { StatusBadge, PageHeader, LoadingState, EmptyState, MetricCard, AuditTrail } from '@/components/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, TrendingUp, AlertTriangle, Check, Trash2, Pencil } from 'lucide-react';
import { format, isThisWeek, isThisMonth, isToday, addDays, isWithinInterval } from 'date-fns';

const STATUSES = ['Paid', 'Due soon', 'Overdue', 'Canceled'];
const TYPES = ['Setup fee', 'Monthly hosting', 'Maintenance', 'Custom work'];

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [view, setView] = useState('week');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [p, c] = await Promise.all([
        base44.entities.Payment.list('-created_date', 200),
        base44.entities.Customer.list('-created_date', 200),
      ]);
      setPayments(p); setCustomers(c);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  if (loading) return <LoadingState />;

  const today = new Date();
  const activeCustomers = customers.filter(c => c.status === 'Active' || c.status === 'Launched');
  const mrr = activeCustomers.reduce((s, c) => s + (c.monthly_payment_amount || 0), 0);
  const setupFeesCollected = payments.filter(p => p.payment_type === 'Setup fee' && p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0);
  const hostingRevenue = payments.filter(p => p.payment_type === 'Monthly hosting' && p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0);
  const maintenanceRevenue = payments.filter(p => p.payment_type === 'Maintenance' && p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0);
  const totalRevenue = hostingRevenue + maintenanceRevenue + setupFeesCollected;
  const avgCustomerValue = activeCustomers.length > 0 ? Math.round(totalRevenue / activeCustomers.length) : 0;

  let filtered = payments;
  if (view === 'week') filtered = payments.filter(p => p.due_date && isThisWeek(new Date(p.due_date), { weekStartsOn: 1 }) && p.status !== 'Canceled');
  else if (view === 'month') filtered = payments.filter(p => p.due_date && isThisMonth(new Date(p.due_date)) && p.status !== 'Canceled');
  else if (view === 'overdue') filtered = payments.filter(p => p.status === 'Overdue');
  else if (view === 'canceled') filtered = payments.filter(p => p.status === 'Canceled');

  async function markPaid(pay) {
    await base44.entities.Payment.update(pay.id, { status: 'Paid', paid_date: format(today, 'yyyy-MM-dd') });
    load();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Payments"
        subtitle="Monthly revenue tracking"
        action={<Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-[#00F0FF] hover:bg-[#00C8D6] text-white"><Plus className="w-4 h-4 mr-1.5" />Add Payment</Button>}
      />

      {/* Revenue metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <MetricCard icon={TrendingUp} label="MRR" value={`$${mrr.toLocaleString()}`} accent="violet" />
        <MetricCard icon={DollarSign} label="Setup Fees" value={`$${setupFeesCollected.toLocaleString()}`} accent="indigo" />
        <MetricCard icon={DollarSign} label="Hosting Rev" value={`$${hostingRevenue.toLocaleString()}`} accent="green" />
        <MetricCard icon={DollarSign} label="Maintenance" value={`$${maintenanceRevenue.toLocaleString()}`} accent="blue" />
        <MetricCard icon={DollarSign} label="Avg Value" value={`$${avgCustomerValue.toLocaleString()}`} accent="cyan" />
        <MetricCard icon={TrendingUp} label="Active Customers" value={activeCustomers.length} accent="amber" />
      </div>

      {/* View tabs */}
      <div className="flex gap-1 mb-4 bg-[#0D0D12] border border-[#1E1E26] rounded-lg p-1 w-fit">
        {[
          { key: 'week', label: 'Due This Week' },
          { key: 'month', label: 'Due This Month' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'canceled', label: 'Canceled' },
          { key: 'all', label: 'All' },
        ].map(v => (
          <button key={v.key} onClick={() => setView(v.key)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === v.key ? 'bg-[#00F0FF] text-white' : 'text-[#A0A0A0] hover:text-[#FFFFFF]'}`}>{v.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={DollarSign} title="No payments in this view" />
      ) : (
        <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E26]">
                <th className="text-left text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wide px-4 py-2.5">Customer</th>
                <th className="text-left text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wide px-4 py-2.5">Type</th>
                <th className="text-right text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wide px-4 py-2.5">Amount</th>
                <th className="text-left text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wide px-4 py-2.5">Due Date</th>
                <th className="text-left text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wide px-4 py-2.5">Status</th>
                <th className="text-right text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wide px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(pay => (
                <tr key={pay.id} className="border-b border-[#1E1E26] hover:bg-[#161620]/50">
                  <td className="px-4 py-3 text-sm text-[#FFFFFF]">{pay.customer_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[#A0A0A0]">{pay.payment_type}</td>
                  <td className="px-4 py-3 text-sm text-[#FFFFFF] font-semibold text-right">${(pay.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-[#A0A0A0]">{pay.due_date ? format(new Date(pay.due_date), 'MMM d, yyyy') : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={pay.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {pay.status !== 'Paid' && pay.status !== 'Canceled' && (
                        <button onClick={() => markPaid(pay)} className="h-7 px-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Paid</button>
                      )}
                      <button onClick={() => { setEditing(pay); setDialogOpen(true); }} className="w-7 h-7 rounded-lg bg-[#161620] hover:bg-[#1E1E26] flex items-center justify-center"><Pencil className="w-3 h-3 text-[#A0A0A0]" /></button>
                      <button onClick={async () => { await base44.entities.Payment.delete(pay.id); load(); }} className="w-7 h-7 rounded-lg bg-[#161620] hover:bg-red-500/20 flex items-center justify-center"><Trash2 className="w-3 h-3 text-[#A0A0A0] hover:text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaymentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} customers={customers} onSaved={() => { setDialogOpen(false); load(); }} />
    </div>
  );
}

function PaymentDialog({ open, onClose, editing, customers, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ payment_type: 'Monthly hosting', status: 'Due soon' });
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
      if (editing) await base44.entities.Payment.update(editing.id, form);
      else await base44.entities.Payment.create(form);
      onSaved();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0D0D12] border-[#1E1E26] text-[#FFFFFF] max-w-lg">
        <DialogHeader><DialogTitle className="text-[#FFFFFF]">{editing ? 'Edit Payment' : 'Add Payment'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-[#A0A0A0] text-xs">Customer</Label>
            <Select value={form.customer_id || ''} onValueChange={onCustomerChange}>
              <SelectTrigger className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]"><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent className="bg-[#0D0D12] border-[#1E1E26]">{customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[#FFFFFF] focus:bg-[#161620]">{c.business_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[#A0A0A0] text-xs">Amount</Label><Input type="number" value={form.amount || ''} onChange={e => set('amount', parseFloat(e.target.value) || 0)} className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]" /></div>
            <div><Label className="text-[#A0A0A0] text-xs">Payment Type</Label>
              <Select value={form.payment_type || 'Monthly hosting'} onValueChange={v => set('payment_type', v)}>
                <SelectTrigger className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0D0D12] border-[#1E1E26]">{TYPES.map(t => <SelectItem key={t} value={t} className="text-[#FFFFFF] focus:bg-[#161620]">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[#A0A0A0] text-xs">Due Date</Label><Input type="date" value={form.due_date || ''} onChange={e => set('due_date', e.target.value)} className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]" /></div>
            <div><Label className="text-[#A0A0A0] text-xs">Paid Date</Label><Input type="date" value={form.paid_date || ''} onChange={e => set('paid_date', e.target.value)} className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[#A0A0A0] text-xs">Status</Label>
              <Select value={form.status || 'Due soon'} onValueChange={v => set('status', v)}>
                <SelectTrigger className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0D0D12] border-[#1E1E26]">{STATUSES.map(s => <SelectItem key={s} value={s} className="text-[#FFFFFF] focus:bg-[#161620]">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-[#A0A0A0] text-xs">Payment Method</Label><Input value={form.payment_method || ''} onChange={e => set('payment_method', e.target.value)} className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF]" /></div>
          </div>
          <div><Label className="text-[#A0A0A0] text-xs">Notes</Label><Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} className="mt-1 bg-[#050508] border-[#1E1E26] text-[#FFFFFF] resize-none" /></div>
        </div>
        {editing && <AuditTrail record={editing} />}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#A0A0A0]">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.customer_id} className="bg-[#00F0FF] hover:bg-[#00C8D6] text-white">{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}