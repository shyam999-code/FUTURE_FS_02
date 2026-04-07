import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email,   setEmail]  = useState('Loading...');
  const [initial, setInitial]= useState('-');

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email);
        setInitial(session.user.email.charAt(0).toUpperCase());
      } else {
        setEmail('No active session.');
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <Layout title="Settings">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto animate-fade-in-up space-y-6">

          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and session.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8 border-b border-slate-200 dark:border-slate-700 pb-8">
              <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-2xl uppercase border-2 border-indigo-200 dark:border-indigo-700 flex-shrink-0">
                {initial}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Account</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Active Session</p>
                <div className="flex items-center gap-2">
                  <i className="ph ph-envelope-simple text-slate-400 dark:text-slate-500"></i>
                  <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{email}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Session Management</h5>
              <button onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">
                <i className="ph ph-sign-out text-lg"></i>
                Sign Out Completely
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Settings;
