import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Layout from '../components/Layout';

const dummyLeads = [
  { id: 'dummy-1', name: 'John Doe',    status: 'new',       source: 'Website' },
  { id: 'dummy-2', name: 'Priya Sharma',status: 'contacted', source: 'LinkedIn' },
  { id: 'dummy-3', name: 'Rahul Kumar', status: 'converted', source: 'Referral' },
  { id: 'dummy-4', name: 'Anita Desai', status: 'new',       source: 'Cold Call' },
];

const Analytics = () => {
  const [leads,  setLeads]  = useState([]);
  const [isDummy,setIsDummy]= useState(false);
  const [loading,setLoading]= useState(true);
  const [modal,  setModal]  = useState(null); // { title, leads }

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from('leads').select('name, status, source');
      if (error) { console.error(error); setLoading(false); return; }
      if (data.length === 0) { setLeads(dummyLeads); setIsDummy(true); }
      else { setLeads(data); setIsDummy(false); }
      setLoading(false);
    };
    fetch();
  }, []);

  const statusCounts = {
    new:       leads.filter(l => l.status?.toLowerCase() === 'new').length,
    contacted: leads.filter(l => l.status?.toLowerCase() === 'contacted').length,
    converted: leads.filter(l => l.status?.toLowerCase() === 'converted').length,
  };
  const sources = ['Website','Referral','Social Media','Cold Call'];
  const sourceCounts = Object.fromEntries(
    sources.map(s => [s, leads.filter(l => l.source?.toLowerCase() === s.toLowerCase()).length])
  );

  const statuses = [
    { label: 'New',       val: 'new',       style: 'bg-blue-100  text-blue-800  dark:bg-blue-900/40  dark:text-blue-300'  },
    { label: 'Contacted', val: 'contacted', style: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
    { label: 'Converted', val: 'converted', style: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  ];

  const cell = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm";
  const row  = "flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group";

  return (
    <Layout title="Analytics">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto animate-fade-in-up space-y-6">

          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Lead Insights</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time statistics of your sales pipeline.</p>
          </div>

          {isDummy && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium">
              <i className="ph ph-info text-xl shrink-0"></i>
              Showing sample data. Add real leads to get started.
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <i className="ph ph-spinner-gap animate-spin text-4xl text-indigo-500 block mx-auto mb-3"></i>
              Loading analytics...
            </div>
          ) : (
            <>
              {/* Total */}
              <div onClick={() => setModal({ title: 'All', leads })}
                className={`${cell} p-6 flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Total Managed Leads</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{leads.length}</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <i className="ph ph-chart-pie-slice text-3xl"></i>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Status */}
                <div className={`${cell} p-6`}>
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">Leads by Status</h4>
                  <div className="space-y-1">
                    {statuses.map(s => (
                      <div key={s.val} onClick={() => setModal({ title: s.label, leads: leads.filter(l => l.status?.toLowerCase() === s.val) })} className={row}>
                        <span className="text-slate-600 dark:text-slate-400 font-medium text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{s.label}</span>
                        <span className={`${s.style} px-3 py-1 rounded-full font-bold text-xs`}>{statusCounts[s.val]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Source */}
                <div className={`${cell} p-6`}>
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">Leads by Source</h4>
                  <div className="space-y-1">
                    {sources.map(s => (
                      <div key={s} onClick={() => setModal({ title: s, leads: leads.filter(l => l.source?.toLowerCase() === s.toLowerCase()) })} className={row}>
                        <span className="text-slate-600 dark:text-slate-400 font-medium text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{s}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{sourceCounts[s]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Drilldown Modal */}
      {modal && (
        <div onClick={(e) => e.target === e.currentTarget && setModal(null)}
          className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">{modal.title} Leads</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <i className="ph ph-x text-xl"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {modal.leads.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No leads in this category.</p>
              ) : (
                <ul className="space-y-2">
                  {modal.leads.map((l, i) => (
                    <li key={l.id || i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                          {l.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{l.name || 'Unknown'}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize bg-white dark:bg-slate-700 px-2 py-1 border border-slate-200 dark:border-slate-600 rounded shadow-sm">{l.status || 'new'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Analytics;
