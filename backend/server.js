require('dotenv').config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

const supabaseUrl = process.env.SUPABASE_URL || "https://pxshbdhttcakccnjbcqy.supabase.co";
const supabaseKey = process.env.SUPABASE_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4c2hiZGh0dGNha2NjbmpiY3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MDgzNzgsImV4cCI6MjA5MDE4NDM3OH0.2PuH6THih441q6rwB632FpPJVJ8ZrhAo8wYcN3r8WOw";

const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = "supersecret_crm_key_123";

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied: No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Access denied: Invalid token" });
    req.user = user;
    next();
  });
};

// Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // Hardcoded admin for simplicity, as per original setup
  if (email === "admin@crm.com" && password === "admin123") {
    const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { email, role: "admin" } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Test route / API check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "CRM Server is running" });
});

// Fallback to serve index.html for any unknown routes (SPA support)
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Create Lead
app.post("/add-lead", authenticateToken, async (req, res) => {
  const { name, email, source, status, notes } = req.body;

  const { data, error } = await supabase
    .from("leads")
    .insert([{ name, email, source, status, notes }]);

  if (error) {
    console.error("Supabase Error:", error);
    res.status(500).json({ error: "Error adding lead" });
  } else {
    res.status(201).json({ message: "Lead added successfully", data });
  }
});

// Get Leads
app.get("/leads", authenticateToken, async (req, res) => {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(200).json(data);
  }
});

// Update Lead
app.put("/leads/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, source, status, notes } = req.body;

  const { data, error } = await supabase
    .from("leads")
    .update({ name, email, source, status, notes })
    .eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(200).json({ message: "Lead updated", data });
  }
});

// Delete Lead
app.delete("/leads/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(200).json({ message: "Lead deleted", data });
  }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});