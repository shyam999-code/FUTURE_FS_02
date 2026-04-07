import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const SOURCES = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Other'];

const dummyLeads = [
  { id: 'dummy-1', name: 'John Doe',    email: 'john@gmail.com',    source: 'Website',      status: 'new',       notes: 'Interested in pricing', created_at: new Date().toISOString() },
  { id: 'dummy-2', name: 'Priya Sharma',email: 'priya@gmail.com',   source: 'LinkedIn',     status: 'new',       notes: 'Follow-up needed',      created_at: new Date().toISOString() },
  { id: 'dummy-3', name: 'Rahul Kumar', email: 'rahul@gmail.com',   source: 'Referral',     status: 'contacted', notes: 'Demo scheduled',        created_at: new Date().toISOString() },
  { id: 'dummy-4', name: 'Anita Desai', email: 'anita@example.com', source: 'Cold Call',    status: 'contacted', notes: 'Requested pricing doc',  created_at: new Date().toISOString() },
  { id: 'dummy-5', name: 'Ravi Menon',  email: 'ravi@example.com',  source: 'Social Media', status: 'converted', notes: 'Client onboarded',       created_at: new Date().toISOString() },
];

/* ─── Lead Card ────────────────────────────────────────────────── */
const LeadCard = ({ lead, onContact, onConvert, onEdit, onDelete, isAdmin, isDummy }) => {
  const [loading, setLoading] = useState(false);
  const initials = (lead.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const wrap = async (fn) => {
    if (isDummy) { alert('Cannot modify sample data. Add real leads first.'); return; }
    setLoading(true); await fn(); setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{lead.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{lead.email}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1"><i className="ph ph-globe"></i> {lead.source || 'Unknown'}</span>
        <span className="flex items-center gap-1"><i className="ph ph-calendar"></i> {formatDate(lead.created_at)}</span>
      </div>

      {lead.notes && (
        <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-2 leading-relaxed truncate">
          {lead.notes}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
        {lead.status === 'new' && (
          <button onClick={() => wrap(() => onContact(lead.id))} disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
            {loading ? <i className="ph ph-spinner-gap animate-spin"></i> : <i className="ph ph-phone-call"></i>}
            Contact
          </button>
        )}
        {lead.status === 'contacted' && (
          <button onClick={() => wrap(() => onConvert(lead.id))} disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-60">
            {loading ? <i className="ph ph-spinner-gap animate-spin"></i> : <i className="ph ph-magic-wand"></i>}
            Convert
          </button>
        )}
        <button onClick={() => onEdit(lead)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
          <i className="ph ph-pencil-simple text-base"></i>
        </button>
        {isAdmin && (
          <button onClick={() => wrap(() => onDelete(lead.id))} disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-60">
            <i className="ph ph-trash text-base"></i>
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Column ────────────────────────────────────────────────────── */
const Column = ({ title, count, accentClass, icon, children }) => (
  <div className="flex flex-col flex-1 min-w-[280px] max-w-[360px]">
    <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border border-b-0 ${accentClass}`}>
      <div className="flex items-center gap-2">
        <i className={`ph ${icon} text-lg`}></i>
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <span className="text-xs font-bold bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded-full">{count}</span>
    </div>
    <div className="flex-1 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-b-xl p-3 flex flex-col gap-3 min-h-[250px] overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-hide">
      {children}
    </div>
  </div>
);

/* ─── Add/Edit Modal ────────────────────────────────────────────── */
const LeadModal = ({ lead, onClose, onSaved }) => {
  const isEdit = !!lead?.id;
  const [name,   setName]   = useState(lead?.name   || '');
  const [email,  setEmail]  = useState(lead?.email  || '');
  const [source, setSource] = useState(lead?.source || 'Website');
  const [status, setStatus] = useState(lead?.status || 'new');
  const [notes,  setNotes]  = useState(lead?.notes  || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, email, source, status: status.toLowerCase(), notes };
    const { error } = isEdit
      ? await supabase.from('leads').update(payload).eq('id', lead.id)
      : await supabase.from('leads').insert([payload]);
    if (error) { alert(error.message); setSaving(false); return; }
    onSaved(); onClose();
  };

  const inputClass = "block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-fade-in-up my-4">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source</label>
              <select value={source} onChange={e => setSource(e.target.value)} className={inputClass}>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} />
          </div>
        </form>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="bg-white dark:bg-slate-700 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="bg-indigo-600 rounded-md py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70">
            {saving ? <><i className="ph ph-spinner-gap animate-spin mr-1"></i>Saving...</> : 'Save Lead'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main ──────────────────────────────────────────────────────── */
const Leads = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [allLeads,   setAllLeads]   = useState([]);
  const [isDummy,    setIsDummy]    = useState(false);
  const [search,     setSearch]     = useState('');
  const [editLead,   setEditLead]   = useState(null);
  const [modalOpen,  setModalOpen]  = useState(false);

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    if (data.length === 0) { setAllLeads(dummyLeads); setIsDummy(true); }
    else { setAllLeads(data); setIsDummy(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleContact = async (id) => { await supabase.from('leads').update({ status: 'contacted' }).eq('id', id); fetchLeads(); };
  const handleConvert = async (id) => { await supabase.from('leads').update({ status: 'converted' }).eq('id', id); fetchLeads(); };
  const handleDelete  = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await supabase.from('leads').delete().eq('id', id); fetchLeads();
  };

  const q = search.toLowerCase();
  const match = (l) => !q || l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q);
  const newLeads       = allLeads.filter(l => l.status === 'new'       && match(l));
  const contactedLeads = allLeads.filter(l => l.status === 'contacted' && match(l));
  const convertedLeads = allLeads.filter(l => l.status === 'converted' && match(l));

  const cardProps = (lead) => ({
    lead, onContact: handleContact, onConvert: handleConvert,
    onEdit: (l) => { setEditLead(l); setModalOpen(true); },
    onDelete: handleDelete, isAdmin, isDummy,
  });

  const EmptyState = ({ icon, label }) => (
    <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-slate-600 text-sm gap-2">
      <i className={`ph ${icon} text-3xl`}></i>
      <span>{label}</span>
    </div>
  );

  return (
    <Layout title="Lead Pipeline">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-full mx-auto animate-fade-in space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Lead Pipeline</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">New → Contacted → Converted</p>
            </div>
            <button onClick={() => { setEditLead({}); setModalOpen(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center">
              <i className="ph ph-plus text-lg"></i> Add New Lead
            </button>
          </div>

          {/* Dummy notice */}
          {isDummy && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium">
              <i className="ph ph-info text-xl shrink-0"></i>
              Showing sample data. Add real leads to get started.
            </div>
          )}

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <i className="ph ph-magnifying-glass text-lg"></i>
            </div>
            <input type="text" placeholder="Search leads..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm" />
          </div>

          {/* Kanban Board */}
          <div className="flex flex-row gap-4 overflow-x-auto pb-4 -mx-1 px-1">
            <Column title="New Leads" count={newLeads.length} icon="ph-user-plus"
              accentClass="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              {newLeads.length === 0 ? <EmptyState icon="ph-inbox" label="No new leads" /> : newLeads.map(l => <LeadCard key={l.id} {...cardProps(l)} />)}
            </Column>

            <div className="flex items-center justify-center shrink-0 px-1 self-center">
              <i className="ph ph-arrow-right text-2xl text-slate-300 dark:text-slate-600"></i>
            </div>

            <Column title="Contacted" count={contactedLeads.length} icon="ph-phone-call"
              accentClass="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
              {contactedLeads.length === 0 ? <EmptyState icon="ph-phone" label="No contacted leads" /> : contactedLeads.map(l => <LeadCard key={l.id} {...cardProps(l)} />)}
            </Column>

            <div className="flex items-center justify-center shrink-0 px-1 self-center">
              <i className="ph ph-arrow-right text-2xl text-slate-300 dark:text-slate-600"></i>
            </div>

            <Column title="Converted" count={convertedLeads.length} icon="ph-check-circle"
              accentClass="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
              {convertedLeads.length === 0 ? <EmptyState icon="ph-trophy" label="No converted leads" /> : convertedLeads.map(l => <LeadCard key={l.id} {...cardProps(l)} />)}
            </Column>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 max-w-sm">
            {[
              { label: 'New',       count: allLeads.filter(l=>l.status==='new').length,       color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Contacted', count: allLeads.filter(l=>l.status==='contacted').length, color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Converted', count: allLeads.filter(l=>l.status==='converted').length, color: 'text-green-600 dark:text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-center shadow-sm">
                <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {modalOpen && (
        <LeadModal lead={editLead} onClose={() => { setModalOpen(false); setEditLead(null); }} onSaved={fetchLeads} />
      )}
    </Layout>
  );
};

export default Leads;
