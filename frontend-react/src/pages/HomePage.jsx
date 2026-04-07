import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  // Lead form
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [source,    setSource]    = useState('Website');
  const [notes,     setNotes]     = useState('');
  const [submitting,setSubmitting]= useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);

  // Admin login modal
  const [loginOpen,    setLoginOpen]    = useState(false);
  const [loginEmail,   setLoginEmail]   = useState('');
  const [loginPassword,setLoginPassword]= useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError,   setLoginError]   = useState(null);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const { error } = await supabase.from('leads').insert([{
      name: name.trim(), email: email.trim(), source, status: 'new', notes: notes.trim() || null,
    }]);
    setSubmitting(false);
    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('permission')) {
        setFormError('Submission is currently restricted. Please ask your admin to enable public inserts on the leads table in Supabase.');
      } else {
        setFormError(error.message);
      }
    } else {
      setSubmitted(true);
      setName(''); setEmail(''); setSource('Website'); setNotes('');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPassword });
    if (error) {
      let msg = error.message;
      if (msg.includes('Invalid login credentials')) msg = 'Incorrect email or password.';
      if (msg.includes('rate limit')) msg = 'Too many attempts. Please wait a moment.';
      setLoginError(msg);
      setLoginLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const inputClass = "block w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-8 h-16 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <i className="ph ph-chart-line-up text-white text-lg"></i>
          </div>
          <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Nexus CRM</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button onClick={toggleTheme}
            className="h-9 w-9 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={isDark ? 'Light Mode' : 'Dark Mode'}>
            <i className={`ph ${isDark ? 'ph-sun' : 'ph-moon'} text-xl`}></i>
          </button>

          {/* Admin Login */}
          <button onClick={() => { setLoginOpen(true); setLoginError(null); }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-700 font-medium text-sm transition-all">
            <i className="ph ph-shield-check text-lg"></i>
            <span className="hidden sm:inline">Admin Login</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-2xl animate-fade-in-up">

          {/* Hero */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-indigo-100 dark:border-indigo-800">
              <i className="ph ph-sparkle"></i> Get in Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Let's Start a Conversation
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-base sm:text-lg">
              Fill in your details and our team will reach out shortly.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-indigo-600 px-6 sm:px-8 py-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <i className="ph ph-user-plus text-xl"></i> Contact Information
              </h3>
              <p className="text-indigo-200 text-sm mt-1">Fields marked * are required.</p>
            </div>

            <div className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-8 animate-fade-in-up">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <i className="ph ph-check-circle text-green-600 dark:text-green-400 text-4xl"></i>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Thanks, {name || 'there'}!</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">We've received your information and will reach out soon.</p>
                  <button onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Submit another response
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-5">
                  {formError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3 flex items-start gap-2">
                      <i className="ph ph-warning-circle text-lg shrink-0 mt-0.5"></i>
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" required placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">How did you hear about us?</label>
                    <select value={source} onChange={e => setSource(e.target.value)} className={inputClass}>
                      {['Website','Referral','Social Media','Cold Call','Other'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message / Notes</label>
                    <textarea rows="4" placeholder="Tell us what you're looking for..." value={notes} onChange={e => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors shadow-indigo-200 shadow-lg disabled:opacity-75">
                    {submitting ? <><i className="ph ph-spinner-gap animate-spin text-lg"></i> Submitting...</> : <><i className="ph ph-paper-plane-tilt text-lg"></i> Submit</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
            Your information is safe and will never be shared with third parties.
          </p>
        </div>
      </main>

      {/* Admin Login Modal */}
      {loginOpen && (
        <>
          <div onClick={() => setLoginOpen(false)} className="fixed inset-0 bg-slate-900/60 z-[60] backdrop-blur-sm" />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
              <div className="bg-indigo-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                    <i className="ph ph-shield-check text-xl text-white"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight text-white">Admin Login</h3>
                    <p className="text-indigo-200 text-xs">Restricted access</p>
                  </div>
                </div>
                <button onClick={() => setLoginOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <i className="ph ph-x text-2xl"></i>
                </button>
              </div>
              <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
                {loginError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2 flex items-center gap-2">
                    <i className="ph ph-warning-circle"></i> {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" required placeholder="admin@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input type="password" required placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className={inputClass} />
                </div>
                <button type="submit" disabled={loginLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-75">
                  {loginLoading ? <><i className="ph ph-spinner-gap animate-spin text-lg"></i> Signing in...</> : <><i className="ph ph-sign-in text-lg"></i> Sign In</>}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
