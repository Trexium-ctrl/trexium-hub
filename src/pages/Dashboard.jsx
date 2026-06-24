import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MetricCard, SectionCard, StatusBadge, LoadingState, EmptyState } from '@/components/shared';
import {
  Users, Building2, FolderKanban, DollarSign, AlertTriangle, Calendar as CalIcon,
  Phone, ArrowRight, Clock, TrendingUp, UserCheck
} from 'lucide-react';
import { format, isToday, isThisWeek, addDays, isWithinInterval, startOfWeek } from 'date-fns';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [l, c, p, pay, ev] = await Promise.all([
        base44.entities.Lead.list('-created_date', 200),
        base44.entities.Customer.list('-created_date', 200),
        base44.entities.Project.list('-created_date', 200),
        base44.entities.Payment.list('-created_date', 200),
        base44.entities.CalendarEvent.list('-created_date', 100),
      ]);
      setLeads(l);
      setCustomers(c);
      setProjects(p);
      setPayments(pay);
      setEvents(ev);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState />;

  const today = new Date();
  const todayFollowUps = leads.filter(l => l.next_follow_up_date && isToday(new Date(l.next_follow_up_date)) && l.status !== 'Won' && l.status !== 'Lost' && l.status !== 'Not interested');
  const activeCustomers = customers.filter(c => c.status === 'Active' || c.status === 'Launched' || c.status === 'Website in progress');
  const activeProjects = projects.filter(p => p.status !== 'Launched' && p.status !== 'Maintenance' && p.status !== 'Not started');
  const mrr = customers.filter(c => c.status === 'Active' || c.status === 'Launched').reduce((sum, c) => sum + (c.monthly_payment_amount || 0), 0);
  const paymentsDueThisWeek = payments.filter(p => p.due_date && isThisWeek(new Date(p.due_date), { weekStartsOn: 1 }) && p.status !== 'Paid' && p.status !== 'Canceled');
  const overduePayments = payments.filter(p => p.status === 'Overdue');
  const waitingOnCustomer = projects.filter(p => p.status === 'Waiting on content' || p.status === 'Waiting on customer review' || p.status === 'Waiting on questionnaire');
  const upcomingEvents = events.filter(e => {
    const d = new Date(e.start_datetime);
    return isWithinInterval(d, { start: today, end: addDays(today, 7) });
  }).sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)).slice(0, 5);

  return (
    <div className="!p-6 max-w-7xl mx-auto">
      {/* Welcome section */}
      <div className="mb-6">
        <p className="text-xs text-[#00F0FF] font-medium uppercase tracking-wider mb-1">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        <h1 className="text-2xl font-bold text-white">Command Center</h1>
        <p className="text-sm text-[#A0A0A0] mt-1">
          {todayFollowUps.length} follow-ups today • {paymentsDueThisWeek.length} payments due this week • ${mrr.toLocaleString()}/mo MRR
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <MetricCard icon={Users} label="Total Leads" value={leads.length} accent="indigo" />
        <MetricCard icon={Phone} label="Follow-Ups Today" value={todayFollowUps.length} accent="amber" />
        <MetricCard icon={Building2} label="Active Customers" value={activeCustomers.length} accent="green" />
        <MetricCard icon={FolderKanban} label="Active Projects" value={activeProjects.length} accent="blue" />
        <MetricCard icon={TrendingUp} label="Monthly Revenue" value={`$${mrr.toLocaleString()}`} accent="violet" />
        <MetricCard icon={DollarSign} label="Due This Week" value={paymentsDueThisWeek.length} accent="amber" />
        <MetricCard icon={AlertTriangle} label="Overdue" value={overduePayments.length} accent="red" />
        <MetricCard icon={CalIcon} label="Upcoming Events" value={upcomingEvents.length} accent="cyan" />
        <MetricCard icon={UserCheck} label="Waiting on Customer" value={waitingOnCustomer.length} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Follow-Ups */}
        <SectionCard title="Today's Follow-Ups" action={<Link to="/leads" className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>}>
          {todayFollowUps.length === 0 ? (
            <EmptyState icon={Phone} title="No follow-ups today" subtitle="You're all caught up" />
          ) : (
            <div className="space-y-2">
              {todayFollowUps.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center justify-between !p-3 rounded-lg bg-[#050508] border border-[#1E1E26] hover:border-[#3A3A45] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{lead.company_name}</p>
                    <p className="text-xs text-[#A0A0A0]">{lead.contact_name} • {lead.priority} priority</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={lead.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Active Projects */}
        <SectionCard title="Active Projects" action={<Link to="/projects" className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>}>
          {activeProjects.length === 0 ? (
            <EmptyState icon={FolderKanban} title="No active projects" />
          ) : (
            <div className="space-y-2">
              {activeProjects.slice(0, 5).map(proj => {
                const checklistItems = ['customer_added','questionnaire_sent','questionnaire_completed','domain_info_received','logo_received','photos_received','copy_written','homepage_built','inner_pages_built','mobile_checked','contact_form_tested','seo_added','analytics_added','customer_approved','website_launched','payment_confirmed'];
                const completed = checklistItems.filter(k => proj[k]).length;
                const pct = Math.round((completed / checklistItems.length) * 100);
                return (
                  <div key={proj.id} className="!p-3 rounded-lg bg-[#050508] border border-[#1E1E26] hover:border-[#3A3A45] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-white truncate">{proj.project_name}</p>
                      <StatusBadge status={proj.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#161620] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00F0FF] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-[#A0A0A0] font-medium tabular-nums">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Upcoming Payments */}
        <SectionCard title="Upcoming Payments" action={<Link to="/payments" className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>}>
          {paymentsDueThisWeek.length === 0 && overduePayments.length === 0 ? (
            <EmptyState icon={DollarSign} title="No upcoming payments" />
          ) : (
            <div className="space-y-2">
              {[...overduePayments, ...paymentsDueThisWeek].slice(0, 5).map(pay => (
                <div key={pay.id} className="flex items-center justify-between !p-3 rounded-lg bg-[#050508] border border-[#1E1E26]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{pay.customer_name || 'Unknown'}</p>
                    <p className="text-xs text-[#A0A0A0]">${pay.amount?.toLocaleString() || 0} • {pay.due_date ? format(new Date(pay.due_date), 'MMM d') : 'No date'}</p>
                  </div>
                  <StatusBadge status={pay.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Calendar Preview */}
        <SectionCard title="Calendar Preview" action={<Link to="/calendar" className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1">View calendar <ArrowRight className="w-3 h-3" /></Link>}>
          {upcomingEvents.length === 0 ? (
            <EmptyState icon={CalIcon} title="No upcoming events" subtitle="Next 7 days are clear" />
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 !p-3 rounded-lg bg-[#050508] border border-[#1E1E26]">
                  <div className="w-10 text-center flex-shrink-0">
                    <p className="text-[10px] text-[#A0A0A0] uppercase">{format(new Date(ev.start_datetime), 'MMM')}</p>
                    <p className="text-base font-bold text-white leading-none">{format(new Date(ev.start_datetime), 'd')}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{ev.title}</p>
                    <p className="text-xs text-[#A0A0A0]">{format(new Date(ev.start_datetime), 'h:mm a')} • {ev.event_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}