import { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

/**
 * Login page - exact port of frontend/index.html
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [message, setMessage] = useState(null); // { text, isError }
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (em) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(em)) return 'Invalid email format.';
    if (em.toLowerCase() === 'admin@example.com') return "The email 'admin@example.com' is invalid. Please use a real email.";
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);
    const validationError = validateEmail(email.trim());
    if (validationError) { setMessage({ text: validationError, isError: true }); return; }

    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      let errorMsg = error.message;
      if (error.message.includes('rate limit')) errorMsg = 'Email rate limit exceeded. Please wait a few minutes before trying again or check your Supabase settings.';
      else if (error.message.includes('Invalid login credentials')) errorMsg = 'Incorrect email or password. Please try again.';
      setMessage({ text: errorMsg, isError: true });
      setLoginLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignUp = async () => {
    setMessage(null);
    if (!email || !password) { setMessage({ text: 'Please enter both email and password to sign up.', isError: true }); return; }
    const validationError = validateEmail(email.trim());
    if (validationError) { setMessage({ text: validationError, isError: true }); return; }

    setSignupLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { role } }
    });

    if (error) {
      let errorMsg = error.message;
      if (error.message.includes('rate limit')) errorMsg = 'Email rate limit exceeded. If you are testing, please disable \'Confirm Email\' in Supabase Dashboard or wait 1 hour.';
      setMessage({ text: errorMsg, isError: true });
    } else {
      if (data.session) await supabase.auth.signOut();
      setMessage({ text: `Account (${role}) created successfully! You can now Sign In.`, isError: false });
    }
    setSignupLoading(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
      {/* Login Card - exact match to index.html */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">

        {/* Header */}
        <div className="bg-indigo-600 px-8 py-10 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Nexus CRM</h1>
          <p className="text-indigo-200 mt-2 text-sm">Welcome back. Please sign in to continue.</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form id="loginForm" onSubmit={handleLogin} className="space-y-6">

            {/* Message Box */}
            {message && (
              <div className={`text-sm mb-4 text-center font-medium border rounded p-2 ${
                message.isError
                  ? 'text-red-500 bg-red-50 border-red-200'
                  : 'text-green-600 bg-green-50 border-green-200'
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email" id="email" required
                placeholder="name@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password" id="password" required
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 text-sm"
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Login As</label>
              <div className="grid grid-cols-2 gap-3" id="role-selector">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-4 rounded-lg border-2 font-semibold text-sm transition-all focus:outline-none flex items-center justify-center gap-2 ${
                    role === 'admin'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <i className="ph ph-shield-check text-lg"></i> Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-2 px-4 rounded-lg border-2 font-semibold text-sm transition-all focus:outline-none flex items-center justify-center gap-2 ${
                    role === 'user'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <i className="ph ph-user text-lg"></i> User
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loginLoading || signupLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors shadow-indigo-200 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loginLoading ? 'Authenticating...' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loginLoading || signupLoading}
                className="w-full flex justify-center py-3 px-4 border border-indigo-600 rounded-lg shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {signupLoading ? 'Processing...' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
