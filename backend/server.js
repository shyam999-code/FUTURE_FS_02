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

// Health check (Render uses this to confirm service is up)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nexus CRM Backend is running ✅' });
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