import { useState } from 'react';
import { supabase } from '../supabase';

/**
 * SupportModal - exact port of support.js injectSupportHTML() + FAB from original
 */
const SupportModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const showToast = (msg, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
    const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
    toast.className = `${bgColor} text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up pointer-events-auto transition-all duration-300 opacity-0 translate-y-4`;
    toast.innerHTML = `<i class="ph ${icon} text-xl"></i><span class="font-medium text-sm">${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.remove('opacity-0', 'translate-y-4'), 10);
    setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const insertData = {
        user_id: user?.id || null,
        subject,
        message,
        status: 'open',
        email: user?.email || 'Guest',
      };

      const { error: initialError } = await supabase.from('support_messages').insert([insertData]);
      if (initialError) {
        // fallback without email
        const { error: fallbackError } = await supabase.from('support_messages').insert([
          { user_id: user?.id || null, subject, message, status: 'open' }
        ]);
        if (fallbackError) throw fallbackError;
      }

      showToast('Message sent successfully!', 'success');
      setSubject('');
      setMessage('');
      closeModal();
    } catch (err) {
      console.error('Messaging Error:', err);
      if (err.message?.includes('does not exist') || err.message?.includes('Could not find')) {
        showToast('Support system not fully set up. Table missing.', 'error');
      } else {
        showToast('Failed to send message. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Extended Floating Action Button (FAB) - exact match to original */}
      <button
        onClick={openModal}
        className="open-support-btn fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-2xl shadow-indigo-200 border-2 border-indigo-500/20 flex items-center gap-3 fab-btn z-40 hover:bg-indigo-700 active:scale-95 group"
      >
        <div className="relative">
          <i className="ph ph-chat-centered-dots text-2xl group-hover:block transition-all"></i>
          <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-indigo-600"></span>
        </div>
        <span className="font-bold tracking-wide text-sm md:text-base pr-2">Send Message</span>
      </button>

      {/* Support Overlay */}
      {isOpen && (
        <div
          id="support-overlay"
          onClick={closeModal}
          className="fixed inset-0 bg-slate-900/40 z-[60] transition-opacity duration-300 backdrop-blur-sm"
        />
      )}

      {/* Support Modal - exact structure from support.js injectSupportHTML() */}
      <div
        id="support-modal"
        className={`fixed bottom-24 right-6 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-[70] transition-all duration-300 border border-slate-200 overflow-hidden ${
          isOpen ? 'opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-10'
        }`}
      >
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <i className="ph ph-chat-centered-dots text-xl"></i>
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">Send Message</h3>
              <p className="text-indigo-100 text-xs">We typically reply in a few hours</p>
            </div>
          </div>
          <button
            id="close-support-modal"
            onClick={closeModal}
            className="text-white/80 hover:text-white transition-colors"
          >
            <i className="ph ph-x text-2xl"></i>
          </button>
        </div>

        <form id="support-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <select
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-sm bg-slate-50"
            >
              <option value="">Select a topic...</option>
              <option value="feedback">Product Feedback</option>
              <option value="bug">Report a Bug</option>
              <option value="help">General Help</option>
              <option value="billing">Billing Inquiry</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Message</label>
            <textarea
              required
              rows="4"
              placeholder="How can we help you today?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-sm bg-slate-50 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><i className="ph ph-spinner-gap animate-spin text-lg"></i> Sending...</>
            ) : (
              <><i className="ph ph-paper-plane-tilt text-lg"></i> Send Message</>
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default SupportModal;
