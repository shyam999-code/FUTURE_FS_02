require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────
// Allow requests from any frontend origin (set to your Vercel URL in production)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // e.g. https://nexus-crm.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// ── Supabase ───────────────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_API_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  WARNING: SUPABASE_URL or SUPABASE_API_KEY not set. DB routes will fail.');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);

// ── JWT ────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_crm_key_123';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied: No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Access denied: Invalid token' });
    req.user = user;
    next();
  });
};

// ── Routes ────────────────────────────────────────────────────────

// Root — status page (visit the URL to confirm backend is live)
app.get('/', (req, res) => {
  const uptime = process.uptime();
  const hrs  = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = Math.floor(uptime % 60);

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nexus CRM — Backend Status</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a; color: #e2e8f0;
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
    }
    .card {
      background: #1e293b; border: 1px solid #334155;
      border-radius: 16px; padding: 40px 48px; max-width: 480px; width: 90%;
      text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: #052e16; border: 1px solid #166534;
      color: #4ade80; border-radius: 999px;
      padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 28px;
    }
    .dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%;
           animation: pulse 1.5s infinite; }
    @keyframes pulse {
      0%,100%{ opacity:1; transform:scale(1); }
      50%{ opacity:0.5; transform:scale(1.4); }
    }
    h1 { font-size: 28px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; }
    p.sub { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
    .stat { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
    .stat-value { font-size: 18px; font-weight: 700; color: #e2e8f0; margin-top: 4px; }
    .endpoints { text-align: left; background: #0f172a; border-radius: 10px;
                 border: 1px solid #1e293b; padding: 16px; }
    .endpoint { display: flex; align-items: center; gap-10: 10px;
                font-size: 13px; padding: 6px 0; border-bottom: 1px solid #1e293b; }
    .endpoint:last-child { border-bottom: none; }
    .method { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
              margin-right: 10px; min-width: 44px; text-align:center; }
    .get  { background: #0c4a6e; color: #38bdf8; }
    .post { background: #14532d; color: #4ade80; }
    .put  { background: #451a03; color: #fb923c; }
    .del  { background: #450a0a; color: #f87171; }
    code { color: #a5b4fc; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><div class="dot"></div> Backend is Running</div>
    <h1>Nexus CRM API</h1>
    <p class="sub">Express + Supabase backend is live and healthy</p>

    <div class="stats">
      <div class="stat">
        <div class="stat-label">Status</div>
        <div class="stat-value" style="color:#4ade80">✓ Online</div>
      </div>
      <div class="stat">
        <div class="stat-label">Uptime</div>
        <div class="stat-value">${hrs}h ${mins}m ${secs}s</div>
      </div>
      <div class="stat">
        <div class="stat-label">Node.js</div>
        <div class="stat-value">${process.version}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Environment</div>
        <div class="stat-value">${process.env.NODE_ENV || 'production'}</div>
      </div>
    </div>

    <div class="endpoints">
      <div class="endpoint"><span class="method get">GET</span><code>/api/health</code></div>
      <div class="endpoint"><span class="method post">POST</span><code>/api/login</code></div>
      <div class="endpoint"><span class="method get">GET</span><code>/api/leads</code></div>
      <div class="endpoint"><span class="method post">POST</span><code>/api/leads</code></div>
      <div class="endpoint"><span class="method put">PUT</span><code>/api/leads/:id</code></div>
      <div class="endpoint"><span class="method del">DEL</span><code>/api/leads/:id</code></div>
    </div>
  </div>
</body>
</html>`);
});

// JSON health check (for automated monitoring)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nexus CRM Backend is running ✅', uptime: process.uptime() });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@crm.com' && password === 'admin123') {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { email, role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get all leads
app.get('/api/leads', authenticateToken, async (req, res) => {
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add lead
app.post('/api/leads', authenticateToken, async (req, res) => {
  const { name, email, source, status, notes } = req.body;
  const { data, error } = await supabase.from('leads').insert([{ name, email, source, status, notes }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: 'Lead added', data });
});

// Update lead
app.put('/api/leads/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, source, status, notes } = req.body;
  const { data, error } = await supabase.from('leads').update({ name, email, source, status, notes }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Lead updated', data });
});

// Delete lead
app.delete('/api/leads/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('leads').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Lead deleted', data });
});

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Nexus CRM Backend running on port ${PORT}`);
});