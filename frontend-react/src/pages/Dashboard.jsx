import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const dummyLeads = [
  { id: 'dummy-1', name: 'John Doe',    email: 'john@gmail.com',    source: 'Website',   status: 'new',       created_at: new Date().toISOString() },
  { id: 'dummy-2', name: 'Priya Sharma',email: 'priya@gmail.com',   source: 'LinkedIn',  status: 'contacted', created_at: new Date().toISOString() },
  { id: 'dummy-3', name: 'Rahul Kumar', email: 'rahul@gmail.com',   source: 'Referral',  status: 'converted', created_at: new Date().toISOString() },
  { id: 'dummy-4', name: 'Anita Desai', email: 'anita@example.com', source: 'Cold Call', status: 'new',       created_at: new Date().toISOString() },
];

const getStatusStyle = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'new')       return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
  if (s === 'contacted') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  if (s === 'converted') return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const Dashboard = () => {
  const { user } = useAuth();
  const username = user?.email
    ? user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'there';

  const [totalLeads,     setTotalLeads]     = useState('--');
  const [contactedLeads, setContactedLeads] = useState('--');
  const [convertedLeads, setConvertedLeads] = useState('--');
  const [recentLeads,    setRecentLeads]    = useState([]);
  const [isDummy,        setIsDummy]        = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        let finalData = data;
        if (data.length === 0) { finalData = dummyLeads; setIsDummy(true); }
        else { setIsDummy(false); }

        setTotalLeads(finalData.length);
        setContactedLeads(finalData.filter(l => l.status?.toLowerCase() === 'contacted').length);
        setConvertedLeads(finalData.filter(l => l.status?.toLowerCase() === 'converted').length);
        setRecentLeads(finalData.slice(0, 5));
      } catch (err) {
        console.error('Dashboard error:', err);
      }
    };
    fetchDashboardData();
  }, []);

  const StatCard = ({ to, label, value, icon, hoverColor, iconBg, iconColor }) => (
    <Link to={to} className={`block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-6 flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}>
      <div>
        <p className={`text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:${hoverColor} transition-colors`}>{label}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`h-12 w-12 rounded-full ${iconBg} flex items-center justify-center ${iconColor} transition-colors flex-shrink-0`}>
        <i className={`ph ${icon} text-2xl`}></i>
      </div>
    </Link>
  );

  return (
    <Layout title="Overview">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto animate-fade-in-up space-y-6">

          {/* Dummy warning */}
          {isDummy && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium">
              <i className="ph ph-info text-xl shrink-0"></i>
              Showing sample data. Add real leads to get started.
            </div>
          )}

          {/* Welcome */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {username}! 👋</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your leads today.</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard to="/leads" label="Total Leads"     value={totalLeads}     icon="ph-users"         hoverColor="text-indigo-600" iconBg="bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50"   iconColor="text-blue-600 dark:text-blue-400" />
            <StatCard to="/leads?filter=Contacted" label="Contacted" value={contactedLeads} icon="ph-phone-call"    hoverColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-900/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50" iconColor="text-amber-600 dark:text-amber-400" />
            <StatCard to="/leads?filter=Converted" label="Converted" value={convertedLeads} icon="ph-check-circle"  hoverColor="text-green-600" iconBg="bg-green-50 dark:bg-green-900/30 group-hover:bg-green-100 dark:group-hover:bg-green-900/50"  iconColor="text-green-600 dark:text-green-400" />
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">Recent Activity</h4>
              <Link to="/leads" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1">
                View All <i className="ph ph-arrow-right"></i>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Added On</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                  {recentLeads.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        <i className="ph ph-spinner-gap animate-spin text-xl inline-block mb-2"></i><br />
                        Loading recent leads...
                      </td>
                    </tr>
                  ) : recentLeads.map(lead => (
                    <tr key={lead.id} onClick={() => window.location.href = '/leads'} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer group">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase flex-shrink-0">
                            {lead.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{lead.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusStyle(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
