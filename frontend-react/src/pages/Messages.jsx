import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import Layout from '../components/Layout';

const getStatusStyle = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'open') return 'bg-amber-100 text-amber-800';
  if (s === 'read') return 'bg-blue-100 text-blue-800';
  if (s === 'resolved') return 'bg-emerald-100 text-emerald-800';
  return 'bg-slate-100 text-slate-800';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Messages page - exact port of messages.html + messages.js
 */
const Messages = () => {
  const [messagesData, setMessagesData] = useState([]);
  const [tableError, setTableError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('support_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setMessagesData(data);
      setTableError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setTableError(err);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('support_messages').update({ status }).eq('id', id);
      if (error) throw error;
      fetchMessages();
    } catch (err) { console.error('Error updating status:', err); alert('Error: ' + err.message); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error } = await supabase.from('support_messages').delete().eq('id', id);
      if (error) throw error;
      setModalOpen(false); setSelectedMsg(null);
      fetchMessages();
    } catch (err) { console.error('Error deleting:', err); alert('Error: ' + err.message); }
  };

  const openModal = async (msg) => {
    setSelectedMsg(msg); setModalOpen(true);
    if (msg.status === 'open') await updateStatus(msg.id, 'read');
  };

  const closeModal = () => { setModalOpen(false); setSelectedMsg(null); };

  const filteredData = (() => {
    let data = [...messagesData];
    const q = searchTerm.toLowerCase().trim();
    if (q) data = data.filter(m =>
      (m.subject?.toLowerCase().includes(q)) || (m.email?.toLowerCase().includes(q)) || (m.message?.toLowerCase().includes(q))
    );
    if (statusFilter !== 'All') data = data.filter(m => m.status === statusFilter);
    return data;
  })();

  const isMissingTable = tableError && (
    tableError.message?.includes('does not exist') ||
    tableError.message?.includes('Could not find the table') ||
    tableError.code === '42P01'
  );

  return (
    <Layout title="Support Messages">
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 scrollbar-hide flex flex-col">
        <div className="max-w-7xl mx-auto w-full animate-fade-in flex-1 flex flex-col">

          {/* Page Header */}
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Inbox</h3>
              <p className="text-sm text-slate-500 mt-1">Manage and respond to user inquiries and feedback.</p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-t-xl border-x border-t border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center w-full">
            <div className="relative w-full lg:w-96 text-slate-500 focus-within:text-indigo-600">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ph ph-magnifying-glass text-lg"></i>
              </div>
              <input
                type="text" id="search-input"
                placeholder="Search by subject or email..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <select
                id="status-filter" value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-slate-300 border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg cursor-pointer bg-white"
              >
                <option value="All">All Messages</option>
                <option value="open">Open</option>
                <option value="read">Read</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border text-left border-slate-200 rounded-b-xl shadow-sm overflow-hidden flex-1 relative min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Inquiry</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Received</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody id="messages-table-body" className="bg-white divide-y divide-slate-200">
                  {tableError ? (
                    isMissingTable ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                          <div className="max-w-md mx-auto">
                            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col items-center">
                              <i className="ph ph-database text-4xl text-indigo-600 mb-4 animate-bounce"></i>
                              <h4 className="text-lg font-bold text-slate-800 mb-2">Supabase Table Missing</h4>
                              <p className="text-sm text-slate-600 mb-6">The <code>support_messages</code> table hasn't been created yet.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                          <i className="ph ph-warning-circle text-4xl text-red-500 mb-2"></i>
                          <p className="text-slate-800 font-bold">Error loading messages</p>
                          <p className="text-slate-500 text-sm mt-1">{tableError.message}</p>
                        </td>
                      </tr>
                    )
                  ) : filteredData.length === 0 && messagesData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        <i className="ph ph-spinner-gap animate-spin text-3xl mb-2 inline-block"></i>
                        <p>Loading messages...</p>
                      </td>
                    </tr>
                  ) : filteredData.map(msg => (
                    <tr
                      key={msg.id}
                      onClick={() => openModal(msg)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer group ${msg.status === 'open' ? 'font-semibold' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold uppercase overflow-hidden">
                            {(msg.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{msg.email || 'Guest'}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[120px]">{msg.user_id ? 'Authenticated' : 'Unknown User'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{msg.subject}</div>
                        <div className="text-sm text-slate-500 truncate max-w-xs">{msg.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusStyle(msg.status)}`}>
                          {msg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(msg.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <i className="ph ph-eye text-xl"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredData.length === 0 && messagesData.length > 0 && (
              <div id="empty-state" className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <div className="mx-auto h-12 w-12 text-slate-400 mb-4">
                  <i className="ph ph-chat-centered-slash size-12 mb-2 text-slate-300"></i>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">No messages found</h3>
                <p className="mt-1 text-sm text-slate-500">Your inbox is clear! Good job.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Message Detail Modal */}
      {modalOpen && selectedMsg && (
        <div
          id="modal-overlay"
          onClick={(e) => { if (e.target.id === 'modal-overlay') closeModal(); }}
          className="fixed inset-0 bg-slate-900/50 z-[60] transition-opacity duration-300 grid place-items-center p-4 overflow-y-auto"
        >
          <div id="message-modal" className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-full">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">Message Details</h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-500 transition-colors">
                <i className="ph ph-x text-xl"></i>
              </button>
            </div>

            <div id="modal-content" className="overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Subject</h4>
                  <p className="text-lg font-bold text-slate-900">{selectedMsg.subject}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyle(selectedMsg.status)}`}>
                  {selectedMsg.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sender</h4>
                  <p className="text-sm font-medium text-slate-800">{selectedMsg.email || 'Guest'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Received</h4>
                  <p className="text-sm font-medium text-slate-800">{formatDate(selectedMsg.created_at)}</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message</h4>
                <div className="bg-white border border-slate-200 p-4 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px]">
                  {selectedMsg.message}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between gap-3 rounded-b-xl">
              <button
                type="button"
                id="btn-delete-msg"
                onClick={() => deleteMessage(selectedMsg.id)}
                className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
              >
                <i className="ph ph-trash"></i> Delete Message
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Close
                </button>
                {selectedMsg.status !== 'resolved' && (
                  <button
                    type="button"
                    id="btn-resolve-msg"
                    onClick={async () => { await updateStatus(selectedMsg.id, 'resolved'); closeModal(); }}
                    className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Messages;
